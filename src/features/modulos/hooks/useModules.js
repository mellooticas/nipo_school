import { useState, useEffect } from 'react';
import { supabase } from '../../../shared/lib/supabase/supabaseClient';
import { useAuth } from '../../../shared/contexts/AuthContext';

export const useModules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Buscar todos os módulos
  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('modules')
        .select(`
          *,
          lessons:lessons(count)
        `)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Adicionar contagem de aulas e progresso
      const modulesWithProgress = await Promise.all(
        data.map(async (module) => {
          let progress = 0;
          
          if (user) {
            // Buscar progresso do usuário para este módulo
            const { data: progressData } = await supabase
              .from('user_progress')
              .select(`
                lesson_id,
                is_completed,
                lessons!inner(module_id)
              `)
              .eq('user_id', user.id)
              .eq('lessons.module_id', module.id);

            if (progressData && progressData.length > 0) {
              const completedLessons = progressData.filter(p => p.is_completed).length;
              const totalLessons = module.lessons_count || 0;
              progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
            }
          }

          return {
            ...module,
            lessons_count: module.lessons?.[0]?.count || 0,
            progress
          };
        })
      );

      setModules(modulesWithProgress);
    } catch (err) {
      console.error('Erro ao buscar módulos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Buscar módulo específico
  const getModule = async (moduleId) => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select(`
          *,
          lessons:lessons(
            id,
            title,
            description,
            slug,
            video_url,
            video_duration_seconds,
            thumbnail_url,
            order_index,
            is_free,
            has_exercise
          )
        `)
        .eq('id', moduleId)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      // Adicionar progresso das aulas se usuário logado
      if (user && data.lessons) {
        const lessonsWithProgress = await Promise.all(
          data.lessons.map(async (lesson) => {
            const { data: progressData } = await supabase
              .from('user_progress')
              .select('*')
              .eq('user_id', user.id)
              .eq('lesson_id', lesson.id)
              .single();

            return {
              ...lesson,
              progress: progressData || null,
              is_completed: progressData?.is_completed || false,
              watch_time: progressData?.watch_time_seconds || 0
            };
          })
        );

        data.lessons = lessonsWithProgress.sort((a, b) => a.order_index - b.order_index);
      }

      return data;
    } catch (err) {
      console.error('Erro ao buscar módulo:', err);
      throw err;
    }
  };

  // Filtrar módulos por critérios
  const filterModules = (filters = {}) => {
    let filtered = [...modules];

    if (filters.level) {
      filtered = filtered.filter(m => m.level_required === filters.level);
    }

    if (filters.instrument) {
      filtered = filtered.filter(m => 
        m.instrument_category === filters.instrument || 
        m.instrument_category === 'all'
      );
    }

    if (filters.isPremium !== undefined) {
      filtered = filtered.filter(m => m.is_premium === filters.isPremium);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(searchTerm) ||
        m.description?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  };

  // Obter estatísticas dos módulos
  const getModuleStats = () => {
    const totalModules = modules.length;
    const completedModules = modules.filter(m => m.progress === 100).length;
    const inProgressModules = modules.filter(m => m.progress > 0 && m.progress < 100).length;
    const averageProgress = modules.length > 0 
      ? Math.round(modules.reduce((acc, m) => acc + m.progress, 0) / modules.length)
      : 0;

    return {
      total: totalModules,
      completed: completedModules,
      inProgress: inProgressModules,
      notStarted: totalModules - completedModules - inProgressModules,
      averageProgress
    };
  };

  useEffect(() => {
    fetchModules();
  }, [user]);

  return {
    modules,
    loading,
    error,
    fetchModules,
    getModule,
    filterModules,
    getModuleStats,
    refetch: fetchModules
  };
};