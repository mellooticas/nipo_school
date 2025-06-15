// features/admin/services/qrCodeService.js
import { supabase } from '../../../shared/lib/supabase/supabaseClient';

class QRCodeService {
  
  // Gerar QR Code para aula específica
  async gerarQRParaAula(aulaNumero) {
    try {
      const { data, error } = await supabase.rpc('gerar_qr_aula', {
        aula_numero: aulaNumero
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      throw new Error('Falha ao gerar QR Code');
    }
  }

  // Buscar aulas com filtros
  async buscarAulas(filtros = {}) {
    try {
      let query = supabase
        .from('aulas')
        .select('*');

      // Aplicar filtros se fornecidos
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }
      
      if (filtros.dataInicio) {
        query = query.gte('data_programada', filtros.dataInicio);
      }

      if (filtros.dataFim) {
        query = query.lte('data_programada', filtros.dataFim);
      }

      query = query.order('numero', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;

      // Processar dados JSONB do QR Code
      return data.map(aula => ({
        ...aula,
        qr_code: aula.detalhes_aula?.qr_code || null,
        qr_gerado_em: aula.detalhes_aula?.qr_gerado_em || null,
        qr_ativo: aula.detalhes_aula?.qr_ativo || false
      }));
    } catch (error) {
      console.error('Erro ao buscar aulas:', error);
      throw new Error('Falha ao buscar aulas');
    }
  }

  // Buscar aula específica por ID
  async buscarAulaPorId(aulaId) {
    try {
      const { data, error } = await supabase
        .from('aulas')
        .select('*')
        .eq('id', aulaId)
        .single();

      if (error) throw error;

      return {
        ...data,
        qr_code: data.detalhes_aula?.qr_code || null,
        qr_gerado_em: data.detalhes_aula?.qr_gerado_em || null,
        qr_ativo: data.detalhes_aula?.qr_ativo || false
      };
    } catch (error) {
      console.error('Erro ao buscar aula:', error);
      throw new Error('Aula não encontrada');
    }
  }

  // Buscar aula por número
  async buscarAulaPorNumero(numero) {
    try {
      const { data, error } = await supabase
        .from('aulas')
        .select('*')
        .eq('numero', numero)
        .single();

      if (error) throw error;

      return {
        ...data,
        qr_code: data.detalhes_aula?.qr_code || null,
        qr_gerado_em: data.detalhes_aula?.qr_gerado_em || null,
        qr_ativo: data.detalhes_aula?.qr_ativo || false
      };
    } catch (error) {
      console.error('Erro ao buscar aula por número:', error);
      throw new Error('Aula não encontrada');
    }
  }

  // Validar se QR Code é válido e ativo
  async validarQRCode(qrCode) {
    try {
      // Verificar formato do QR Code
      if (!qrCode || !qrCode.startsWith('NIPO_AULA_')) {
        return {
          valido: false,
          motivo: 'Formato de QR Code inválido'
        };
      }

      // Extrair número da aula do QR Code
      const partes = qrCode.split('_');
      if (partes.length < 3) {
        return {
          valido: false,
          motivo: 'QR Code mal formatado'
        };
      }

      const aulaNumero = parseInt(partes[2]);
      if (isNaN(aulaNumero)) {
        return {
          valido: false,
          motivo: 'Número da aula inválido'
        };
      }

      // Buscar aula correspondente
      const aula = await this.buscarAulaPorNumero(aulaNumero);
      
      // Verificar se QR Code corresponde ao ativo
      if (aula.qr_code !== qrCode) {
        return {
          valido: false,
          motivo: 'QR Code expirado ou inválido'
        };
      }

      // Verificar se está ativo
      if (!aula.qr_ativo) {
        return {
          valido: false,
          motivo: 'QR Code inativo'
        };
      }

      // Verificar se aula é de hoje ou futura
      const hoje = new Date().toISOString().split('T')[0];
      if (aula.data_programada < hoje) {
        return {
          valido: false,
          motivo: 'Aula já passou da data'
        };
      }

      return {
        valido: true,
        aula: aula
      };
    } catch (error) {
      console.error('Erro ao validar QR Code:', error);
      return {
        valido: false,
        motivo: 'Erro interno na validação'
      };
    }
  }

  // Invalidar QR Code (por segurança)
  async invalidarQRCode(aulaId) {
    try {
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
      return true;
    } catch (error) {
      console.error('Erro ao invalidar QR Code:', error);
      throw new Error('Falha ao invalidar QR Code');
    }
  }

  // Obter estatísticas de QR Codes
  async obterEstatisticas() {
    try {
      const { data: aulas, error } = await supabase
        .from('aulas')
        .select('detalhes_aula, status, data_programada');

      if (error) throw error;

      const hoje = new Date().toISOString().split('T')[0];
      
      const stats = {
        total_aulas: aulas.length,
        com_qr_code: 0,
        qr_ativos: 0,
        proximas_aulas: 0,
        aulas_hoje: 0
      };

      aulas.forEach(aula => {
        const temQR = aula.detalhes_aula?.qr_code;
        const qrAtivo = aula.detalhes_aula?.qr_ativo;
        const isProxima = aula.data_programada >= hoje;
        const isHoje = aula.data_programada === hoje;

        if (temQR) stats.com_qr_code++;
        if (qrAtivo) stats.qr_ativos++;
        if (isProxima) stats.proximas_aulas++;
        if (isHoje) stats.aulas_hoje++;
      });

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw new Error('Falha ao obter estatísticas');
    }
  }

  // Registrar acesso ao QR Code (para analytics)
  async registrarAcessoQR(qrCode, alunoId = null) {
    try {
      // Registrar em uma tabela de logs se necessário
      const logData = {
        qr_code: qrCode,
        aluno_id: alunoId,
        timestamp: new Date().toISOString(),
        ip: null, // Pode ser implementado
        user_agent: navigator.userAgent
      };

      // Por enquanto, apenas log no console
      // Implementar tabela de logs depois se necessário
      console.log('Acesso QR registrado:', logData);
      
      return true;
    } catch (error) {
      console.error('Erro ao registrar acesso QR:', error);
      return false;
    }
  }
}

// Exportar instância única (singleton)
export const qrCodeService = new QRCodeService();