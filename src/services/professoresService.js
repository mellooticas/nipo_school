import { supabase } from '../shared/lib/supabase/supabaseClient';

class ProfessoresService {
  // ========================================
  // 📊 ESTATÍSTICAS E DASHBOARD
  // ========================================

  /**
   * Buscar estatísticas do professor logado
   */
  async getMinhasEstatisticas(professorId) {
    try {
      const { data: conteudos, error } = await supabase
        .from('professores_conteudos')
        .select('*')
        .eq('criado_por', professorId)
        .eq('ativo', true);

      if (error) throw error;

      // Calcular estatísticas
      const stats = {
        totalConteudos: conteudos.length,
        totalVisualizacoes: conteudos.reduce((sum, item) => sum + (item.visualizacoes || 0), 0),
        totalDownloads: conteudos.reduce((sum, item) => sum + (item.downloads || 0), 0),
        conteudosPorTipo: {
          video: conteudos.filter(c => c.tipo === 'video').length,
          sacada: conteudos.filter(c => c.tipo === 'sacada').length,
          devocional: conteudos.filter(c => c.tipo === 'devocional').length,
          material: conteudos.filter(c => c.tipo === 'material').length
        },
        ultimoConteudo: conteudos.length > 0 
          ? conteudos.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))[0]
          : null
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { data: null, error };
    }
  }

  /**
   * Buscar estatísticas gerais da plataforma (para admins/pastores)
   */
  async getEstatisticasGerais() {
    try {
      const { data, error } = await supabase
        .from('professores_dashboard_stats')
        .select('*');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar estatísticas gerais:', error);
      return { data: null, error };
    }
  }

  // ========================================
  // 📚 CONTEÚDOS
  // ========================================

  /**
   * Buscar todos os conteúdos (com filtros opcionais)
   */
  async getConteudos(filtros = {}) {
    try {
      let query = supabase
        .from('professores_conteudos')
        .select(`
          *,
          profiles:criado_por (
            full_name,
            avatar_url
          )
        `)
        .eq('ativo', true)
        .eq('visivel', true);

      // Aplicar filtros
      if (filtros.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }

      if (filtros.categoria) {
        query = query.eq('categoria', filtros.categoria);
      }

      if (filtros.nivel) {
        query = query.eq('nivel_dificuldade', filtros.nivel);
      }

      if (filtros.busca) {
        query = query.or(`titulo.ilike.%${filtros.busca}%,descricao.ilike.%${filtros.busca}%`);
      }

      if (filtros.tags && filtros.tags.length > 0) {
        query = query.overlaps('tags', filtros.tags);
      }

      // Ordenação
      switch (filtros.ordenacao) {
        case 'mais_visto':
          query = query.order('visualizacoes', { ascending: false });
          break;
        case 'mais_baixado':
          query = query.order('downloads', { ascending: false });
          break;
        case 'mais_antigo':
          query = query.order('criado_em', { ascending: true });
          break;
        default:
          query = query.order('criado_em', { ascending: false });
      }

      // Paginação
      if (filtros.limite) {
        query = query.limit(filtros.limite);
      }

      if (filtros.offset) {
        query = query.range(filtros.offset, filtros.offset + (filtros.limite || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar conteúdos:', error);
      return { data: null, error };
    }
  }

  /**
   * Buscar conteúdos do professor logado
   */
  async getMeusConteudos(professorId, filtros = {}) {
    try {
      let query = supabase
        .from('professores_conteudos')
        .select('*')
        .eq('criado_por', professorId);

      // Aplicar filtros (incluindo inativos para o próprio professor)
      if (filtros.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }

      if (filtros.ativo !== undefined) {
        query = query.eq('ativo', filtros.ativo);
      }

      query = query.order('criado_em', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar meus conteúdos:', error);
      return { data: null, error };
    }
  }

  /**
   * Buscar conteúdo por ID
   */
  async getConteudoPorId(id) {
    try {
      const { data, error } = await supabase
        .from('professores_conteudos')
        .select(`
          *,
          profiles:criado_por (
            full_name,
            avatar_url,
            tipo_usuario
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar conteúdo:', error);
      return { data: null, error };
    }
  }

  /**
   * Criar novo conteúdo
   */
  async criarConteudo(dadosConteudo) {
    try {
      const { data, error } = await supabase
        .from('professores_conteudos')
        .insert([dadosConteudo])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar conteúdo:', error);
      return { data: null, error };
    }
  }

  /**
   * Atualizar conteúdo
   */
  async atualizarConteudo(id, dadosConteudo) {
    try {
      const { data, error } = await supabase
        .from('professores_conteudos')
        .update(dadosConteudo)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error);
      return { data: null, error };
    }
  }

  /**
   * Deletar conteúdo (soft delete)
   */
  async deletarConteudo(id) {
    try {
      const { data, error } = await supabase
        .from('professores_conteudos')
        .update({ ativo: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao deletar conteúdo:', error);
      return { data: null, error };
    }
  }

  /**
   * Incrementar visualizações
   */
  async incrementarVisualizacao(id) {
    try {
      const { error } = await supabase.rpc('incrementar_visualizacao', {
        conteudo_id: id
      });

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Erro ao incrementar visualização:', error);
      return { success: false, error };
    }
  }

  /**
   * Incrementar downloads
   */
  async incrementarDownload(id) {
    try {
      const { data, error } = await supabase
        .from('professores_conteudos')
        .update({ downloads: supabase.sql`downloads + 1` })
        .eq('id', id);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Erro ao incrementar download:', error);
      return { success: false, error };
    }
  }

  // ========================================
  // 📂 CATEGORIAS
  // ========================================

  /**
   * Buscar todas as categorias
   */
  async getCategorias() {
    try {
      const { data, error } = await supabase
        .from('professores_categorias')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return { data: null, error };
    }
  }

  /**
   * Buscar conteúdos por categoria
   */
  async getConteudosPorCategoria(categoria, filtros = {}) {
    return this.getConteudos({ ...filtros, categoria });
  }

  // ========================================
  // 📤 UPLOAD DE ARQUIVOS
  // ========================================

  /**
   * Upload de arquivo para Supabase Storage
   */
  async uploadArquivo(arquivo, pasta = 'professores') {
    try {
      const nomeArquivo = `${Date.now()}-${arquivo.name}`;
      const caminhoArquivo = `${pasta}/${nomeArquivo}`;

      const { data, error } = await supabase.storage
        .from('conteudos')
        .upload(caminhoArquivo, arquivo);

      if (error) throw error;

      // Gerar URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('conteudos')
        .getPublicUrl(caminhoArquivo);

      return { data: { path: data.path, url: publicUrl }, error: null };
    } catch (error) {
      console.error('Erro no upload:', error);
      return { data: null, error };
    }
  }

  /**
   * Deletar arquivo do storage
   */
  async deletarArquivo(caminho) {
    try {
      const { data, error } = await supabase.storage
        .from('conteudos')
        .remove([caminho]);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      return { success: false, error };
    }
  }

  // ========================================
  // 🔍 BUSCA E FILTROS
  // ========================================

  /**
   * Busca avançada
   */
  async buscarConteudos(termo, filtros = {}) {
    return this.getConteudos({ ...filtros, busca: termo });
  }

  /**
   * Buscar tags populares
   */
  async getTagsPopulares(limite = 20) {
    try {
      // Esta query precisa ser ajustada dependendo de como o PostgreSQL lida com arrays
      const { data, error } = await supabase
        .from('professores_conteudos')
        .select('tags')
        .eq('ativo', true)
        .eq('visivel', true);

      if (error) throw error;

      // Processar tags no frontend
      const todasTags = data
        .filter(item => item.tags && item.tags.length > 0)
        .flatMap(item => item.tags);

      const contadorTags = {};
      todasTags.forEach(tag => {
        contadorTags[tag] = (contadorTags[tag] || 0) + 1;
      });

      const tagsOrdenadas = Object.entries(contadorTags)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limite)
        .map(([tag, count]) => ({ tag, count }));

      return { data: tagsOrdenadas, error: null };
    } catch (error) {
      console.error('Erro ao buscar tags populares:', error);
      return { data: null, error };
    }
  }
}

// Instância singleton
const professoresService = new ProfessoresService();
export default professoresService;