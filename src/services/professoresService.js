import { supabase } from '../shared/lib/supabase/supabaseClient';

/**
 * Service para gerenciar conteúdos dos professores
 * Integração completa com Supabase (Database + Storage)
 * NORMALIZADO para Design System Nipo School
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
          autor:profiles(id, nome, email, avatar_url)
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
      
      if (filtros.nivel_dificuldade || filtros.nivel) {
        query = query.eq('nivel_dificuldade', filtros.nivel_dificuldade || filtros.nivel);
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
        console.error('🚫 Erro ao buscar conteúdos:', error);
        return { success: false, error: error.message, data: [] };
      }

      // Processar dados seguindo padrão Nipo School
      const processedData = data.map(conteudo => ({
        ...conteudo,
        // Campos padronizados
        autor_nome: conteudo.autor?.nome || 'Professor Anônimo',
        autor_avatar: conteudo.autor?.avatar_url || null,
        categoria_nome: conteudo.categoria || 'Geral',
        categoria_icone: this.getCategoriaIcone(conteudo.categoria),
        tags: Array.isArray(conteudo.tags) ? conteudo.tags : [],
        // Compatibilidade com componentes
        nivel: conteudo.nivel_dificuldade || 'iniciante',
        atualizado_em: conteudo.editado_em || conteudo.criado_em,
        imagem_capa: conteudo.thumbnail_url,
        // Status formatado para UI
        status_texto: conteudo.visivel ? 'Visível' : 'Oculto',
        status_cor: conteudo.visivel ? 'success' : 'warning',
        // Datas formatadas
        criado_em_formato: this.formatarData(conteudo.criado_em),
        atualizado_em_formato: this.formatarData(conteudo.editado_em || conteudo.criado_em)
      }));

      return { success: true, data: processedData };
    } catch (error) {
      console.error('🚫 Erro no service getConteudos:', error);
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
        console.error('🚫 Erro ao buscar conteúdo:', error);
        return { success: false, error: error.message, data: null };
      }

      // Incrementar visualizações
      await this.incrementarVisualizacao(id);

      const processedData = {
        ...data,
        autor_nome: data.autor?.nome || 'Professor Anônimo',
        autor_avatar: data.autor?.avatar_url,
        categoria_nome: data.categoria || 'Geral',
        categoria_icone: this.getCategoriaIcone(data.categoria),
        tags: Array.isArray(data.tags) ? data.tags : [],
        // Compatibilidade
        nivel: data.nivel_dificuldade || 'iniciante',
        atualizado_em: data.editado_em || data.criado_em,
        imagem_capa: data.thumbnail_url,
        // Status formatado
        status_texto: data.visivel ? 'Visível' : 'Oculto',
        status_cor: data.visivel ? 'success' : 'warning',
        // Datas formatadas
        criado_em_formato: this.formatarData(data.criado_em),
        atualizado_em_formato: this.formatarData(data.editado_em || data.criado_em)
      };

      return { success: true, data: processedData };
    } catch (error) {
      console.error('🚫 Erro no service getConteudoById:', error);
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
        .select(`
          *,
          autor:profiles(id, nome, email, avatar_url)
        `)
        .eq('criado_por', autorId)
        .eq('ativo', true)
        .order('criado_em', { ascending: false });

      if (error) {
        console.error('🚫 Erro ao buscar conteúdos do autor:', error);
        return { success: false, error: error.message, data: [] };
      }

      const processedData = data.map(conteudo => ({
        ...conteudo,
        autor_nome: conteudo.autor?.nome || 'Professor Anônimo',
        autor_avatar: conteudo.autor?.avatar_url,
        categoria_nome: conteudo.categoria || 'Geral',
        categoria_icone: this.getCategoriaIcone(conteudo.categoria),
        tags: Array.isArray(conteudo.tags) ? conteudo.tags : [],
        // Compatibilidade
        nivel: conteudo.nivel_dificuldade || 'iniciante',
        atualizado_em: conteudo.editado_em || conteudo.criado_em,
        imagem_capa: conteudo.thumbnail_url,
        // Status
        status_texto: conteudo.visivel ? 'Visível' : 'Oculto',
        status_cor: conteudo.visivel ? 'success' : 'warning'
      }));

      return { success: true, data: processedData };
    } catch (error) {
      console.error('🚫 Erro no service getConteudosByAutor:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Criar novo conteúdo
   */
  async createConteudo(dadosConteudo, arquivos = {}) {
    try {
      // Upload de arquivos se existirem
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

      // Preparar dados com validações
      const dadosParaInserir = {
        titulo: dadosConteudo.titulo?.trim() || 'Sem título',
        tipo: dadosConteudo.tipo || 'material',
        descricao: dadosConteudo.descricao?.trim() || '',
        url_video: dadosConteudo.url_video?.trim() || null,
        categoria: dadosConteudo.categoria || dadosConteudo.categoria_nome || 'Geral',
        nivel_dificuldade: dadosConteudo.nivel || dadosConteudo.nivel_dificuldade || 'iniciante',
        duracao_minutos: parseInt(dadosConteudo.duracao_minutos) || null,
        tags: Array.isArray(dadosConteudo.tags) ? dadosConteudo.tags : [],
        visivel: dadosConteudo.visivel !== false, // default true
        destaque: Boolean(dadosConteudo.destaque),
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
          autor:profiles(id, nome, email, avatar_url)
        `)
        .single();

      if (error) {
        console.error('🚫 Erro ao criar conteúdo:', error);
        return { success: false, error: error.message };
      }

      const processedData = {
        ...data,
        autor_nome: data.autor?.nome || 'Professor Anônimo',
        autor_avatar: data.autor?.avatar_url,
        categoria_nome: data.categoria || 'Geral',
        categoria_icone: this.getCategoriaIcone(data.categoria),
        tags: Array.isArray(data.tags) ? data.tags : [],
        nivel: data.nivel_dificuldade,
        atualizado_em: data.editado_em,
        imagem_capa: data.thumbnail_url
      };

      return { success: true, data: processedData };
    } catch (error) {
      console.error('🚫 Erro no service createConteudo:', error);
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
        titulo: dadosConteudo.titulo?.trim(),
        tipo: dadosConteudo.tipo,
        descricao: dadosConteudo.descricao?.trim(),
        url_video: dadosConteudo.url_video?.trim() || null,
        categoria: dadosConteudo.categoria || dadosConteudo.categoria_nome,
        nivel_dificuldade: dadosConteudo.nivel || dadosConteudo.nivel_dificuldade,
        duracao_minutos: dadosConteudo.duracao_minutos ? parseInt(dadosConteudo.duracao_minutos) : null,
        tags: Array.isArray(dadosConteudo.tags) ? dadosConteudo.tags : undefined,
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
          autor:profiles(id, nome, email, avatar_url)
        `)
        .single();

      if (error) {
        console.error('🚫 Erro ao atualizar conteúdo:', error);
        return { success: false, error: error.message };
      }

      const processedData = {
        ...data,
        autor_nome: data.autor?.nome || 'Professor Anônimo',
        autor_avatar: data.autor?.avatar_url,
        categoria_nome: data.categoria || 'Geral',
        categoria_icone: this.getCategoriaIcone(data.categoria),
        tags: Array.isArray(data.tags) ? data.tags : [],
        nivel: data.nivel_dificuldade,
        atualizado_em: data.editado_em,
        imagem_capa: data.thumbnail_url
      };

      return { success: true, data: processedData };
    } catch (error) {
      console.error('🚫 Erro no service updateConteudo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Deletar conteúdo (soft delete)
   */
  async deleteConteudo(id) {
    try {
      const { error } = await supabase
        .from('professores_conteudos')
        .update({ 
          ativo: false,
          editado_em: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('🚫 Erro ao deletar conteúdo:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('🚫 Erro no service deleteConteudo:', error);
      return { success: false, error: error.message };
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
        .select('tipo, visivel, visualizacoes, downloads, ativo, destaque')
        .eq('ativo', true);

      if (error) {
        console.error('🚫 Erro ao buscar estatísticas:', error);
        return { success: false, error: error.message, data: this.getEstatsVazias() };
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
      console.error('🚫 Erro no service getEstatisticasGerais:', error);
      return { success: false, error: error.message, data: this.getEstatsVazias() };
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
        console.error('🚫 Erro ao buscar estatísticas do autor:', error);
        return { success: false, error: error.message, data: this.getEstatsVazias() };
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
      console.error('🚫 Erro no service getEstatisticasAutor:', error);
      return { success: false, error: error.message, data: this.getEstatsVazias() };
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
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('🚫 Erro no upload:', error);
        return { success: false, error: error.message };
      }

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
      console.error('🚫 Erro no service uploadFile:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Incrementar visualização de um conteúdo
   */
  async incrementarVisualizacao(conteudoId) {
    try {
      // Tentar usar função do banco primeiro
      const { error: rpcError } = await supabase.rpc('incrementar_visualizacao', {
        conteudo_id: conteudoId
      });

      // Se a função não existir, fazer update manual
      if (rpcError && rpcError.message.includes('function')) {
        const { error } = await supabase
          .from('professores_conteudos')
          .update({ 
            visualizacoes: supabase.raw('visualizacoes + 1'),
            editado_em: new Date().toISOString()
          })
          .eq('id', conteudoId);

        if (error) {
          console.error('🚫 Erro ao incrementar visualização (manual):', error);
        }
      } else if (rpcError) {
        console.error('🚫 Erro ao incrementar visualização (RPC):', rpcError);
      }
    } catch (error) {
      console.error('🚫 Erro no service incrementarVisualizacao:', error);
    }
  },

  /**
   * Incrementar download de um conteúdo
   */
  async incrementarDownload(conteudoId) {
    try {
      // Tentar usar função do banco primeiro
      const { error: rpcError } = await supabase.rpc('incrementar_download', {
        conteudo_id: conteudoId
      });

      // Se a função não existir, fazer update manual
      if (rpcError && rpcError.message.includes('function')) {
        const { error } = await supabase
          .from('professores_conteudos')
          .update({ 
            downloads: supabase.raw('downloads + 1'),
            editado_em: new Date().toISOString()
          })
          .eq('id', conteudoId);

        if (error) {
          console.error('🚫 Erro ao incrementar download (manual):', error);
        }
      } else if (rpcError) {
        console.error('🚫 Erro ao incrementar download (RPC):', rpcError);
      }
    } catch (error) {
      console.error('🚫 Erro no service incrementarDownload:', error);
    }
  },

  // ==========================================
  // UTILITÁRIOS INTERNOS
  // ==========================================

  /**
   * Obter ícone da categoria baseado no tipo
   */
  getCategoriaIcone(categoria) {
    const icones = {
      'sacada': '💡',
      'video': '📹',
      'devocional': '🙏',
      'material': '📚',
      'apresentacao': '📊',
      'audio': '🎵',
      'imagem': '🖼️',
      'documento': '📄',
      'planilha': '📈',
      'geral': '📋',
      'default': '📚'
    };

    return icones[categoria?.toLowerCase()] || icones.default;
  },

  /**
   * Formatar data para exibição
   */
  formatarData(dataString) {
    if (!dataString) return 'Data não disponível';
    
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  },

  /**
   * Retornar estatísticas vazias em caso de erro
   */
  getEstatsVazias() {
    return {
      total: 0,
      visiveis: 0,
      ocultos: 0,
      destaques: 0,
      visualizacoes: 0,
      downloads: 0,
      por_tipo: {
        sacada: 0,
        video: 0,
        devocional: 0,
        material: 0
      }
    };
  }
};