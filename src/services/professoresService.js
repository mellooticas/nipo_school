import { supabase } from '../shared/lib/supabase/supabaseClient';

/**
 * Service para gerenciar conteúdos dos professores
 * Integração completa com Supabase (Database + Storage)
 * ATUALIZADO para estrutura real do banco de dados
 */
export const professoresService = {
  
  // ==========================================
  // CONTEÚDOS - CRUD COMPLETO
  // ==========================================

  /**
   * Buscar todos os conteúdos com filtros opcionais
   */
  async getConteudos(filtros = {}) {
    try {
      let query = supabase
        .from('professores_conteudos')
        .select(`
          *,
          categorias:professores_categorias(id, nome, icone),
          autor:profiles(id, nome, email)
        `)
        .eq('ativo', true)
        .order('criado_em', { ascending: false });

      // Aplicar filtros se fornecidos
      if (filtros.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }
      
      if (filtros.categoria) {
        query = query.eq('categoria', filtros.categoria);
      }
      
      if (filtros.nivel_dificuldade) {
        query = query.eq('nivel_dificuldade', filtros.nivel_dificuldade);
      }
      
      if (filtros.visivel !== undefined) {
        query = query.eq('visivel', filtros.visivel);
      }
      
      if (filtros.destaque !== undefined) {
        query = query.eq('destaque', filtros.destaque);
      }
      
      if (filtros.criado_por) {
        query = query.eq('criado_por', filtros.criado_por);
      }

      // Busca por texto
      if (filtros.busca) {
        query = query.or(`titulo.ilike.%${filtros.busca}%,descricao.ilike.%${filtros.busca}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar conteúdos:', error);
        return { success: false, error: error.message, data: [] };
      }

      // Processar dados antes de retornar
      const processedData = data.map(conteudo => ({
        ...conteudo,
        autor_nome: conteudo.autor?.nome || 'Autor desconhecido',
        categoria_nome: conteudo.categoria || 'Sem categoria',
        categoria_icone: '📚', // Ícone padrão já que não há relação com categorias
        tags: conteudo.tags || [],
        // Compatibilidade com componentes
        nivel: conteudo.nivel_dificuldade,
        atualizado_em: conteudo.editado_em
      }));

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Erro no service getConteudos:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Buscar conteúdo por ID
   */
  async getConteudoById(id) {
    try {
      const { data, error } = await supabase
        .from('professores_conteudos')
        .select(`
          *,
          autor:profiles(id, nome, email, avatar_url)
        `)
        .eq('id', id)
        .eq('ativo', true)
        .single();

      if (error) {
        console.error('Erro ao buscar conteúdo:', error);
        return { success: false, error: error.message, data: null };
      }

      // Incrementar visualizações
      await this.incrementarVisualizacao(id);

      const processedData = {
        ...data,
        autor_nome: data.autor?.nome || 'Autor desconhecido',
        autor_avatar: data.autor?.avatar_url,
        categoria_nome: data.categoria || 'Sem categoria',
        categoria_icone: '📚',
        tags: data.tags || [],
        // Compatibilidade
        nivel: data.nivel_dificuldade,
        atualizado_em: data.editado_em,
        imagem_capa: data.thumbnail_url
      };

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Erro no service getConteudoById:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  /**
   * Buscar conteúdos por autor
   */
  async getConteudosByAutor(autorId) {
    try {
      const { data, error } = await supabase
        .from('professores_conteudos')
        .select('*')
        .eq('criado_por', autorId)
        .eq('ativo', true)
        .order('criado_em', { ascending: false });

      if (error) {
        console.error('Erro ao buscar conteúdos do autor:', error);
        return { success: false, error: error.message, data: [] };
      }

      const processedData = data.map(conteudo => ({
        ...conteudo,
        categoria_nome: conteudo.categoria || 'Sem categoria',
        categoria_icone: '📚',
        tags: conteudo.tags || [],
        // Compatibilidade
        nivel: conteudo.nivel_dificuldade,
        atualizado_em: conteudo.editado_em,
        imagem_capa: conteudo.thumbnail_url
      }));

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Erro no service getConteudosByAutor:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Criar novo conteúdo
   */
  async createConteudo(dadosConteudo, arquivos = {}) {
    try {
      // Primeiro, fazer upload dos arquivos se existirem
      const urlsArquivos = {};
      
      if (arquivos.arquivo_principal) {
        const uploadResult = await this.uploadFile(
          arquivos.arquivo_principal,
          `${dadosConteudo.criado_por}/${Date.now()}-${arquivos.arquivo_principal.name}`,
          'professores-arquivos'
        );
        if (uploadResult.success) {
          urlsArquivos.url_arquivo = uploadResult.publicUrl;
        }
      }

      if (arquivos.imagem_capa) {
        const uploadResult = await this.uploadFile(
          arquivos.imagem_capa,
          `${dadosConteudo.criado_por}/${Date.now()}-${arquivos.imagem_capa.name}`,
          'professores-imagens'
        );
        if (uploadResult.success) {
          urlsArquivos.thumbnail_url = uploadResult.publicUrl;
        }
      }

      // Preparar dados para inserção adaptados à estrutura real
      const dadosParaInserir = {
        titulo: dadosConteudo.titulo,
        tipo: dadosConteudo.tipo,
        descricao: dadosConteudo.descricao,
        url_video: dadosConteudo.url_video,
        categoria: dadosConteudo.categoria || dadosConteudo.categoria_nome,
        nivel_dificuldade: dadosConteudo.nivel || dadosConteudo.nivel_dificuldade || 'iniciante',
        duracao_minutos: dadosConteudo.duracao_minutos || null,
        tags: dadosConteudo.tags || [],
        visivel: dadosConteudo.visivel !== undefined ? dadosConteudo.visivel : true,
        destaque: dadosConteudo.destaque || false,
        ativo: true,
        visualizacoes: 0,
        downloads: 0,
        criado_por: dadosConteudo.criado_por,
        editado_por: dadosConteudo.criado_por,
        criado_em: new Date().toISOString(),
        editado_em: new Date().toISOString(),
        ...urlsArquivos
      };

      const { data, error } = await supabase
        .from('professores_conteudos')
        .insert([dadosParaInserir])
        .select(`
          *,
          autor:profiles(id, nome, email)
        `)
        .single();

      if (error) {
        console.error('Erro ao criar conteúdo:', error);
        return { success: false, error: error.message };
      }

      const processedData = {
        ...data,
        autor_nome: data.autor?.nome || 'Autor desconhecido',
        categoria_nome: data.categoria || 'Sem categoria',
        categoria_icone: '📚',
        tags: data.tags || [],
        nivel: data.nivel_dificuldade,
        atualizado_em: data.editado_em,
        imagem_capa: data.thumbnail_url
      };

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Erro no service createConteudo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Atualizar conteúdo existente
   */
  async updateConteudo(id, dadosConteudo, arquivos = {}) {
    try {
      // Upload de novos arquivos se fornecidos
      const urlsArquivos = {};
      
      if (arquivos.arquivo_principal) {
        const uploadResult = await this.uploadFile(
          arquivos.arquivo_principal,
          `${dadosConteudo.criado_por || 'user'}/${Date.now()}-${arquivos.arquivo_principal.name}`,
          'professores-arquivos'
        );
        if (uploadResult.success) {
          urlsArquivos.url_arquivo = uploadResult.publicUrl;
        }
      }

      if (arquivos.imagem_capa) {
        const uploadResult = await this.uploadFile(
          arquivos.imagem_capa,
          `${dadosConteudo.criado_por || 'user'}/${Date.now()}-${arquivos.imagem_capa.name}`,
          'professores-imagens'
        );
        if (uploadResult.success) {
          urlsArquivos.thumbnail_url = uploadResult.publicUrl;
        }
      }

      // Preparar dados para atualização
      const dadosParaAtualizar = {
        titulo: dadosConteudo.titulo,
        tipo: dadosConteudo.tipo,
        descricao: dadosConteudo.descricao,
        url_video: dadosConteudo.url_video,
        categoria: dadosConteudo.categoria || dadosConteudo.categoria_nome,
        nivel_dificuldade: dadosConteudo.nivel || dadosConteudo.nivel_dificuldade,
        duracao_minutos: dadosConteudo.duracao_minutos,
        tags: dadosConteudo.tags,
        visivel: dadosConteudo.visivel,
        destaque: dadosConteudo.destaque,
        editado_por: dadosConteudo.editado_por || dadosConteudo.criado_por,
        editado_em: new Date().toISOString(),
        ...urlsArquivos
      };

      // Remover campos undefined
      Object.keys(dadosParaAtualizar).forEach(key => {
        if (dadosParaAtualizar[key] === undefined) {
          delete dadosParaAtualizar[key];
        }
      });

      const { data, error } = await supabase
        .from('professores_conteudos')
        .update(dadosParaAtualizar)
        .eq('id', id)
        .select(`
          *,
          autor:profiles(id, nome, email)
        `)
        .single();

      if (error) {
        console.error('Erro ao atualizar conteúdo:', error);
        return { success: false, error: error.message };
      }

      const processedData = {
        ...data,
        autor_nome: data.autor?.nome || 'Autor desconhecido',
        categoria_nome: data.categoria || 'Sem categoria',
        categoria_icone: '📚',
        tags: data.tags || [],
        nivel: data.nivel_dificuldade,
        atualizado_em: data.editado_em,
        imagem_capa: data.thumbnail_url
      };

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Erro no service updateConteudo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Deletar conteúdo (soft delete)
   */
  async deleteConteudo(id) {
    try {
      // Soft delete - marcar como inativo
      const { error } = await supabase
        .from('professores_conteudos')
        .update({ 
          ativo: false,
          editado_em: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar conteúdo:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro no service deleteConteudo:', error);
      return { success: false, error: error.message };
    }
  },

  // ==========================================
  // CATEGORIAS
  // ==========================================

  /**
   * Buscar todas as categorias
   */
  async getCategorias() {
    try {
      const { data, error } = await supabase
        .from('professores_categorias')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        return { success: false, error: error.message, data: [] };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Erro no service getCategorias:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // ==========================================
  // ESTATÍSTICAS
  // ==========================================

  /**
   * Buscar estatísticas gerais
   */
  async getEstatisticasGerais() {
    try {
      const { data, error } = await supabase
        .from('professores_conteudos')
        .select('tipo, visivel, visualizacoes, downloads, ativo')
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return { success: false, error: error.message, data: {} };
      }

      const stats = {
        total: data.length,
        visiveis: data.filter(c => c.visivel).length,
        ocultos: data.filter(c => !c.visivel).length,
        visualizacoes: data.reduce((sum, c) => sum + (c.visualizacoes || 0), 0),
        downloads: data.reduce((sum, c) => sum + (c.downloads || 0), 0),
        por_tipo: {
          sacada: data.filter(c => c.tipo === 'sacada').length,
          video: data.filter(c => c.tipo === 'video').length,
          devocional: data.filter(c => c.tipo === 'devocional').length,
          material: data.filter(c => c.tipo === 'material').length
        }
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Erro no service getEstatisticasGerais:', error);
      return { success: false, error: error.message, data: {} };
    }
  },

  /**
   * Buscar estatísticas de um autor específico
   */
  async getEstatisticasAutor(autorId) {
    try {
      const { data, error } = await supabase
        .from('professores_conteudos')
        .select('tipo, visivel, visualizacoes, downloads, destaque, ativo')
        .eq('criado_por', autorId)
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao buscar estatísticas do autor:', error);
        return { success: false, error: error.message, data: {} };
      }

      const stats = {
        total: data.length,
        visiveis: data.filter(c => c.visivel).length,
        ocultos: data.filter(c => !c.visivel).length,
        destaques: data.filter(c => c.destaque).length,
        visualizacoes: data.reduce((sum, c) => sum + (c.visualizacoes || 0), 0),
        downloads: data.reduce((sum, c) => sum + (c.downloads || 0), 0),
        por_tipo: {
          sacada: data.filter(c => c.tipo === 'sacada').length,
          video: data.filter(c => c.tipo === 'video').length,
          devocional: data.filter(c => c.tipo === 'devocional').length,
          material: data.filter(c => c.tipo === 'material').length
        }
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Erro no service getEstatisticasAutor:', error);
      return { success: false, error: error.message, data: {} };
    }
  },

  /**
   * Incrementar visualização de um conteúdo
   */
  async incrementarVisualizacao(conteudoId) {
    try {
      const { error } = await supabase.rpc('incrementar_visualizacao', {
        conteudo_id: conteudoId
      });

      if (error) {
        console.error('Erro ao incrementar visualização:', error);
      }
    } catch (error) {
      console.error('Erro no service incrementarVisualizacao:', error);
    }
  },

  /**
   * Incrementar download de um conteúdo
   */
  async incrementarDownload(conteudoId) {
    try {
      const { error } = await supabase.rpc('incrementar_download', {
        conteudo_id: conteudoId
      });

      if (error) {
        console.error('Erro ao incrementar download:', error);
      }
    } catch (error) {
      console.error('Erro no service incrementarDownload:', error);
    }
  },

  // ==========================================
  // STORAGE - UPLOAD/DOWNLOAD DE ARQUIVOS
  // ==========================================

  /**
   * Upload de arquivo para Supabase Storage
   */
  async uploadFile(file, fileName, bucket = 'professores-arquivos') {
    try {
      // Fazer upload do arquivo
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro no upload:', error);
        return { success: false, error: error.message };
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return {
        success: true,
        data: data,
        url: fileName,
        publicUrl: urlData.publicUrl
      };
    } catch (error) {
      console.error('Erro no service uploadFile:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Deletar arquivo do Supabase Storage
   */
  async deleteFile(fileName, bucket = 'professores-arquivos') {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (error) {
        console.error('Erro ao deletar arquivo:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro no service deleteFile:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obter URL de download de um arquivo
   */
  async getDownloadUrl(fileName, bucket = 'professores-arquivos') {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(fileName, 3600); // URL válida por 1 hora

      if (error) {
        console.error('Erro ao gerar URL de download:', error);
        return { success: false, error: error.message };
      }

      return { success: true, url: data.signedUrl };
    } catch (error) {
      console.error('Erro no service getDownloadUrl:', error);
      return { success: false, error: error.message };
    }
  },

  // ==========================================
  // BUSCA E FILTROS AVANÇADOS
  // ==========================================

  /**
   * Busca textual avançada
   */
  async buscarConteudos(termo, filtros = {}) {
    try {
      let query = supabase
        .from('professores_conteudos')
        .select(`
          *,
          autor:profiles(id, nome, email)
        `)
        .eq('visivel', true)
        .eq('ativo', true);

      // Busca textual
      if (termo) {
        query = query.or(`titulo.ilike.%${termo}%,descricao.ilike.%${termo}%`);
      }

      // Aplicar filtros adicionais
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          // Mapear campos para estrutura real
          if (key === 'nivel') {
            query = query.eq('nivel_dificuldade', value);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      query = query.order('criado_em', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Erro na busca:', error);
        return { success: false, error: error.message, data: [] };
      }

      const processedData = data.map(conteudo => ({
        ...conteudo,
        autor_nome: conteudo.autor?.nome || 'Autor desconhecido',
        categoria_nome: conteudo.categoria || 'Sem categoria',
        categoria_icone: '📚',
        tags: conteudo.tags || [],
        nivel: conteudo.nivel_dificuldade,
        atualizado_em: conteudo.editado_em,
        imagem_capa: conteudo.thumbnail_url
      }));

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Erro no service buscarConteudos:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Buscar conteúdos em destaque
   */
  async getConteudosDestaque(limite = 6) {
    try {
      const { data, error } = await supabase
        .from('professores_conteudos')
        .select(`
          *,
          autor:profiles(id, nome, email)
        `)
        .eq('visivel', true)
        .eq('ativo', true)
        .eq('destaque', true)
        .order('criado_em', { ascending: false })
        .limit(limite);

      if (error) {
        console.error('Erro ao buscar conteúdos em destaque:', error);
        return { success: false, error: error.message, data: [] };
      }

      const processedData = data.map(conteudo => ({
        ...conteudo,
        autor_nome: conteudo.autor?.nome || 'Autor desconhecido',
        categoria_nome: conteudo.categoria || 'Sem categoria',
        categoria_icone: '📚',
        tags: conteudo.tags || [],
        nivel: conteudo.nivel_dificuldade,
        atualizado_em: conteudo.editado_em,
        imagem_capa: conteudo.thumbnail_url
      }));

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Erro no service getConteudosDestaque:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Buscar conteúdos mais visualizados
   */
  async getConteudosMaisVistos(limite = 10) {
    try {
      const { data, error } = await supabase
        .from('professores_conteudos')
        .select(`
          *,
          autor:profiles(id, nome, email)
        `)
        .eq('visivel', true)
        .eq('ativo', true)
        .order('visualizacoes', { ascending: false })
        .limit(limite);

      if (error) {
        console.error('Erro ao buscar conteúdos mais vistos:', error);
        return { success: false, error: error.message, data: [] };
      }

      const processedData = data.map(conteudo => ({
        ...conteudo,
        autor_nome: conteudo.autor?.nome || 'Autor desconhecido',
        categoria_nome: conteudo.categoria || 'Sem categoria',
        categoria_icone: '📚',
        tags: conteudo.tags || [],
        nivel: conteudo.nivel_dificuldade,
        atualizado_em: conteudo.editado_em,
        imagem_capa: conteudo.thumbnail_url
      }));

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Erro no service getConteudosMaisVistos:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
};