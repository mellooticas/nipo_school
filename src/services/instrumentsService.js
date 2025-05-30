import { supabase } from '../shared/lib/supabase/supabaseClient';

/**
 * Service para gerenciamento de instrumentos
 */
export const instrumentsService = {

  // ==========================================
  // INSTRUMENTOS
  // ==========================================

  /**
   * Buscar todos os instrumentos
   */
  async getInstrumentos() {
    try {
      const { data, error } = await supabase
        .from('instrumentos')
        .select('*')
        .eq('ativo', true)
        .order('ordem_exibicao');

      if (error) {
        console.error('Erro ao buscar instrumentos:', error);
        return { success: false, error: error.message, data: [] };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro no service getInstrumentos:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Buscar instrumentos por categoria
   */
  async getInstrumentosByCategory(categoria) {
    try {
      const { data, error } = await supabase
        .from('instrumentos')
        .select('*')
        .eq('categoria', categoria)
        .eq('ativo', true)
        .order('ordem_exibicao');

      if (error) {
        console.error('Erro ao buscar instrumentos por categoria:', error);
        return { success: false, error: error.message, data: [] };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro no service getInstrumentosByCategory:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Buscar professores que ensinam um instrumento específico
   */
  async getProfessoresByInstrumento(instrumentoId) {
    try {
      const { data, error } = await supabase
        .from('professor_instrumentos')
        .select(`
          *,
          professor:professores!professor_id (
            id,
            ativo,
            biografia,
            profiles:id (
              full_name,
              email,
              phone
            )
          ),
          instrumento:instrumentos!instrumento_id (
            nome,
            categoria
          )
        `)
        .eq('instrumento_id', instrumentoId)
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao buscar professores por instrumento:', error);
        return { success: false, error: error.message, data: [] };
      }

      // Processar dados para facilitar uso
      const processedData = data.map(item => ({
        id: item.id,
        professor_id: item.professor.id,
        nome: item.professor.profiles?.full_name || 'Professor',
        email: item.professor.profiles?.email || '',
        telefone: item.professor.profiles?.phone || '',
        biografia: item.professor.biografia,
        instrumento: item.instrumento.nome,
        categoria_instrumento: item.instrumento.categoria,
        nivel_ensino: item.nivel_ensino,
        anos_experiencia: item.anos_experiencia,
        certificacoes: item.certificacoes
      }));

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Erro no service getProfessoresByInstrumento:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Buscar alunos que estudam um instrumento específico
   */
  async getAlunosByInstrumento(instrumentoId) {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select(`
          *,
          profiles:id (
            full_name,
            email,
            phone,
            last_active
          ),
          instrumento:instrumentos!instrumento_id (
            nome,
            categoria
          )
        `)
        .eq('instrumento_id', instrumentoId)
        .eq('ativo', true)
        .order('criado_em', { ascending: false });

      if (error) {
        console.error('Erro ao buscar alunos por instrumento:', error);
        return { success: false, error: error.message, data: [] };
      }

      // Processar dados
      const processedData = data.map(aluno => ({
        id: aluno.id,
        nome: aluno.profiles?.full_name || 'Aluno',
        email: aluno.profiles?.email || '',
        telefone: aluno.profiles?.phone || '',
        instrumento: aluno.instrumento?.nome || '',
        categoria_instrumento: aluno.instrumento?.categoria || '',
        nivel: aluno.nivel,
        data_ingresso: aluno.data_ingresso,
        turma: aluno.turma,
        ultimo_acesso: aluno.profiles?.last_active,
        ativo_recentemente: aluno.profiles?.last_active && 
          new Date(aluno.profiles.last_active) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }));

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Erro no service getAlunosByInstrumento:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Buscar estatísticas por instrumento
   */
  async getEstatisticasByInstrumento() {
    try {
      const { data: instrumentos, error: instError } = await supabase
        .from('instrumentos')
        .select('*')
        .eq('ativo', true);

      if (instError) {
        console.error('Erro ao buscar instrumentos:', instError);
        return { success: false, error: instError.message, data: {} };
      }

      const estatisticas = [];

      for (const instrumento of instrumentos) {
        // Buscar alunos
        const { data: alunos } = await supabase
          .from('alunos')
          .select('id, nivel, criado_em')
          .eq('instrumento_id', instrumento.id)
          .eq('ativo', true);

        // Buscar professores
        const { data: professores } = await supabase
          .from('professor_instrumentos')
          .select('id, anos_experiencia')
          .eq('instrumento_id', instrumento.id)
          .eq('ativo', true);

        // Processar estatísticas por nível
        const porNivel = {};
        alunos?.forEach(aluno => {
          const nivel = aluno.nivel || 'iniciante';
          porNivel[nivel] = (porNivel[nivel] || 0) + 1;
        });

        // Novos alunos nos últimos 30 dias
        const agora = new Date();
        const ultimos30Dias = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
        const novosAlunos = alunos?.filter(a => 
          a.criado_em && new Date(a.criado_em) >= ultimos30Dias
        ).length || 0;

        estatisticas.push({
          instrumento_id: instrumento.id,
          instrumento_nome: instrumento.nome,
          categoria: instrumento.categoria,
          total_alunos: alunos?.length || 0,
          total_professores: professores?.length || 0,
          novos_alunos_30dias: novosAlunos,
          distribuicao_nivel: porNivel,
          media_experiencia_professores: professores?.length > 0 ? 
            Math.round(professores.reduce((sum, p) => sum + (p.anos_experiencia || 0), 0) / professores.length) : 0
        });
      }

      // Ordenar por total de alunos
      estatisticas.sort((a, b) => b.total_alunos - a.total_alunos);

      return { success: true, data: estatisticas };
    } catch (error) {
      console.error('Erro no service getEstatisticasByInstrumento:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Adicionar instrumento a um professor
   */
  async addInstrumentoToProfessor(professorId, instrumentoId, dados = {}) {
    try {
      const { data, error } = await supabase
        .from('professor_instrumentos')
        .insert({
          professor_id: professorId,
          instrumento_id: instrumentoId,
          nivel_ensino: dados.nivel_ensino || 'todos',
          anos_experiencia: dados.anos_experiencia || 0,
          certificacoes: dados.certificacoes || null
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar instrumento ao professor:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro no service addInstrumentoToProfessor:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Remover instrumento de um professor
   */
  async removeInstrumentoFromProfessor(professorId, instrumentoId) {
    try {
      const { error } = await supabase
        .from('professor_instrumentos')
        .delete()
        .eq('professor_id', professorId)
        .eq('instrumento_id', instrumentoId);

      if (error) {
        console.error('Erro ao remover instrumento do professor:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro no service removeInstrumentoFromProfessor:', error);
      return { success: false, error: error.message };
    }
  }
};