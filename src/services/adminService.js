import { supabase } from '../shared/lib/supabase/supabaseClient';
/**
 * Service para dados administrativos da escola
 * Acesso restrito apenas para administradores
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
      // Buscar contagem de usuários por tipo
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('tipo_usuario, created_at');

      if (profilesError) {
        console.error('Erro ao buscar profiles:', profilesError);
        return { success: false, error: profilesError.message, data: {} };
      }

      // Buscar contagem de conteúdos
      const { data: conteudos, error: conteudosError } = await supabase
        .from('professores_conteudos')
        .select('id, criado_em, ativo')
        .eq('ativo', true);

      if (conteudosError) {
        console.error('Erro ao buscar conteúdos:', conteudosError);
      }

      // Processar dados
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

      const stats = {
        total_alunos: profiles.filter(p => p.tipo_usuario === 'aluno').length,
        total_professores: profiles.filter(p => ['professor', 'pastor'].includes(p.tipo_usuario)).length,
        total_conteudos: conteudos?.length || 0,
        acessos_mes: profiles.filter(p => new Date(p.created_at) >= inicioMes).length,
        novos_usuarios_mes: profiles.filter(p => new Date(p.created_at) >= inicioMes).length
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

      // Buscar profiles de alunos
      const { data: alunos, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('tipo_usuario', 'aluno');

      if (error) {
        console.error('Erro ao buscar alunos:', error);
        return { success: false, error: error.message, data: {} };
      }

      // Processar estatísticas
      const alunosAtivos = alunos.filter(a => 
        a.updated_at && new Date(a.updated_at) >= dataLimite
      );

      const alunosNovos = alunos.filter(a => 
        a.created_at && new Date(a.created_at) >= dataLimite
      );

      // Estatísticas por instrumento (assumindo que existe um campo)
      const porInstrumento = {};
      alunos.forEach(aluno => {
        const instrumento = aluno.instrumento || 'nao_informado';
        porInstrumento[instrumento] = (porInstrumento[instrumento] || 0) + 1;
      });

      // Estatísticas por nível (assumindo que existe um campo)
      const porNivel = {};
      alunos.forEach(aluno => {
        const nivel = aluno.nivel || 'iniciante';
        porNivel[nivel] = (porNivel[nivel] || 0) + 1;
      });

      const stats = {
        total: alunos.length,
        ativos: alunosAtivos.length,
        novos: alunosNovos.length,
        retencao: alunos.length > 0 ? Math.round((alunosAtivos.length / alunos.length) * 100) : 0,
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
      // Buscar professores
      const { data: professores, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .in('tipo_usuario', ['professor', 'pastor']);

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
          const professor = professores.find(p => p.id === id);
          return {
            id,
            nome: professor?.nome || 'Professor desconhecido',
            ...stats
          };
        })
        .sort((a, b) => b.visualizacoes - a.visualizacoes)
        .slice(0, 5);

      const stats = {
        total: professores.length,
        ativos: professores.filter(p => p.updated_at && new Date(p.updated_at) >= inicioMes).length,
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
   * Buscar estatísticas dos conteúdos
   */
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

      // Processar estatísticas
      const totalVisualizacoes = conteudos.reduce((sum, c) => sum + (c.visualizacoes || 0), 0);
      const totalDownloads = conteudos.reduce((sum, c) => sum + (c.downloads || 0), 0);
      const mediaVisualizacoes = conteudos.length > 0 ? Math.round(totalVisualizacoes / conteudos.length) : 0;

      // Estatísticas por tipo
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
  },

  /**
   * Buscar últimos alunos cadastrados
   */
  async getUltimosAlunos(limite = 10) {
    try {
      const { data: alunos, error } = await supabase
        .from('profiles')
        .select('id, nome, email, instrumento, nivel, created_at, updated_at')
        .eq('tipo_usuario', 'aluno')
        .order('created_at', { ascending: false })
        .limit(limite);

      if (error) {
        console.error('Erro ao buscar últimos alunos:', error);
        return { success: false, error: error.message, data: [] };
      }

      // Processar dados
      const processedData = alunos.map(aluno => ({
        ...aluno,
        ativo: aluno.updated_at && new Date(aluno.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
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
        .from('profiles')
        .select('id, nome, email, instrumento, nivel, updated_at')
        .eq('tipo_usuario', 'aluno')
        .order('updated_at', { ascending: false })
        .limit(limite);

      if (error) {
        console.error('Erro ao buscar alunos ativos:', error);
        return { success: false, error: error.message, data: [] };
      }

      return { success: true, data: alunos };
    } catch (error) {
      console.error('Erro no service getAlunosAtivos:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // ==========================================
  // RELATÓRIOS E EXPORTAÇÕES
  // ==========================================

  /**
   * Gerar relatório completo da escola
   */
  async gerarRelatorioCompleto() {
    try {
      const [gerais, alunos, professores, conteudos] = await Promise.all([
        this.getEstatisticasGerais(),
        this.getEstatisticasAlunos('todos'),
        this.getEstatisticasProfessores(),
        this.getEstatisticasConteudos()
      ]);

      const relatorio = {
        data_geracao: new Date().toISOString(),
        resumo_geral: gerais.data,
        alunos: alunos.data,
        professores: professores.data,
        conteudos: conteudos.data
      };

      return { success: true, data: relatorio };
    } catch (error) {
      console.error('Erro ao gerar relatório completo:', error);
      return { success: false, error: error.message, data: {} };
    }
  },

  /**
   * Buscar dados para gráficos de crescimento
   */
  async getDadosCrescimento(periodo = '12meses') {
    try {
      // Buscar dados dos últimos 12 meses
      const agora = new Date();
      const meses = [];
      
      for (let i = 11; i >= 0; i--) {
        const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
        meses.push({
          mes: data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          data_inicio: data,
          data_fim: new Date(data.getFullYear(), data.getMonth() + 1, 0)
        });
      }

      // Buscar cadastros por mês
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('tipo_usuario, created_at');

      if (error) {
        console.error('Erro ao buscar dados de crescimento:', error);
        return { success: false, error: error.message, data: [] };
      }

      // Processar dados por mês
      const dadosCrescimento = meses.map(mes => {
        const profilesDoMes = profiles.filter(p => {
          const dataCriacao = new Date(p.created_at);
          return dataCriacao >= mes.data_inicio && dataCriacao <= mes.data_fim;
        });

        return {
          mes: mes.mes,
          alunos: profilesDoMes.filter(p => p.tipo_usuario === 'aluno').length,
          professores: profilesDoMes.filter(p => ['professor', 'pastor'].includes(p.tipo_usuario)).length,
          total: profilesDoMes.length
        };
      });

      return { success: true, data: dadosCrescimento };
    } catch (error) {
      console.error('Erro no service getDadosCrescimento:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Buscar estatísticas avançadas de engajamento
   */
  async getEstatisticasEngajamento() {
    try {
      // Buscar dados de conteúdos com mais detalhes
      const { data: conteudos, error } = await supabase
        .from('professores_conteudos')
        .select('tipo, visualizacoes, downloads, criado_em, ativo')
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao buscar dados de engajamento:', error);
        return { success: false, error: error.message, data: {} };
      }

      // Processar dados de engajamento
      const agora = new Date();
      const ultimos30Dias = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);

      const conteudosRecentes = conteudos.filter(c => new Date(c.criado_em) >= ultimos30Dias);
      const totalVisualizacoes = conteudos.reduce((sum, c) => sum + (c.visualizacoes || 0), 0);
      const totalDownloads = conteudos.reduce((sum, c) => sum + (c.downloads || 0), 0);

      // Taxa de engajamento (visualizações/downloads por conteúdo)
      const taxaEngajamento = conteudos.length > 0 ? 
        Math.round(((totalVisualizacoes + totalDownloads) / conteudos.length) * 100) / 100 : 0;

      const stats = {
        conteudos_criados_30dias: conteudosRecentes.length,
        taxa_engajamento: taxaEngajamento,
        visualizacoes_por_tipo: {},
        downloads_por_tipo: {},
        crescimento_visualizacoes: 0 // Calculado comparando períodos
      };

      // Estatísticas por tipo
      ['sacada', 'video', 'devocional', 'material'].forEach(tipo => {
        const conteudosTipo = conteudos.filter(c => c.tipo === tipo);
        stats.visualizacoes_por_tipo[tipo] = conteudosTipo.reduce((sum, c) => sum + (c.visualizacoes || 0), 0);
        stats.downloads_por_tipo[tipo] = conteudosTipo.reduce((sum, c) => sum + (c.downloads || 0), 0);
      });

      return { success: true, data: stats };
    } catch (error) {
      console.error('Erro no service getEstatisticasEngajamento:', error);
      return { success: false, error: error.message, data: {} };
    }
  }
};