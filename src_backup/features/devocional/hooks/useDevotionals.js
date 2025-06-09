import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export const useDevotionals = () => {
  const [devotionals, setDevotionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Buscar devocionais publicados
  const fetchDevotionals = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('devotional_content')
        .select('*')
        .eq('is_published', true)
        .order('published_date', { ascending: false });

      if (error) throw error;

      // Se usuário logado, buscar progresso de leitura
      let devotionalsWithProgress = data;
      if (user) {
        const { data: progressData } = await supabase
          .from('user_devotional_progress')
          .select('devotional_id, read_at, is_favorite, personal_notes')
          .eq('user_id', user.id);

        const progressMap = new Map(
          (progressData || []).map(p => [p.devotional_id, p])
        );

        devotionalsWithProgress = data.map(devotional => ({
          ...devotional,
          is_read: progressMap.has(devotional.id),
          read_at: progressMap.get(devotional.id)?.read_at || null,
          is_favorite: progressMap.get(devotional.id)?.is_favorite || false,
          personal_notes: progressMap.get(devotional.id)?.personal_notes || null
        }));
      }

      setDevotionals(devotionalsWithProgress);
    } catch (err) {
      console.error('Erro ao buscar devocionais:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Marcar devocional como lido
  const markAsRead = async (devotionalId, personalNotes = null) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('user_devotional_progress')
        .upsert({
          user_id: user.id,
          devotional_id: devotionalId,
          read_at: new Date().toISOString(),
          personal_notes: personalNotes
        }, {
          onConflict: 'user_id,devotional_id'
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar view count do devocional
      await supabase.rpc('increment_devotional_view_count', {
        devotional_id: devotionalId
      });

      // Atualizar estado local
      setDevotionals(prev => prev.map(d => 
        d.id === devotionalId 
          ? { 
              ...d, 
              is_read: true, 
              read_at: data.read_at,
              personal_notes: data.personal_notes,
              view_count: (d.view_count || 0) + 1
            }
          : d
      ));

      return data;
    } catch (err) {
      console.error('Erro ao marcar como lido:', err);
      throw err;
    }
  };

  // Favoritar/desfavoritar devocional
  const toggleFavorite = async (devotionalId) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const devotional = devotionals.find(d => d.id === devotionalId);
      const newFavoriteStatus = !devotional?.is_favorite;

      const { data, error } = await supabase
        .from('user_devotional_progress')
        .upsert({
          user_id: user.id,
          devotional_id: devotionalId,
          is_favorite: newFavoriteStatus,
          read_at: devotional?.is_read ? devotional.read_at : new Date().toISOString()
        }, {
          onConflict: 'user_id,devotional_id'
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar estado local
      setDevotionals(prev => prev.map(d => 
        d.id === devotionalId 
          ? { 
              ...d, 
              is_favorite: newFavoriteStatus,
              is_read: true,
              read_at: data.read_at
            }
          : d
      ));

      return data;
    } catch (err) {
      console.error('Erro ao favoritar:', err);
      throw err;
    }
  };

  // Adicionar/atualizar anotações pessoais
  const updatePersonalNotes = async (devotionalId, notes) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('user_devotional_progress')
        .upsert({
          user_id: user.id,
          devotional_id: devotionalId,
          personal_notes: notes,
          read_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,devotional_id'
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar estado local
      setDevotionals(prev => prev.map(d => 
        d.id === devotionalId 
          ? { 
              ...d, 
              personal_notes: notes,
              is_read: true,
              read_at: data.read_at
            }
          : d
      ));

      return data;
    } catch (err) {
      console.error('Erro ao atualizar anotações:', err);
      throw err;
    }
  };

  // Obter devocional do dia
  const getTodayDevotional = () => {
    const today = new Date().toISOString().split('T')[0];
    return devotionals.find(d => 
      d.published_date === today || 
      (d.category === 'daily' && !d.is_read)
    ) || devotionals[0];
  };

  // Filtrar por categoria
  const filterByCategory = (category) => {
    if (!category) return devotionals;
    return devotionals.filter(d => d.category === category);
  };

  // Obter favoritos
  const getFavorites = () => {
    return devotionals.filter(d => d.is_favorite);
  };

  // Obter devocionais lidos
  const getReadDevotionals = () => {
    return devotionals.filter(d => d.is_read);
  };

  // Obter estatísticas de leitura
  const getReadingStats = () => {
    const totalDevotionals = devotionals.length;
    const readDevotionals = devotionals.filter(d => d.is_read).length;
    const favoriteDevotionals = devotionals.filter(d => d.is_favorite).length;
    const withNotes = devotionals.filter(d => d.personal_notes).length;

    const categoryStats = devotionals.reduce((stats, devotional) => {
      const category = devotional.category;
      if (!stats[category]) {
        stats[category] = { total: 0, read: 0 };
      }
      stats[category].total += 1;
      if (devotional.is_read) {
        stats[category].read += 1;
      }
      return stats;
    }, {});

    return {
      total: totalDevotionals,
      read: readDevotionals,
      favorites: favoriteDevotionals,
      withNotes,
      readingPercentage: totalDevotionals > 0 
        ? Math.round((readDevotionals / totalDevotionals) * 100) 
        : 0,
      categoryStats
    };
  };

  // Buscar devocional específico
  const getDevotional = async (devotionalId) => {
    try {
      const { data, error } = await supabase
        .from('devotional_content')
        .select('*')
        .eq('id', devotionalId)
        .eq('is_published', true)
        .single();

      if (error) throw error;

      // Se usuário logado, buscar progresso
      if (user) {
        const { data: progressData } = await supabase
          .from('user_devotional_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('devotional_id', devotionalId)
          .single();

        return {
          ...data,
          is_read: !!progressData,
          read_at: progressData?.read_at || null,
          is_favorite: progressData?.is_favorite || false,
          personal_notes: progressData?.personal_notes || null
        };
      }

      return data;
    } catch (err) {
      console.error('Erro ao buscar devocional:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchDevotionals();
  }, [user]);

  return {
    devotionals,
    loading,
    error,
    fetchDevotionals,
    markAsRead,
    toggleFavorite,
    updatePersonalNotes,
    getTodayDevotional,
    filterByCategory,
    getFavorites,
    getReadDevotionals,
    getReadingStats,
    getDevotional,
    refetch: fetchDevotionals
  };
};