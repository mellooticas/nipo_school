import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export const useProgress = () => {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Buscar progresso do usuário
  const fetchProgress = async () => {
    if (!user) {
      setProgress([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_progress')
        .select(`
          *,
          lesson:lessons(
            id,
            title,
            description,
            video_duration_seconds,
            module:modules(
              id,
              title,
              instrument_category
            )
          )
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) throw error;

      setProgress(data || []);
    } catch (err) {
      console.error('Erro ao buscar progresso:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Iniciar ou atualizar progresso de uma aula
  const updateLessonProgress = async (lessonId, progressData) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const updateData = {
        user_id: user.id,
        lesson_id: lessonId,
        watch_time_seconds: progressData.watchTime || 0,
        last_position_seconds: progressData.lastPosition || 0,
        is_completed: progressData.isCompleted || false,
        rating: progressData.rating || null,
        notes: progressData.notes || null,
        attempts_count: progressData.attemptsCount || 1
      };

      // Se aula foi completada, definir completed_at
      if (progressData.isCompleted) {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('user_progress')
        .upsert(updateData, {
          onConflict: 'user_id,lesson_id'
        })
        .select(`
          *,
          lesson:lessons(
            id,
            title,
            module:modules(id, title)
          )
        `)
        .single();

      if (error) throw error;

      // Atualizar estado local
      setProgress(prev => {
        const existingIndex = prev.findIndex(
          p => p.lesson_id === lessonId && p.user_id === user.id
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = data;
          return updated;
        } else {
          return [data, ...prev];
        }
      });

      // Se completou a aula, verificar se completou o módulo
      if (progressData.isCompleted) {
        await checkModuleCompletion(data.lesson.module.id);
      }

      return data;
    } catch (err) {
      console.error('Erro ao atualizar progresso:', err);
      throw err;
    }
  };

  // Verificar se módulo foi completado
  const checkModuleCompletion = async (moduleId) => {
    try {
      // Buscar todas as aulas do módulo
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id')
        .eq('module_id', moduleId);

      if (!lessons || lessons.length === 0) return false;

      // Buscar progresso do usuário para essas aulas
      const { data: userProgress } = await supabase
        .from('user_progress')
        .select('lesson_id, is_completed')
        .eq('user_id', user.id)
        .in('lesson_id', lessons.map(l => l.id));

      const completedLessons = userProgress?.filter(p => p.is_completed) || [];
      const isModuleCompleted = completedLessons.length >= lessons.length;

      if (isModuleCompleted) {
        // Atualizar contador de módulos completados no perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('modules_completed')
          .eq('id', user.id)
          .single();

        const currentCount = profile?.modules_completed || 0;

        await supabase
          .from('profiles')
          .update({ 
            modules_completed: currentCount + 1,
            last_active: new Date().toISOString()
          })
          .eq('id', user.id);
      }

      return isModuleCompleted;
    } catch (err) {
      console.error('Erro ao verificar conclusão do módulo:', err);
      return false;
    }
  };

  // Obter estatísticas de progresso
  const getProgressStats = () => {
    const totalLessons = progress.length;
    const completedLessons = progress.filter(p => p.is_completed).length;
    const inProgressLessons = progress.filter(p => 
      !p.is_completed && p.watch_time_seconds > 0
    ).length;
    
    const totalWatchTime = progress.reduce((sum, p) => sum + (p.watch_time_seconds || 0), 0);
    const averageRating = progress.filter(p => p.rating && p.is_completed).length > 0
      ? progress
          .filter(p => p.rating && p.is_completed)
          .reduce((sum, p) => sum + p.rating, 0) / 
        progress.filter(p => p.rating && p.is_completed).length
      : 0;

    // Atividade por instrumento
    const instrumentStats = progress.reduce((stats, p) => {
      const instrument = p.lesson?.module?.instrument_category || 'outro';
      if (!stats[instrument]) {
        stats[instrument] = { total: 0, completed: 0 };
      }
      stats[instrument].total += 1;
      if (p.is_completed) {
        stats[instrument].completed += 1;
      }
      return stats;
    }, {});

    return {
      totalLessons,
      completedLessons,
      inProgressLessons,
      notStartedLessons: Math.max(0, totalLessons - completedLessons - inProgressLessons),
      completionPercentage: totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100) 
        : 0,
      totalWatchTimeMinutes: Math.round(totalWatchTime / 60),
      averageRating: Math.round(averageRating * 10) / 10,
      instrumentStats
    };
  };

  // Obter progresso de um módulo específico
  const getModuleProgress = (moduleId) => {
    const moduleProgress = progress.filter(
      p => p.lesson?.module?.id === moduleId
    );

    const totalLessons = moduleProgress.length;
    const completedLessons = moduleProgress.filter(p => p.is_completed).length;

    return {
      lessons: moduleProgress,
      totalLessons,
      completedLessons,
      percentage: totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100) 
        : 0,
      isCompleted: totalLessons > 0 && completedLessons >= totalLessons
    };
  };

  // Obter últimas aulas assistidas
  const getRecentProgress = (limit = 5) => {
    return progress
      .filter(p => p.watch_time_seconds > 0)
      .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
      .slice(0, limit);
  };

  useEffect(() => {
    fetchProgress();
  }, [user]);

  return {
    progress,
    loading,
    error,
    fetchProgress,
    updateLessonProgress,
    getProgressStats,
    getModuleProgress,
    getRecentProgress,
    refetch: fetchProgress
  };
};