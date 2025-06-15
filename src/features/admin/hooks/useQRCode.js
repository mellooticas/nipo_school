// features/admin/hooks/useQRCode.js - VERSÃO COM SUPABASE REAL
import { useState, useEffect } from 'react';
import { supabase } from '../../../shared/lib/supabase/supabaseClient';

export const useQRCode = () => {
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Buscar todas as aulas com processamento de QR
  const fetchAulas = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('aulas')
        .select('*')
        .order('numero', { ascending: true });

      if (error) throw error;

      // Processar detalhes_aula JSONB para extrair QR Code
      const aulasProcessadas = data.map(aula => ({
        ...aula,
        qr_code: aula.detalhes_aula?.qr_code || null,
        qr_gerado_em: aula.detalhes_aula?.qr_gerado_em || null,
        qr_ativo: aula.detalhes_aula?.qr_ativo || false
      }));

      setAulas(aulasProcessadas);
      return aulasProcessadas;
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar aulas:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Gerar QR Code para uma aula (usando função SQL)
  const gerarQRCode = async (aulaNumero) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Gerando QR Code para aula:', aulaNumero);

      // Chamar função SQL que criamos anteriormente
      const { data, error } = await supabase.rpc('gerar_qr_aula', {
        aula_numero: aulaNumero
      });

      if (error) {
        console.error('Erro RPC:', error);
        throw error;
      }

      console.log('QR Code gerado:', data);

      // Atualizar estado local
      await fetchAulas();
      
      return data; // Retorna o QR Code gerado
    } catch (err) {
      setError(err.message);
      console.error('Erro ao gerar QR Code:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Validar QR Code escaneado
  const validarQRCode = async (qrCode, alunoId) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Validando QR Code:', qrCode);

      // Verificar formato básico
      if (!qrCode.startsWith('NIPO_AULA_')) {
        throw new Error('QR Code inválido para Nipo School');
      }

      // Extrair número da aula do QR Code
      const partes = qrCode.split('_');
      if (partes.length < 4) {
        throw new Error('Formato de QR Code inválido');
      }

      const aulaNumero = parseInt(partes[2]);
      if (isNaN(aulaNumero)) {
        throw new Error('Número da aula inválido');
      }

      // Buscar aula correspondente no banco
      const { data: aulaData, error: aulaError } = await supabase
        .from('aulas')
        .select('*')
        .eq('numero', aulaNumero)
        .single();

      if (aulaError) {
        console.error('Erro ao buscar aula:', aulaError);
        throw new Error('Aula não encontrada');
      }

      // Verificar se QR Code corresponde ao ativo
      const qrAtivo = aulaData.detalhes_aula?.qr_code;
      if (!qrAtivo || qrAtivo !== qrCode) {
        throw new Error('QR Code expirado ou inválido');
      }

      // Verificar se QR está ativo
      if (!aulaData.detalhes_aula?.qr_ativo) {
        throw new Error('QR Code inativo');
      }

      // Verificar se aula é de hoje ou futura (opcional)
      const hoje = new Date().toISOString().split('T')[0];
      if (aulaData.data_programada < hoje) {
        console.warn('Aula já passou da data, mas permitindo scan para testes');
        // Para desenvolvimento, permitir scan de aulas passadas
        // Em produção, descomente a linha abaixo:
        // throw new Error('Aula já passou da data');
      }

      console.log('QR Code válido para aula:', aulaData.titulo);

      return {
        success: true,
        aula: {
          ...aulaData,
          qr_code: qrAtivo,
          qr_ativo: aulaData.detalhes_aula?.qr_ativo || false
        },
        message: 'QR Code válido!'
      };
    } catch (err) {
      setError(err.message);
      console.error('Erro ao validar QR Code:', err);
      return {
        success: false,
        message: err.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Registrar presença do aluno
  const registrarPresenca = async (aulaId, alunoId) => {
    try {
      setLoading(true);
      
      console.log('Registrando presença:', { aulaId, alunoId });

      // 1. Buscar matrícula do aluno
      const { data: matriculas, error: matriculaError } = await supabase
        .from('matriculas')
        .select('*')
        .eq('aluno_id', alunoId)
        .eq('ativa', true)
        .limit(1);

      if (matriculaError) {
        console.error('Erro ao buscar matrícula:', matriculaError);
        throw new Error('Erro ao buscar matrícula do aluno');
      }

      if (!matriculas || matriculas.length === 0) {
        throw new Error('Aluno não possui matrícula ativa');
      }

      const matricula = matriculas[0];

      // 2. Verificar se já existe presença registrada para hoje
      const hoje = new Date().toISOString().split('T')[0];
      const { data: presencaExistente, error: presencaError } = await supabase
        .from('presencas')
        .select('*')
        .eq('matricula_id', matricula.id)
        .eq('data_aula', hoje)
        .limit(1);

      if (presencaError) {
        console.error('Erro ao verificar presença existente:', presencaError);
        // Continuar mesmo com erro (não é crítico)
      }

      // 3. Registrar nova presença (ou atualizar existente)
      if (presencaExistente && presencaExistente.length > 0) {
        // Atualizar presença existente
        const { error: updateError } = await supabase
          .from('presencas')
          .update({
            presente: true,
            observacoes: 'Presença confirmada via QR Code',
            criado_em: new Date().toISOString()
          })
          .eq('id', presencaExistente[0].id);

        if (updateError) {
          console.error('Erro ao atualizar presença:', updateError);
          throw new Error('Erro ao atualizar presença');
        }

        console.log('Presença atualizada com sucesso');
      } else {
        // Criar nova presença
        const { error: insertError } = await supabase
          .from('presencas')
          .insert({
            matricula_id: matricula.id,
            data_aula: hoje,
            presente: true,
            observacoes: 'Presença confirmada via QR Code'
          });

        if (insertError) {
          console.error('Erro ao inserir presença:', insertError);
          throw new Error('Erro ao registrar presença');
        }

        console.log('Presença registrada com sucesso');
      }

      // 4. TODO: Liberar conteúdo da aula para o aluno
      // Implementar lógica de liberação de conteúdo aqui

      return true;
    } catch (err) {
      setError(err.message);
      console.error('Erro ao registrar presença:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buscar aula específica com QR Code ativo
  const getAulaComQR = (aulaId) => {
    return aulas.find(aula => aula.id === aulaId && aula.qr_code);
  };

  // Buscar próximas aulas (para interface admin)
  const getProximasAulas = () => {
    const hoje = new Date().toISOString().split('T')[0];
    return aulas.filter(aula => aula.data_programada >= hoje);
  };

  // Buscar aulas que precisam de QR Code
  const getAulasSemQR = () => {
    const hoje = new Date().toISOString().split('T')[0];
    return aulas.filter(aula => 
      aula.data_programada >= hoje && !aula.qr_code
    );
  };

  // Invalidar QR Code (para segurança)
  const invalidarQRCode = async (aulaId) => {
    try {
      setLoading(true);
      
      const agora = new Date().toISOString();
      
      const { error } = await supabase
        .from('aulas')
        .update({
          detalhes_aula: supabase.sql`
            COALESCE(detalhes_aula, '{}'::jsonb) || 
            jsonb_build_object(
              'qr_ativo', false,
              'qr_invalidado_em', '${agora}'
            )
          `
        })
        .eq('id', aulaId);

      if (error) throw error;

      await fetchAulas();
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Erro ao invalidar QR Code:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obter estatísticas de presença
  const getEstatisticasPresenca = async () => {
    try {
      const { data, error } = await supabase
        .from('presencas')
        .select(`
          *,
          matriculas(
            aluno_id,
            alunos(nome)
          )
        `)
        .eq('presente', true)
        .gte('data_aula', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (error) throw error;

      return {
        totalPresencas: data.length,
        alunosUnicos: new Set(data.map(p => p.matriculas?.aluno_id)).size,
        ultimasSemanas: data.length // Simplificado por agora
      };
    } catch (err) {
      console.error('Erro ao obter estatísticas:', err);
      return {
        totalPresencas: 0,
        alunosUnicos: 0,
        ultimasSemanas: 0
      };
    }
  };

  // Carregar aulas ao montar o hook
  useEffect(() => {
    fetchAulas();
  }, []);

  return {
    // Estados
    aulas,
    loading,
    error,
    
    // Funções
    fetchAulas,
    gerarQRCode,
    validarQRCode,
    registrarPresenca,
    invalidarQRCode,
    getEstatisticasPresenca,
    
    // Helpers
    getAulaComQR,
    getProximasAulas,
    getAulasSemQR
  };
};