import { supabase } from '../shared/lib/supabase/supabaseClient';

/**
 * Service para dados administrativos da escola
 * Agora usando tabelas específicas: alunos, professores
 */
export const adminService = {

  // ==========================================
  // ESTATÍSTICAS GERAIS DA ESCOLA
  // ==========================================

  /**
   * Buscar estatísticas gerais da plataforma
   */
  async getEstatisticasGerais() {
    try {
      // Buscar contagem usando tabelas específicas
      const [alunosResult, professoresResult, conteudosResult] = await Promise.all([
        supabase.from('alunos').select('id, criado_em').eq('ativo', true),
        supabase.from('professores').select('id, criado_em').eq('ativo', true),
        supabase.from('professores_conteudos').select('id, criado_em').eq('ativo', true)
      ]);

      if (alunosResult.error) {
        console.error('Erro ao buscar alunos:', alunosResult.error);
        return { success: false, error: alunosResult.error.message, data: {} };
      }

      // Processar dados
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

      const alunos = alunosResult.data || [];
      const professores = professoresResult.data || [];
      const conteudos = conteudosResult.data || [];

      const stats = {
        total_alunos: alunos.length,
        total_professores: professores.length,
        total_conteudos: conteudos.length,
        novos_alunos_mes: alunos.filter(a => a.criado_em && new Date(a.criado_em) >= inicioMes).length,
        novos_professores_mes: professores.filter(p => p.criado_em && new Date(p.criado_em) >= inicioMes).length
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Erro no service getEstatisticasGerais:', error);
      return { success: false, error: error.message, data: {} };
    }
  },

  /**
   * Buscar estatísticas detalhadas dos alunos
   */
  async getEstatisticasAlunos(periodo = '30dias') {
    try {
      // Definir data limite baseada no período
      const agora = new Date();
      let dataLimite;
      
      switch (periodo) {
        case '7dias':
          dataLimite = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30dias':
          dataLimite = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90dias':
          dataLimite = new Date(agora.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          dataLimite = new Date('2020-01-01');
      }

      // Buscar alunos da tabela específica + dados do profile
      const { data: alunosData, error } = await supabase
        .from('alunos')
        .select(`
          *,
          profiles:id (
            full_name,
            email,
            last_active,
            joined_at
          )
        `)
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao buscar alunos:', error);
        return { success: false, error: error.message, data: {} };
      }

      // Processar estatísticas
      const alunosAtivos = alunosData.filter(a => 
        a.profiles?.last_active && new Date(a.profiles.last_active) >= dataLimite
      );

      const alunosNovos = alunosData.filter(a => 
        a.criado_em && new Date(a.criado_em) >= dataLimite
      );

      // Estatísticas por instrumento
      const porInstrumento = {};
      alunosData.forEach(aluno => {
        const instrumento = aluno.instrumento || 'nao_informado';
        porInstrumento[instrumento] = (porInstrumento[instrumento] || 0) + 1;
      });

      // Estatísticas por nível
      const porNivel = {};
      alunosData.forEach(aluno => {
        const nivel = aluno.nivel || 'iniciante';
        porNivel[nivel] = (porNivel[nivel] || 0) + 1;
      });

      const stats = {
        total: alunosData.length,
        ativos: alunosAtivos.length,
        novos: alunosNovos.length,
        retencao: alunosData.length > 0 ? Math.round((alunosAtivos.length / alunosData.length) * 100) : 0,
        por_instrumento: porInstrumento,
        por_nivel: porNivel
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Erro no service getEstatisticasAlunos:', error);
      return { success: false, error: error.message, data: {} };
    }
  },

  /**
   * Buscar estatísticas dos professores
   */
  async getEstatisticasProfessores() {
    try {
      // Buscar professores da tabela específica + dados do profile
      const { data: professoresData, error: profError } = await supabase
        .from('professores')
        .select(`
          *,
          profiles:id (
            full_name,
            email,
            last_active,
            joined_at
          )
        `)
        .eq('ativo', true);

      if (profError) {
        console.error('Erro ao buscar professores:', profError);
        return { success: false, error: profError.message, data: {} };
      }

      // Buscar conteúdos dos professores
      const { data: conteudos, error: contError } = await supabase
        .from('professores_conteudos')
        .select('criado_por, visualizacoes, downloads, criado_em, ativo')
        .eq('ativo', true);

      if (contError) {
        console.error('Erro ao buscar conteúdos:', contError);
      }

      // Processar estatísticas
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

      const conteudosEstesMes = conteudos?.filter(c => 
        new Date(c.criado_em) >= inicioMes
      ) || [];

      const totalVisualizacoes = conteudos?.reduce((sum, c) => sum + (c.visualizacoes || 0), 0) || 0;
      const mediaVisualizacoes = conteudos?.length > 0 ? Math.round(totalVisualizacoes / conteudos.length) : 0;

      // Top professores por engajamento
      const professorStats = {};
      conteudos?.forEach(conteudo => {
        if (!professorStats[conteudo.criado_por]) {
          professorStats[conteudo.criado_por] = {
            conteudos: 0,
            visualizacoes: 0,
            downloads: 0
          };
        }
        professorStats[conteudo.criado_por].conteudos++;
        professorStats[conteudo.criado_por].visualizacoes += conteudo.visualizacoes || 0;
        professorStats[conteudo.criado_por].downloads += conteudo.downloads || 0;
      });

      // Correlacionar com nomes dos professores
      const topProfessores = Object.entries(professorStats)
        .map(([id, stats]) => {
          const professor = professoresData.find(p => p.id === id);
          return {
            id,
            nome: professor?.profiles?.full_name || 'Professor desconhecido',
            ...stats
          };
        })
        .sort((a, b) => b.visualizacoes - a.visualizacoes)
        .slice(0, 5);

      const stats = {
        total: professoresData.length,
        ativos: professoresData.filter(p => 
          p.profiles?.last_active && new Date(p.profiles.last_active) >= inicioMes
        ).length,
        conteudos_criados: conteudosEstesMes.length,
        media_visualizacoes: mediaVisualizacoes,
        top_professores: topProfessores
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Erro no service getEstatisticasProfessores:', error);
      return { success: false, error: error.message, data: {} };
    }
  },

  /**
   * Buscar últimos alunos cadastrados
   */
  async getUltimosAlunos(limite = 10) {
    try {
      const { data: alunos, error } = await supabase
        .from('alunos')
        .select(`
          *,
          profiles:id (
            full_name,
            email,
            last_active,
            joined_at
          )
        `)
        .eq('ativo', true)
        .order('criado_em', { ascending: false })
        .limit(limite);

      if (error) {
        console.error('Erro ao buscar últimos alunos:', error);
        return { success: false, error: error.message, data: [] };
      }

      // Processar dados para compatibilidade
      const processedData = alunos.map(aluno => ({
        id: aluno.id,
        nome: aluno.profiles?.full_name || 'Nome não informado',
        email: aluno.profiles?.email || '',
        instrumento: aluno.instrumento,
        nivel: aluno.nivel,
        created_at: aluno.criado_em,
        updated_at: aluno.profiles?.last_active,
        ativo: new Date(aluno.profiles?.last_active || 0) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }));

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Erro no service getUltimosAlunos:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Buscar alunos mais ativos
   */
  async getAlunosAtivos(limite = 20) {
    try {
      const { data: alunos, error } = await supabase
        .from('alunos')
        .select(`
          *,
          profiles:id (
            full_name,
            email,
            last_active
          )
        `)
        .eq('ativo', true)
        .order('criado_em', { ascending: false })
        .limit(limite);

      if (error) {
        console.error('Erro ao buscar alunos ativos:', error);
        return { success: false, error: error.message, data: [] };
      }

      // Ordenar por atividade mais recente
      const sortedByActivity = alunos
        .filter(a => a.profiles?.last_active)
        .sort((a, b) => new Date(b.profiles.last_active) - new Date(a.profiles.last_active))
        .slice(0, limite);

      // Mapear campos para compatibilidade
      const processedData = sortedByActivity.map(aluno => ({
        id: aluno.id,
        nome: aluno.profiles?.full_name || 'Nome não informado',
        email: aluno.profiles?.email || '',
        instrumento: aluno.instrumento,
        nivel: aluno.nivel,
        updated_at: aluno.profiles?.last_active
      }));

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Erro no service getAlunosAtivos:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Manter outros métodos iguais...
  async getEstatisticasConteudos() {
    try {
      const { data: conteudos, error } = await supabase
        .from('professores_conteudos')
        .select('tipo, visualizacoes, downloads, ativo')
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao buscar conteúdos:', error);
        return { success: false, error: error.message, data: {} };
      }

      const totalVisualizacoes = conteudos.reduce((sum, c) => sum + (c.visualizacoes || 0), 0);
      const totalDownloads = conteudos.reduce((sum, c) => sum + (c.downloads || 0), 0);
      const mediaVisualizacoes = conteudos.length > 0 ? Math.round(totalVisualizacoes / conteudos.length) : 0;

      const porTipo = {};
      conteudos.forEach(conteudo => {
        const tipo = conteudo.tipo || 'outros';
        porTipo[tipo] = (porTipo[tipo] || 0) + 1;
      });

      const stats = {
        total: conteudos.length,
        visualizacoes: totalVisualizacoes,
        downloads: totalDownloads,
        media_visualizacoes: mediaVisualizacoes,
        por_tipo: porTipo
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Erro no service getEstatisticasConteudos:', error);
      return { success: false, error: error.message, data: {} };
    }
  }
};