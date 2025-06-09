import { supabase } from '../shared/lib/supabase/supabaseClient';

/**
 * Service para gerenciamento de turmas e matrículas
 */
export const turmasService = {

  // ==========================================
  // GESTÃO DE TURMAS
  // ==========================================

  /**
   * Buscar todas as turmas
   */
  async getTurmas(filtros = {}) {
    try {
      let query = supabase
        .from('turmas')
        .select(`
          *,
          instrumento:instrumentos!instrumento_id (
            nome,
            categoria
          ),
          professor:professores!professor_id (
            id,
            profiles:id (
              full_name,
              email
            )
          ),
          matriculas!turma_id (
            id,
            status,
            aluno:alunos!aluno_id (
              id,
              profiles:id (
                full_name
              )
            )
          )
        `);

      // Aplicar filtros
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros.professor_id) {
        query = query.eq('professor_id', filtros.professor_id);
      }
      if (filtros.instrumento_id) {
        query = query.eq('instrumento_id', filtros.instrumento_id);
      }
      if (filtros.nivel) {
        query = query.eq('nivel', filtros.nivel);
      }

      const { data, error } = await query
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Erro ao buscar turmas:', error);
        return { success: false, error: error.message, data: [] };
      }

      // Processar dados com estatísticas
      const processedData = data.map(turma => {
        const matriculasAtivas = turma.matriculas.filter(m => m.status === 'ativa');
        const vagasDisponiveis = Math.max(0, turma.max_alunos - matriculasAtivas.length);

        return {
          ...turma,
          professor_nome: turma.professor?.profiles?.full_name || 'Professor',
          instrumento_nome: turma.instrumento?.nome || '',
          categoria_instrumento: turma.instrumento?.categoria || '',
          alunos_matriculados: matriculasAtivas.length,
          vagas_disponiveis: vagasDisponiveis,
          percentual_ocupacao: turma.max_alunos > 0 ? 
            Math.round((matriculasAtivas.length / turma.max_alunos) * 100) : 0,
          lista_alunos: matriculasAtivas.map(m => ({
            id: m.aluno.id,
            nome: m.aluno.profiles?.full_name || 'Aluno'
          }))
        };
      });

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Erro no service getTurmas:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Buscar turma específica com detalhes completos
   */
  async getTurmaById(turmaId) {
    try {
      const { data, error } = await supabase
        .from('turmas')
        .select(`
          *,
          instrumento:instrumentos!instrumento_id (
            nome,
            categoria,
            descricao
          ),
          professor:professores!professor_id (
            id,
            biografia,
            profiles:id (
              full_name,
              email,
              phone
            )
          ),
          matriculas!turma_id (
            *,
            aluno:alunos!aluno_id (
              id,
              nivel,
              profiles:id (
                full_name,
                email,
                phone
              )
            )
          )
        `)
        .eq('id', turmaId)
        .single();

      if (error) {
        console.error('Erro ao buscar turma:', error);
        return { success: false, error: error.message, data: null };
      }

      // Processar dados detalhados
      const matriculasAtivas = data.matriculas.filter(m => m.status === 'ativa');
      const processedData = {
        ...data,
        professor_nome: data.professor?.profiles?.full_name || 'Professor',
        professor_email: data.professor?.profiles?.email || '',
        professor_telefone: data.professor?.profiles?.phone || '',
        professor_biografia: data.professor?.biografia || '',
        instrumento_nome: data.instrumento?.nome || '',
        categoria_instrumento: data.instrumento?.categoria || '',
        alunos_matriculados: matriculasAtivas.length,
        vagas_disponiveis: Math.max(0, data.max_alunos - matriculasAtivas.length),
        lista_alunos_detalhada: matriculasAtivas.map(m => ({
          matricula_id: m.id,
          aluno_id: m.aluno.id,
          nome: m.aluno.profiles?.full_name || 'Aluno',
          email: m.aluno.profiles?.email || '',
          telefone: m.aluno.profiles?.phone || '',
          nivel: m.aluno.nivel,
          data_matricula: m.data_matricula,
          valor_acordado: m.valor_acordado,
          observacoes: m.observacoes
        }))
      };

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Erro no service getTurmaById:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  /**
   * Criar nova turma
   */
  async createTurma(dadosTurma) {
    try {
      const { data, error } = await supabase
        .from('turmas')
        .insert({
          nome: dadosTurma.nome,
          descricao: dadosTurma.descricao,
          professor_id: dadosTurma.professor_id,
          instrumento_id: dadosTurma.instrumento_id,
          nivel: dadosTurma.nivel || 'iniciante',
          max_alunos: dadosTurma.max_alunos || 10,
          min_alunos: dadosTurma.min_alunos || 3,
          valor_mensalidade: dadosTurma.valor_mensalidade,
          horarios: dadosTurma.horarios || [],
          data_inicio: dadosTurma.data_inicio,
          data_fim: dadosTurma.data_fim,
          modalidade: dadosTurma.modalidade || 'presencial',
          local: dadosTurma.local,
          material_necessario: dadosTurma.material_necessario,
          pre_requisitos: dadosTurma.pre_requisitos,
          observacoes: dadosTurma.observacoes
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar turma:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro no service createTurma:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Atualizar turma
   */
  async updateTurma(turmaId, dadosAtualizacao) {
    try {
      const { data, error } = await supabase
        .from('turmas')
        .update(dadosAtualizacao)
        .eq('id', turmaId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar turma:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro no service updateTurma:', error);
      return { success: false, error: error.message };
    }
  },

  // ==========================================
  // GESTÃO DE MATRÍCULAS
  // ==========================================

  /**
   * Matricular aluno em turma
   */
  async matricularAluno(turmaId, alunoId, dadosMatricula = {}) {
    try {
      // Verificar se há vagas disponíveis
      const { data: turma } = await supabase
        .from('turmas')
        .select('max_alunos')
        .eq('id', turmaId)
        .single();

      const { data: matriculasAtivas } = await supabase
        .from('matriculas')
        .select('id')
        .eq('turma_id', turmaId)
        .in('status', ['ativa', 'pendente']);

      if (turma && matriculasAtivas && matriculasAtivas.length >= turma.max_alunos) {
        return { success: false, error: 'Turma lotada - sem vagas disponíveis' };
      }

      // Criar matrícula
      const { data, error } = await supabase
        .from('matriculas')
        .insert({
          turma_id: turmaId,
          aluno_id: alunoId,
          status: dadosMatricula.status || 'ativa',
          valor_acordado: dadosMatricula.valor_acordado,
          desconto_aplicado: dadosMatricula.desconto_aplicado || 0,
          forma_pagamento: dadosMatricula.forma_pagamento,
          observacoes: dadosMatricula.observacoes,
          data_inicio_aulas: dadosMatricula.data_inicio_aulas
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao matricular aluno:', error);
        return { success: false, error: error.message };
      }

      // Atualizar turma principal do aluno se for a primeira matrícula ativa
      const { data: outrasMatriculas } = await supabase
        .from('matriculas')
        .select('id')
        .eq('aluno_id', alunoId)
        .eq('status', 'ativa')
        .neq('id', data.id);

      if (!outrasMatriculas || outrasMatriculas.length === 0) {
        await supabase
          .from('alunos')
          .update({ turma_principal_id: turmaId })
          .eq('id', alunoId);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro no service matricularAluno:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Cancelar matrícula
   */
  async cancelarMatricula(matriculaId, motivo = '') {
    try {
      const { data, error } = await supabase
        .from('matriculas')
        .update({
          status: 'cancelada',
          data_cancelamento: new Date().toISOString().split('T')[0],
          motivo_cancelamento: motivo
        })
        .eq('id', matriculaId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao cancelar matrícula:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro no service cancelarMatricula:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Buscar estatísticas de turmas
   */
  async getEstatisticasTurmas() {
    try {
      const [turmasResult, matriculasResult] = await Promise.all([
        supabase.from('turmas').select('status, max_alunos, valor_mensalidade, nivel, instrumento_id'),
        supabase.from('matriculas').select('status, turma_id, valor_acordado')
      ]);

      if (turmasResult.error || matriculasResult.error) {
        console.error('Erro ao buscar estatísticas:', turmasResult.error || matriculasResult.error);
        return { success: false, error: 'Erro ao buscar dados', data: {} };
      }

      const turmas = turmasResult.data || [];
      const matriculas = matriculasResult.data || [];

      // Processar estatísticas
      const turmasAtivas = turmas.filter(t => t.status === 'ativa');
      const matriculasAtivas = matriculas.filter(m => m.status === 'ativa');

      const stats = {
        total_turmas: turmas.length,
        turmas_ativas: turmasAtivas.length,
        total_matriculas: matriculas.length,
        matriculas_ativas: matriculasAtivas.length,
        
        receita_mensal_prevista: matriculasAtivas.reduce((sum, m) => sum + (m.valor_acordado || 0), 0),
        
        ocupacao_media: turmasAtivas.length > 0 ? 
          Math.round(matriculasAtivas.length / turmasAtivas.reduce((sum, t) => sum + t.max_alunos, 0) * 100) : 0,
        
        distribuicao_nivel: {},
        turmas_por_status: {}
      };

      // Distribuição por nível
      turmas.forEach(turma => {
        const nivel = turma.nivel || 'iniciante';
        stats.distribuicao_nivel[nivel] = (stats.distribuicao_nivel[nivel] || 0) + 1;
      });

      // Turmas por status
      turmas.forEach(turma => {
        const status = turma.status || 'planejada';
        stats.turmas_por_status[status] = (stats.turmas_por_status[status] || 0) + 1;
      });

      return { success: true, data: stats };
    } catch (error) {
      console.error('Erro no service getEstatisticasTurmas:', error);
      return { success: false, error: error.message, data: {} };
    }
  }
};