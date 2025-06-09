// instrumentsService.js - Service completo para sistema de instrumentos
import { supabase } from '../../../shared/lib/supabase/supabaseClient';

// Cache simples para performance
const cache = new Map();
const CACHE_TIME = 60000; // 1 minuto

const getCacheKey = (method, params = '') => `instruments_${method}_${params}`;

const isValidCache = (timestamp) => {
  return Date.now() - timestamp < CACHE_TIME;
};

export const instrumentsService = {

  // ==========================================
  // LISTAGEM DE INSTRUMENTOS
  // ==========================================

  async getAllInstruments() {
    const cacheKey = getCacheKey('all_instruments');
    const cached = cache.get(cacheKey);
    
    if (cached && isValidCache(cached.timestamp)) {
      console.log('🎵 Usando cache para instrumentos');
      return { success: true, data: cached.data };
    }

    try {
      console.log('🔍 Buscando todos os instrumentos...');
      
      const { data: instrumentos, error } = await supabase
        .from('instrumentos')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;

      // Buscar estatísticas para cada instrumento
      const instrumentosComStats = await Promise.all(
        (instrumentos || []).map(async (instrumento) => {
          const stats = await this.getInstrumentStats(instrumento.id);
          return {
            ...instrumento,
            stats: stats.data || {
              total_alunos: 0,
              total_professores: 0,
              total_turmas: 0,
              total_modulos: 0
            }
          };
        })
      );

      // Cachear resultado
      cache.set(cacheKey, {
        data: instrumentosComStats,
        timestamp: Date.now()
      });

      console.log('✅ Instrumentos carregados:', instrumentosComStats.length);
      return { success: true, data: instrumentosComStats };

    } catch (error) {
      console.error('❌ Erro ao buscar instrumentos:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  async getInstrumentsByCategory(categoria) {
    try {
      console.log('🔍 Buscando instrumentos da categoria:', categoria);
      
      const { data: instrumentos, error } = await supabase
        .from('instrumentos')
        .select('*')
        .eq('categoria', categoria)
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;

      console.log('✅ Instrumentos da categoria carregados:', instrumentos?.length || 0);
      return { success: true, data: instrumentos || [] };

    } catch (error) {
      console.error('❌ Erro ao buscar instrumentos por categoria:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // ==========================================
  // ESTATÍSTICAS DO INSTRUMENTO
  // ==========================================

  async getInstrumentStats(instrumentoId) {
    const cacheKey = getCacheKey('instrument_stats', instrumentoId);
    const cached = cache.get(cacheKey);
    
    if (cached && isValidCache(cached.timestamp)) {
      return { success: true, data: cached.data };
    }

    try {
      console.log('📊 Buscando estatísticas do instrumento:', instrumentoId);

      // Buscar dados em paralelo
      const [alunosResult, professoresResult, turmasResult] = await Promise.all([
        supabase
          .from('alunos')
          .select('id, nivel')
          .eq('instrumento_id', instrumentoId)
          .eq('ativo', true),
        
        supabase
          .from('professor_instrumentos')
          .select('professor_id, nivel_ensino, anos_experiencia')
          .eq('instrumento_id', instrumentoId),
        
        supabase
          .from('turmas')
          .select('id, nivel, max_alunos, ativo')
          .eq('instrumento_id', instrumentoId)
          .eq('ativo', true)
      ]);

      const alunos = alunosResult.data || [];
      const professores = professoresResult.data || [];
      const turmas = turmasResult.data || [];

      // Calcular distribuições
      const distribuicaoNiveis = {};
      alunos.forEach(aluno => {
        const nivel = aluno.nivel || 'beginner';
        distribuicaoNiveis[nivel] = (distribuicaoNiveis[nivel] || 0) + 1;
      });

      const stats = {
        total_alunos: alunos.length,
        total_professores: professores.length,
        total_turmas: turmas.length,
        total_vagas: turmas.reduce((sum, turma) => sum + (turma.max_alunos || 0), 0),
        distribuicao_niveis: distribuicaoNiveis,
        professores_por_nivel: professores.reduce((acc, prof) => {
          const nivel = prof.nivel_ensino || 'todos';
          acc[nivel] = (acc[nivel] || 0) + 1;
          return acc;
        }, {}),
        media_experiencia: professores.length > 0 
          ? Math.round(professores.reduce((sum, p) => sum + (p.anos_experiencia || 0), 0) / professores.length)
          : 0
      };

      // Cachear resultado
      cache.set(cacheKey, {
        data: stats,
        timestamp: Date.now()
      });

      console.log('✅ Estatísticas do instrumento obtidas:', stats);
      return { success: true, data: stats };

    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas do instrumento:', error);
      return { success: false, error: error.message, data: {} };
    }
  },

  // ==========================================
  // TURMAS DO INSTRUMENTO
  // ==========================================

  async getInstrumentTurmas(instrumentoId) {
    try {
      console.log('🎓 Buscando turmas do instrumento:', instrumentoId);
      
      const { data: turmas, error } = await supabase
        .from('turmas')
        .select(`
          *,
          professores:professor_id (
            profiles:id (full_name, email)
          )
        `)
        .eq('instrumento_id', instrumentoId)
        .eq('ativo', true)
        .order('data_inicio', { ascending: false });

      if (error) throw error;

      // Buscar matrículas para cada turma
      const turmasComMatriculas = await Promise.all(
        (turmas || []).map(async (turma) => {
          const { data: matriculas, error: matriculasError } = await supabase
            .from('matriculas')
            .select('id, status')
            .eq('turma_id', turma.id)
            .eq('status', 'ativa');

          if (matriculasError) {
            console.warn('⚠️ Erro ao buscar matrículas da turma:', turma.id);
          }

          return {
            ...turma,
            total_matriculados: matriculas?.length || 0,
            vagas_disponiveis: (turma.max_alunos || 0) - (matriculas?.length || 0)
          };
        })
      );

      console.log('✅ Turmas do instrumento carregadas:', turmasComMatriculas.length);
      return { success: true, data: turmasComMatriculas };

    } catch (error) {
      console.error('❌ Erro ao buscar turmas do instrumento:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // ==========================================
  // PROFESSORES DO INSTRUMENTO
  // ==========================================

  async getInstrumentProfessores(instrumentoId) {
    try {
      console.log('👨‍🏫 Buscando professores do instrumento:', instrumentoId);
      
      const { data: professores, error } = await supabase
        .from('professor_instrumentos')
        .select(`
          *,
          professores:professor_id (
            id,
            biografia,
            ativo,
            profiles:id (
              full_name,
              email,
              avatar_url
            )
          )
        `)
        .eq('instrumento_id', instrumentoId);

      if (error) throw error;

      const professoresFormatados = (professores || [])
        .filter(item => item.professores?.ativo)
        .map(item => ({
          id: item.professor_id,
          nome: item.professores?.profiles?.full_name || 'Nome não informado',
          email: item.professores?.profiles?.email || '',
          avatar_url: item.professores?.profiles?.avatar_url,
          biografia: item.professores?.biografia || '',
          nivel_ensino: item.nivel_ensino,
          anos_experiencia: item.anos_experiencia || 0
        }));

      console.log('✅ Professores do instrumento carregados:', professoresFormatados.length);
      return { success: true, data: professoresFormatados };

    } catch (error) {
      console.error('❌ Erro ao buscar professores do instrumento:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // ==========================================
  // ALUNOS DO INSTRUMENTO
  // ==========================================

  async getInstrumentAlunos(instrumentoId, limite = 50) {
    try {
      console.log('👨‍🎓 Buscando alunos do instrumento:', instrumentoId);
      
      const { data: alunos, error } = await supabase
        .from('alunos')
        .select(`
          *,
          profiles:id (
            full_name,
            email,
            total_points,
            current_streak,
            last_active
          )
        `)
        .eq('instrumento_id', instrumentoId)
        .eq('ativo', true)
        .order('data_ingresso', { ascending: false })
        .limit(limite);

      if (error) throw error;

      const alunosFormatados = (alunos || []).map(aluno => ({
        id: aluno.id,
        nome: aluno.profiles?.full_name || 'Nome não informado',
        email: aluno.profiles?.email || '',
        nivel: aluno.nivel || 'beginner',
        pontos: aluno.profiles?.total_points || 0,
        sequencia: aluno.profiles?.current_streak || 0,
        data_ingresso: aluno.data_ingresso,
        ultimo_acesso: aluno.profiles?.last_active,
        ativo: aluno.ativo
      }));

      console.log('✅ Alunos do instrumento carregados:', alunosFormatados.length);
      return { success: true, data: alunosFormatados };

    } catch (error) {
      console.error('❌ Erro ao buscar alunos do instrumento:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // ==========================================
  // MÓDULOS/CONTEÚDOS DO INSTRUMENTO
  // ==========================================

  async getInstrumentModulos(instrumentoId) {
    try {
      console.log('📚 Buscando módulos do instrumento:', instrumentoId);
      
      const { data: modulos, error } = await supabase
        .from('modules')
        .select(`
          *,
          lessons:lessons(count)
        `)
        .eq('instrument_id', instrumentoId)
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;

      const modulosFormatados = (modulos || []).map(modulo => ({
        ...modulo,
        total_licoes: modulo.lessons?.[0]?.count || 0
      }));

      console.log('✅ Módulos do instrumento carregados:', modulosFormatados.length);
      return { success: true, data: modulosFormatados };

    } catch (error) {
      console.error('❌ Erro ao buscar módulos do instrumento:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // ==========================================
  // RANKING DO INSTRUMENTO
  // ==========================================

  async getInstrumentRanking(instrumentoId, limite = 20) {
    try {
      console.log('🏆 Buscando ranking do instrumento:', instrumentoId);
      
      const { data: ranking, error } = await supabase
        .from('alunos')
        .select(`
          id,
          nivel,
          profiles:id (
            full_name,
            total_points,
            current_streak,
            lessons_completed
          )
        `)
        .eq('instrumento_id', instrumentoId)
        .eq('ativo', true)
        .not('profiles.total_points', 'is', null)
        .order('profiles(total_points)', { ascending: false })
        .limit(limite);

      if (error) throw error;

      const rankingFormatado = (ranking || [])
        .filter(item => item.profiles)
        .map((item, index) => ({
          posicao: index + 1,
          id: item.id,
          nome: item.profiles.full_name || 'Usuário',
          nivel: item.nivel || 'beginner',
          pontos: item.profiles.total_points || 0,
          sequencia: item.profiles.current_streak || 0,
          licoes: item.profiles.lessons_completed || 0
        }));

      console.log('✅ Ranking do instrumento carregado:', rankingFormatado.length, 'posições');
      return { success: true, data: rankingFormatado };

    } catch (error) {
      console.error('❌ Erro ao buscar ranking do instrumento:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // ==========================================
  // FUNÇÕES ADMINISTRATIVAS
  // ==========================================

  async createInstrument(instrumentData) {
    try {
      console.log('➕ Criando novo instrumento:', instrumentData);
      
      const { data, error } = await supabase
        .from('instrumentos')
        .insert([{
          nome: instrumentData.nome,
          categoria: instrumentData.categoria,
          ativo: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Limpar cache
      this.clearCache();

      console.log('✅ Instrumento criado:', data);
      return { success: true, data };

    } catch (error) {
      console.error('❌ Erro ao criar instrumento:', error);
      return { success: false, error: error.message };
    }
  },

  async updateInstrument(instrumentoId, updateData) {
    try {
      console.log('✏️ Atualizando instrumento:', instrumentoId, updateData);
      
      const { data, error } = await supabase
        .from('instrumentos')
        .update(updateData)
        .eq('id', instrumentoId)
        .select()
        .single();

      if (error) throw error;

      // Limpar cache
      this.clearCache();

      console.log('✅ Instrumento atualizado:', data);
      return { success: true, data };

    } catch (error) {
      console.error('❌ Erro ao atualizar instrumento:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteInstrument(instrumentoId) {
    try {
      console.log('🗑️ Desativando instrumento:', instrumentoId);
      
      const { data, error } = await supabase
        .from('instrumentos')
        .update({ ativo: false })
        .eq('id', instrumentoId)
        .select()
        .single();

      if (error) throw error;

      // Limpar cache
      this.clearCache();

      console.log('✅ Instrumento desativado:', data);
      return { success: true, data };

    } catch (error) {
      console.error('❌ Erro ao desativar instrumento:', error);
      return { success: false, error: error.message };
    }
  },

   // ==========================================
  // GESTÃO DE INSTRUMENTOS FÍSICOS
  // ==========================================

  async getInstrumentosFisicos(instrumentoId = null) {
    try {
      let query = supabase
        .from('instrumentos_fisicos')
        .select(`
          *,
          instrumentos:instrumento_id (nome, categoria),
          cessoes_ativas:cessoes_instrumentos!inner(
            id, aluno_id, status, data_fim_prevista,
            alunos:aluno_id (
              profiles:id (full_name)
            )
          )
        `)
        .neq('estado', 'baixado');

      if (instrumentoId) {
        query = query.eq('instrumento_id', instrumentoId);
      }

      const { data, error } = await query.order('codigo_patrimonio');

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('❌ Erro ao buscar instrumentos físicos:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  async createInstrumentoFisico(instrumentData) {
    try {
      const { data, error } = await supabase
        .from('instrumentos_fisicos')
        .insert([{
          instrumento_id: instrumentData.instrumento_id,
          codigo_patrimonio: instrumentData.codigo_patrimonio,
          numero_serie: instrumentData.numero_serie,
          marca: instrumentData.marca,
          modelo: instrumentData.modelo,
          valor_aquisicao: instrumentData.valor_aquisicao,
          data_aquisicao: instrumentData.data_aquisicao,
          localizacao: instrumentData.localizacao,
          observacoes: instrumentData.observacoes
        }])
        .select()
        .single();

      if (error) throw error;

      // Registrar no histórico
      await this.registrarHistorico(data.id, 'cadastro', null, null, 'Instrumento cadastrado no sistema');

      return { success: true, data };
    } catch (error) {
      console.error('❌ Erro ao criar instrumento físico:', error);
      return { success: false, error: error.message };
    }
  },

  // ==========================================
  // GESTÃO DE CESSÕES
  // ==========================================

  async getCessoesAtivas(instrumentoId = null) {
    try {
      let query = supabase
        .from('cessoes_instrumentos')
        .select(`
          *,
          instrumentos_fisicos:instrumento_fisico_id (
            codigo_patrimonio, marca, modelo,
            instrumentos:instrumento_id (nome)
          ),
          alunos:aluno_id (
            profiles:id (full_name, email)
          ),
          responsavel_entrega:responsavel_entrega (
            profiles:id (full_name)
          )
        `)
        .eq('status', 'ativa');

      if (instrumentoId) {
        query = query.eq('instrumentos_fisicos.instrumento_id', instrumentoId);
      }

      const { data, error } = await query.order('data_inicio', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('❌ Erro ao buscar cessões ativas:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  async createCessao(cessaoData) {
    try {
      // Verificar se instrumento está disponível
      const { data: instrumento, error: instError } = await supabase
        .from('instrumentos_fisicos')
        .select('disponivel')
        .eq('id', cessaoData.instrumento_fisico_id)
        .single();

      if (instError || !instrumento.disponivel) {
        throw new Error('Instrumento não está disponível para cessão');
      }

      // Criar cessão
      const { data, error } = await supabase
        .from('cessoes_instrumentos')
        .insert([cessaoData])
        .select()
        .single();

      if (error) throw error;

      // Atualizar disponibilidade do instrumento
      await supabase
        .from('instrumentos_fisicos')
        .update({ disponivel: false })
        .eq('id', cessaoData.instrumento_fisico_id);

      // Registrar no histórico
      await this.registrarHistorico(
        cessaoData.instrumento_fisico_id, 
        'cessao_iniciada', 
        cessaoData.responsavel_entrega,
        cessaoData.aluno_id,
        `Cessão iniciada - Tipo: ${cessaoData.tipo_cessao}`
      );

      return { success: true, data };
    } catch (error) {
      console.error('❌ Erro ao criar cessão:', error);
      return { success: false, error: error.message };
    }
  },

  async finalizarCessao(cessaoId, observacoesDevolucao = '') {
    try {
      // Buscar dados da cessão
      const { data: cessao, error: cessaoError } = await supabase
        .from('cessoes_instrumentos')
        .select('instrumento_fisico_id, aluno_id')
        .eq('id', cessaoId)
        .single();

      if (cessaoError) throw cessaoError;

      // Finalizar cessão
      const { data, error } = await supabase
        .from('cessoes_instrumentos')
        .update({
          status: 'devolvida',
          data_devolucao_real: new Date().toISOString(),
          observacoes: observacoesDevolucao
        })
        .eq('id', cessaoId)
        .select()
        .single();

      if (error) throw error;

      // Liberar instrumento
      await supabase
        .from('instrumentos_fisicos')
        .update({ disponivel: true })
        .eq('id', cessao.instrumento_fisico_id);

      // Registrar no histórico
      await this.registrarHistorico(
        cessao.instrumento_fisico_id,
        'devolvido',
        null,
        cessao.aluno_id,
        `Instrumento devolvido - ${observacoesDevolucao}`
      );

      return { success: true, data };
    } catch (error) {
      console.error('❌ Erro ao finalizar cessão:', error);
      return { success: false, error: error.message };
    }
  },

  // ==========================================
  // CONTROLE DE MANUTENÇÃO
  // ==========================================

  async getManutencoes(instrumentoFisicoId = null) {
    try {
      let query = supabase
        .from('manutencoes_instrumentos')
        .select(`
          *,
          instrumentos_fisicos:instrumento_fisico_id (
            codigo_patrimonio, marca, modelo,
            instrumentos:instrumento_id (nome)
          )
        `);

      if (instrumentoFisicoId) {
        query = query.eq('instrumento_fisico_id', instrumentoFisicoId);
      }

      const { data, error } = await query.order('data_entrada', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('❌ Erro ao buscar manutenções:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  async createManutencao(manutencaoData) {
    try {
      const { data, error } = await supabase
        .from('manutencoes_instrumentos')
        .insert([manutencaoData])
        .select()
        .single();

      if (error) throw error;

      // Atualizar estado do instrumento
      await supabase
        .from('instrumentos_fisicos')
        .update({ 
          estado: 'manutencao',
          disponivel: false 
        })
        .eq('id', manutencaoData.instrumento_fisico_id);

      // Registrar no histórico
      await this.registrarHistorico(
        manutencaoData.instrumento_fisico_id,
        'manutencao',
        null,
        null,
        `Manutenção iniciada - ${manutencaoData.tipo_manutencao}: ${manutencaoData.descricao_problema}`
      );

      return { success: true, data };
    } catch (error) {
      console.error('❌ Erro ao criar manutenção:', error);
      return { success: false, error: error.message };
    }
  },

  // ==========================================
  // RELATÓRIOS E ESTATÍSTICAS AVANÇADAS
  // ==========================================

  async getEstatisticasPatrimonio(instrumentoId = null) {
    try {
      let baseQuery = supabase.from('instrumentos_fisicos').select('*');
      
      if (instrumentoId) {
        baseQuery = baseQuery.eq('instrumento_id', instrumentoId);
      }

      const [fisicosResult, cessoesResult, manutencoesResult] = await Promise.all([
        baseQuery,
        supabase.from('cessoes_instrumentos').select('*'),
        supabase.from('manutencoes_instrumentos').select('*')
      ]);

      const fisicos = fisicosResult.data || [];
      const cessoes = cessoesResult.data || [];
      const manutencoes = manutencoesResult.data || [];

      // Calcular estatísticas
      const stats = {
        patrimonio: {
          total_instrumentos: fisicos.length,
          valor_total: fisicos.reduce((sum, inst) => sum + (inst.valor_aquisicao || 0), 0),
          disponveis: fisicos.filter(inst => inst.disponivel).length,
          emprestados: fisicos.filter(inst => !inst.disponivel && inst.estado === 'bom').length,
          manutencao: fisicos.filter(inst => inst.estado === 'manutencao').length,
          danificados: fisicos.filter(inst => inst.estado === 'danificado').length
        },
        cessoes: {
          ativas: cessoes.filter(c => c.status === 'ativa').length,
          vencidas: cessoes.filter(c => c.status === 'vencida').length,
          total_historico: cessoes.length,
          tempo_medio_uso: this.calcularTempoMedioUso(cessoes)
        },
        manutencoes: {
          abertas: manutencoes.filter(m => ['aguardando', 'em_andamento'].includes(m.status)).length,
          concluidas_mes: manutencoes.filter(m => {
            const dataManutencao = new Date(m.data_saida_real);
            const agora = new Date();
            return m.status === 'concluida' && 
                   dataManutencao.getMonth() === agora.getMonth() &&
                   dataManutencao.getFullYear() === agora.getFullYear();
          }).length,
          custo_total_mes: manutencoes
            .filter(m => {
              const dataManutencao = new Date(m.data_saida_real);
              const agora = new Date();
              return m.status === 'concluida' && 
                     dataManutencao.getMonth() === agora.getMonth() &&
                     dataManutencao.getFullYear() === agora.getFullYear();
            })
            .reduce((sum, m) => sum + (m.valor_servico || 0), 0)
        }
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de patrimônio:', error);
      return { success: false, error: error.message, data: {} };
    }
  },

  // ==========================================
  // FUNÇÕES AUXILIARES
  // ==========================================

  async registrarHistorico(instrumentoFisicoId, acao, usuarioId, alunoId, descricao) {
    try {
      await supabase
        .from('historico_instrumentos')
        .insert([{
          instrumento_fisico_id: instrumentoFisicoId,
          acao,
          usuario_id: usuarioId,
          aluno_afetado_id: alunoId,
          descricao
        }]);
    } catch (error) {
      console.error('❌ Erro ao registrar histórico:', error);
    }
  },

  calcularTempoMedioUso(cessoes) {
    const cessoesFinalizadas = cessoes.filter(c => c.data_devolucao_real);
    if (cessoesFinalizadas.length === 0) return 0;

    const totalDias = cessoesFinalizadas.reduce((sum, cessao) => {
      const inicio = new Date(cessao.data_inicio);
      const fim = new Date(cessao.data_devolucao_real);
      const diffTime = Math.abs(fim - inicio);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);

    return Math.round(totalDias / cessoesFinalizadas.length);
  },

  // Alertas e notificações
  async getAlertasVencimento(diasAntecedencia = 7) {
    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + diasAntecedencia);

      const { data, error } = await supabase
        .from('cessoes_instrumentos')
        .select(`
          *,
          instrumentos_fisicos:instrumento_fisico_id (codigo_patrimonio),
          alunos:aluno_id (profiles:id (full_name, email))
        `)
        .eq('status', 'ativa')
        .lte('data_fim_prevista', dataLimite.toISOString())
        .order('data_fim_prevista');

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('❌ Erro ao buscar alertas de vencimento:', error);
      return { success: false, error: error.message, data: [] };
    }
  },


  // ==========================================
  // UTILITIES
  // ==========================================

  async getInstrumentByName(nome) {
    try {
      const { data, error } = await supabase
        .from('instrumentos')
        .select('*')
        .eq('nome', nome)
        .eq('ativo', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return { success: true, data: data || null };

    } catch (error) {
      console.error('❌ Erro ao buscar instrumento por nome:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  // Limpar cache
  clearCache() {
    Array.from(cache.keys())
      .filter(key => key.startsWith('instruments_'))
      .forEach(key => cache.delete(key));
    console.log('🧹 Cache de instrumentos limpo');
  },

  // Obter todas as categorias disponíveis
  getCategorias() {
    return [
      { id: 'corda', nome: 'Cordas', emoji: '🎸' },
      { id: 'sopro', nome: 'Sopros', emoji: '🎺' },
      { id: 'percussao', nome: 'Percussão', emoji: '🥁' },
      { id: 'teclado', nome: 'Teclados', emoji: '🎹' },
      { id: 'vocal', nome: 'Vocal', emoji: '🎤' },
      { id: 'teoria', nome: 'Teoria Musical', emoji: '📝' },
      { id: 'outros', nome: 'Outros', emoji: '🎵' }
    ];
  }
};