import { supabase } from '../shared/lib/supabase/supabaseClient';

/**
 * Service para páginas específicas por instrumento
 * Integra conteúdo digital com aulas físicas
 */
export const instrumentPageService = {

  /**
   * Buscar dashboard completo do instrumento para um aluno
   */
  async getInstrumentDashboard(instrumentoId, alunoId = null) {
    try {
      // Usar a função SQL criada
      const { data, error } = await supabase
        .rpc('get_instrumento_dashboard', {
          instrumento_uuid: instrumentoId,
          aluno_uuid: alunoId
        });

      if (error) {
        console.error('Erro ao buscar dashboard do instrumento:', error);
        return { success: false, error: error.message, data: null };
      }

      return { success: true, data: data[0] || {} };
    } catch (error) {
      console.error('Erro no service getInstrumentDashboard:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  /**
   * Buscar atividades do instrumento (aulas físicas + digitais)
   */
  async getInstrumentActivities(instrumentoId, filtros = {}) {
    try {
      let query = supabase
        .from('instrumento_atividades')
        .select(`
          *,
          turma:turmas!turma_id (
            nome,
            max_alunos
          ),
          professor:professores!professor_id (
            profiles:id (
              full_name
            )
          ),
          participacoes:atividade_participacoes!atividade_id (
            id,
            status,
            aluno:alunos!aluno_id (
              profiles:id (
                full_name
              )
            )
          )
        `)
        .eq('instrumento_id', instrumentoId)
        .eq('ativo', true);

      // Aplicar filtros
      if (filtros.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros.data_inicio) {
        query = query.gte('data_inicio', filtros.data_inicio);
      }
      if (filtros.data_fim) {
        query = query.lte('data_fim', filtros.data_fim);
      }

      const { data, error } = await query.order('data_inicio');

      if (error) {
        console.error('Erro ao buscar atividades do instrumento:', error);
        return { success: false, error: error.message, data: [] };
      }

      // Processar dados
      const processedData = data.map(atividade => ({
        ...atividade,
        professor_nome: atividade.professor?.profiles?.full_name || 'Professor',
        turma_nome: atividade.turma?.nome || '',
        participantes_count: atividade.participacoes?.filter(p => p.status === 'presente').length || 0,
        vagas_disponiveis: atividade.max_participantes ? 
          Math.max(0, atividade.max_participantes - (atividade.participacoes?.length || 0)) : null
      }));

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Erro no service getInstrumentActivities:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Inscrever aluno em atividade
   */
  async inscriverEmAtividade(atividadeId, alunoId, observacoes = '') {
    try {
      const { data, error } = await supabase
        .from('atividade_participacoes')
        .insert({
          atividade_id: atividadeId,
          aluno_id: alunoId,
          status: 'inscrito',
          observacoes_aluno: observacoes
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao inscrever em atividade:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro no service inscriverEmAtividade:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Registrar tempo de prática
   */
  async registrarTempoPratica(alunoId, instrumentoId, minutos, observacoes = '') {
    try {
      // Atualizar progresso total
      const { data: progresso, error: progressoError } = await supabase
        .from('instrumento_progresso')
        .update({
          tempo_pratica_total: supabase.raw(`tempo_pratica_total + ${minutos}`),
          data_ultima_pratica: new Date().toISOString().split('T')[0]
        })
        .eq('aluno_id', alunoId)
        .eq('instrumento_id', instrumentoId)
        .select()
        .single();

      if (progressoError) {
        console.error('Erro ao atualizar progresso:', progressoError);
        return { success: false, error: progressoError.message };
      }

      return { success: true, data: progresso };
    } catch (error) {
      console.error('Erro no service registrarTempoPratica:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Buscar progresso detalhado do aluno no instrumento
   */
  async getProgressoDetalhado(alunoId, instrumentoId) {
    try {
      const { data, error } = await supabase
        .from('instrumento_progresso')
        .select(`
          *,
          aluno:alunos!aluno_id (
            profiles:id (
              full_name
            )
          ),
          instrumento:instrumentos!instrumento_id (
            nome,
            categoria
          )
        `)
        .eq('aluno_id', alunoId)
        .eq('instrumento_id', instrumentoId)
        .single();

      if (error) {
        console.error('Erro ao buscar progresso detalhado:', error);
        return { success: false, error: error.message, data: null };
      }

      // Buscar estatísticas de participação
      const { data: participacoes } = await supabase
        .from('atividade_participacoes')
        .select(`
          *,
          atividade:instrumento_atividades!atividade_id (
            tipo,
            data_inicio,
            instrumento_id
          )
        `)
        .eq('aluno_id', alunoId)
        .eq('atividade.instrumento_id', instrumentoId);

      // Processar estatísticas
      const stats = {
        total_atividades: participacoes?.length || 0,
        aulas_presenciais: participacoes?.filter(p => 
          p.atividade.tipo === 'aula_fisica' && p.status === 'presente'
        ).length || 0,
        atividades_digitais: participacoes?.filter(p => 
          p.atividade.tipo === 'aula_digital' && p.status === 'presente'
        ).length || 0,
        exercicios_completados: participacoes?.filter(p => 
          p.atividade.tipo === 'exercicio' && p.status === 'presente'
        ).length || 0,
        nota_media: participacoes?.length > 0 ? 
          participacoes.reduce((sum, p) => sum + (p.nota || 0), 0) / participacoes.length : 0
      };

      const processedData = {
        ...data,
        aluno_nome: data.aluno?.profiles?.full_name || 'Aluno',
        instrumento_nome: data.instrumento?.nome || '',
        categoria_instrumento: data.instrumento?.categoria || '',
        estatisticas_participacao: stats,
        percentual_meta_semanal: data.meta_semanal_minutos > 0 ? 
          Math.min(100, (data.tempo_pratica_total / data.meta_semanal_minutos) * 100) : 0
      };

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Erro no service getProgressoDetalhado:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  /**
   * Atualizar meta de prática semanal
   */
  async atualizarMetaSemanal(alunoId, instrumentoId, metaMinutos, objetivo = null) {
    try {
      const updateData = {
        meta_semanal_minutos: metaMinutos
      };

      if (objetivo) {
        updateData.objetivo_atual = objetivo;
      }

      const { data, error } = await supabase
        .from('instrumento_progresso')
        .update(updateData)
        .eq('aluno_id', alunoId)
        .eq('instrumento_id', instrumentoId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar meta semanal:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro no service atualizarMetaSemanal:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Buscar conteúdos recomendados para o instrumento
   */
  async getConteudosRecomendados(instrumentoId, alunoId = null, limite = 10) {
    try {
      // Se temos o aluno, personalizar baseado no nível
      let nivelAluno = 'iniciante';
      if (alunoId) {
        const { data: progresso } = await supabase
          .from('instrumento_progresso')
          .select('nivel_atual')
          .eq('aluno_id', alunoId)
          .eq('instrumento_id', instrumentoId)
          .single();
        
        nivelAluno = progresso?.nivel_atual || 'iniciante';
      }

      const { data, error } = await supabase
        .from('professores_conteudos')
        .select(`
          *,
          autor:professores!criado_por (
            profiles:id (
              full_name
            )
          )
        `)
        .eq('ativo', true)
        .eq('visivel', true)
        .in('nivel_dificuldade', [nivelAluno, 'todos'])
        .order('visualizacoes', { ascending: false })
        .limit(limite);

      if (error) {
        console.error('Erro ao buscar conteúdos recomendados:', error);
        return { success: false, error: error.message, data: [] };
      }

      const processedData = data.map(conteudo => ({
        ...conteudo,
        autor_nome: conteudo.autor?.profiles?.full_name || 'Autor'
      }));

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Erro no service getConteudosRecomendados:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Buscar configurações da página do instrumento
   */
  async getInstrumentConfig(instrumentoId) {
    try {
      const { data, error } = await supabase
        .from('instrumento_configuracoes')
        .select(`
          *,
          instrumento:instrumentos!instrumento_id (
            nome,
            categoria,
            descricao
          )
        `)
        .eq('instrumento_id', instrumentoId)
        .eq('ativo', true)
        .single();

      if (error) {
        console.error('Erro ao buscar configurações do instrumento:', error);
        return { success: false, error: error.message, data: null };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro no service getInstrumentConfig:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  /**
   * Atualizar configurações da página do instrumento (apenas admins/professores)
   */
  async updateInstrumentConfig(instrumentoId, configuracoes) {
    try {
      const { data, error } = await supabase
        .from('instrumento_configuracoes')
        .update(configuracoes)
        .eq('instrumento_id', instrumentoId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar configurações:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro no service updateInstrumentConfig:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Buscar estatísticas da comunidade do instrumento
   */
  async getComunidadeStats(instrumentoId) {
    try {
      // Buscar múltiplas estatísticas em paralelo
      const [alunosResult, professoresResult, atividadesResult, progressoResult] = await Promise.all([
        // Total de alunos
        supabase
          .from('alunos')
          .select('id, nivel, criado_em')
          .eq('instrumento_id', instrumentoId)
          .eq('ativo', true),
        
        // Professores que ensinam este instrumento
        supabase
          .from('professor_instrumentos')
          .select(`
            professor:professores!professor_id (
              profiles:id (
                full_name
              )
            )
          `)
          .eq('instrumento_id', instrumentoId)
          .eq('ativo', true),
        
        // Atividades recentes
        supabase
          .from('instrumento_atividades')
          .select('tipo, status, data_inicio')
          .eq('instrumento_id', instrumentoId)
          .eq('ativo', true)
          .gte('data_inicio', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Progresso geral
        supabase
          .from('instrumento_progresso')
          .select('nivel_atual, pontos_totais, tempo_pratica_total')
          .eq('instrumento_id', instrumentoId)
      ]);

      const alunos = alunosResult.data || [];
      const professores = professoresResult.data || [];
      const atividades = atividadesResult.data || [];
      const progressos = progressoResult.data || [];

      // Processar estatísticas
      const agora = new Date();
      const ultimosMes = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats = {
        total_alunos: alunos.length,
        total_professores: professores.length,
        novos_alunos_mes: alunos.filter(a => new Date(a.criado_em) >= ultimosMes).length,
        
        distribuicao_nivel: {},
        atividades_mes: atividades.length,
        tipos_atividades: {},
        
        tempo_pratica_total_comunidade: progressos.reduce((sum, p) => sum + (p.tempo_pratica_total || 0), 0),
        pontos_totais_comunidade: progressos.reduce((sum, p) => sum + (p.pontos_totais || 0), 0),
        
        professores_lista: professores.map(p => ({
          nome: p.professor?.profiles?.full_name || 'Professor'
        }))
      };

      // Distribuição por nível
      alunos.forEach(aluno => {
        const nivel = aluno.nivel || 'iniciante';
        stats.distribuicao_nivel[nivel] = (stats.distribuicao_nivel[nivel] || 0) + 1;
      });

      // Tipos de atividades
      atividades.forEach(atividade => {
        const tipo = atividade.tipo || 'outros';
        stats.tipos_atividades[tipo] = (stats.tipos_atividades[tipo] || 0) + 1;
      });

      return { success: true, data: stats };
    } catch (error) {
      console.error('Erro no service getComunidadeStats:', error);
      return { success: false, error: error.message, data: {} };
    }
  },

  /**
   * Criar nova atividade para o instrumento
   */
  async criarAtividade(dadosAtividade) {
    try {
      const { data, error } = await supabase
        .from('instrumento_atividades')
        .insert({
          instrumento_id: dadosAtividade.instrumento_id,
          turma_id: dadosAtividade.turma_id,
          professor_id: dadosAtividade.professor_id,
          tipo: dadosAtividade.tipo,
          titulo: dadosAtividade.titulo,
          descricao: dadosAtividade.descricao,
          data_inicio: dadosAtividade.data_inicio,
          data_fim: dadosAtividade.data_fim,
          recorrente: dadosAtividade.recorrente || false,
          recorrencia_config: dadosAtividade.recorrencia_config,
          max_participantes: dadosAtividade.max_participantes,
          local: dadosAtividade.local,
          link_online: dadosAtividade.link_online,
          materiais_necessarios: dadosAtividade.materiais_necessarios,
          pre_requisitos: dadosAtividade.pre_requisitos,
          conteudo_ids: dadosAtividade.conteudo_ids || []
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar atividade:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro no service criarAtividade:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Buscar ranking de alunos por instrumento
   */
  async getRankingAlunos(instrumentoId, criterio = 'pontos_totais', limite = 10) {
    try {
      let orderBy = 'pontos_totais';
      if (['tempo_pratica_total', 'exercicios_completados', 'aulas_assistidas'].includes(criterio)) {
        orderBy = criterio;
      }

      const { data, error } = await supabase
        .from('instrumento_progresso')
        .select(`
          *,
          aluno:alunos!aluno_id (
            profiles:id (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('instrumento_id', instrumentoId)
        .order(orderBy, { ascending: false })
        .limit(limite);

      if (error) {
        console.error('Erro ao buscar ranking:', error);
        return { success: false, error: error.message, data: [] };
      }

      const processedData = data.map((item, index) => ({
        posicao: index + 1,
        aluno_id: item.aluno_id,
        nome: item.aluno?.profiles?.full_name || 'Aluno',
        avatar_url: item.aluno?.profiles?.avatar_url,
        nivel_atual: item.nivel_atual,
        pontos_totais: item.pontos_totais,
        tempo_pratica_total: item.tempo_pratica_total,
        exercicios_completados: item.exercicios_completados,
        aulas_assistidas: item.aulas_assistidas,
        valor_criterio: item[orderBy] || 0
      }));

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Erro no service getRankingAlunos:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Registrar conclusão de exercício/atividade digital
   */
  async registrarConclusaoExercicio(alunoId, atividadeId, dados = {}) {
    try {
      const { data, error } = await supabase
        .from('atividade_participacoes')
        .upsert({
          atividade_id: atividadeId,
          aluno_id: alunoId,
          status: 'presente',
          tempo_pratica_minutos: dados.tempo_pratica || 0,
          observacoes_aluno: dados.observacoes || '',
          exercicios_completados: dados.exercicios_completados || []
        }, {
          onConflict: 'atividade_id,aluno_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao registrar conclusão:', error);
        return { success: false, error: error.message };
      }

      // Atualizar progresso geral
      await supabase
        .from('instrumento_progresso')
        .update({
          exercicios_completados: supabase.raw('exercicios_completados + 1'),
          tempo_pratica_total: supabase.raw(`tempo_pratica_total + ${dados.tempo_pratica || 0}`),
          pontos_totais: supabase.raw(`pontos_totais + ${dados.pontos_ganhos || 10}`)
        })
        .eq('aluno_id', alunoId)
        .eq('instrumento_id', dados.instrumento_id);

      return { success: true, data };
    } catch (error) {
      console.error('Erro no service registrarConclusaoExercicio:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Buscar próximas aulas/atividades do aluno
   */
  async getProximasAtividades(alunoId, instrumentoId = null, limite = 5) {
    try {
      let query = supabase
        .from('atividade_participacoes')
        .select(`
          *,
          atividade:instrumento_atividades!atividade_id (
            *,
            instrumento:instrumentos!instrumento_id (
              nome,
              categoria
            ),
            turma:turmas!turma_id (
              nome
            ),
            professor:professores!professor_id (
              profiles:id (
                full_name
              )
            )
          )
        `)
        .eq('aluno_id', alunoId)
        .eq('status', 'inscrito')
        .gte('atividade.data_inicio', new Date().toISOString());

      if (instrumentoId) {
        query = query.eq('atividade.instrumento_id', instrumentoId);
      }

      const { data, error } = await query
        .order('atividade.data_inicio')
        .limit(limite);

      if (error) {
        console.error('Erro ao buscar próximas atividades:', error);
        return { success: false, error: error.message, data: [] };
      }

      const processedData = data.map(participacao => ({
        ...participacao,
        titulo: participacao.atividade.titulo,
        tipo: participacao.atividade.tipo,
        data_inicio: participacao.atividade.data_inicio,
        data_fim: participacao.atividade.data_fim,
        local: participacao.atividade.local,
        link_online: participacao.atividade.link_online,
        instrumento_nome: participacao.atividade.instrumento?.nome || '',
        turma_nome: participacao.atividade.turma?.nome || '',
        professor_nome: participacao.atividade.professor?.profiles?.full_name || 'Professor',
        pode_cancelar: new Date(participacao.atividade.data_inicio) > new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h antes
      }));

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Erro no service getProximasAtividades:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Cancelar participação em atividade
   */
  async cancelarParticipacao(participacaoId, motivo = '') {
    try {
      const { data, error } = await supabase
        .from('atividade_participacoes')
        .update({
          status: 'cancelado',
          observacoes_aluno: motivo
        })
        .eq('id', participacaoId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao cancelar participação:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro no service cancelarParticipacao:', error);
      return { success: false, error: error.message };
    }
  }
};