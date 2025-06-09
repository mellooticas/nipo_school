import { useState, useEffect } from 'react';
import { supabase } from '../../../shared/lib/supabase/supabaseClient';
import { useAuth } from '../../../shared/contexts/AuthContext';

export const useAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Buscar todas as conquistas disponíveis
  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar conquistas ativas
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('points_reward', { ascending: true });

      if (achievementsError) throw achievementsError;

      // Buscar conquistas do usuário se logado
      let userAchievementsData = [];
      if (user) {
        const { data, error: userError } = await supabase
          .from('user_achievements')
          .select(`
            *,
            achievement:achievements(*)
          `)
          .eq('user_id', user.id);

        if (userError) throw userError;
        userAchievementsData = data || [];
      }

      // Combinar dados
      const achievementsWithStatus = achievementsData.map(achievement => {
        const userAchievement = userAchievementsData.find(
          ua => ua.achievement_id === achievement.id
        );

        return {
          ...achievement,
          earned_at: userAchievement?.earned_at || null,
          points_earned: userAchievement?.points_earned || 0,
          is_earned: !!userAchievement
        };
      });

      setAchievements(achievementsWithStatus);
      setUserAchievements(userAchievementsData);

    } catch (err) {
      console.error('Erro ao buscar conquistas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verificar e conceder conquistas automaticamente
  const checkAndGrantAchievements = async () => {
    if (!user) return;

    try {
      // Buscar dados do usuário para verificação
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      if (!profile || !progressData) return;

      // Regras de conquistas
      const rules = [
        // Progresso
        {
          achievement_name: 'Primeiro Passo',
          condition: progressData.filter(p => p.is_completed).length >= 1
        },
        {
          achievement_name: 'Estudante Dedicado',
          condition: progressData.filter(p => p.is_completed).length >= 5
        },
        {
          achievement_name: 'Conhecedor Musical',
          condition: progressData.filter(p => p.is_completed).length >= 15
        },
        {
          achievement_name: 'Mestre Músico',
          condition: progressData.filter(p => p.is_completed).length >= 50
        },

        // Consistência
        {
          achievement_name: 'Fogo Sagrado',
          condition: profile.current_streak >= 7
        },
        {
          achievement_name: 'Disciplina de Ferro',
          condition: profile.current_streak >= 30
        },
        {
          achievement_name: 'Guerreiro da Fé',
          condition: profile.best_streak >= 100
        },

        // Marcos
        {
          achievement_name: 'Primeiro Módulo',
          condition: profile.modules_completed >= 1
        },
        {
          achievement_name: 'Colecionador',
          condition: profile.modules_completed >= 3
        },
        {
          achievement_name: 'Doutor em Música',
          condition: profile.modules_completed >= 10
        }
      ];

      // Verificar cada regra
      const newAchievements = [];
      for (const rule of rules) {
        if (rule.condition) {
          const achievement = achievements.find(a => a.name === rule.achievement_name);
          if (achievement && !achievement.is_earned) {
            newAchievements.push(achievement);
          }
        }
      }

      // Conceder novas conquistas
      if (newAchievements.length > 0) {
        const insertData = newAchievements.map(achievement => ({
          user_id: user.id,
          achievement_id: achievement.id,
          points_earned: achievement.points_reward
        }));

        const { error } = await supabase
          .from('user_achievements')
          .insert(insertData);

        if (error) throw error;

        // Atualizar pontos do usuário
        const totalNewPoints = newAchievements.reduce((sum, a) => sum + a.points_reward, 0);
        await supabase
          .from('profiles')
          .update({ 
            total_points: (profile.total_points || 0) + totalNewPoints 
          })
          .eq('id', user.id);

        // Recarregar conquistas
        await fetchAchievements();

        return newAchievements;
      }

      return [];
    } catch (err) {
      console.error('Erro ao verificar conquistas:', err);
      return [];
    }
  };

  // Obter estatísticas das conquistas
  const getAchievementStats = () => {
    const totalAchievements = achievements.length;
    const earnedAchievements = achievements.filter(a => a.is_earned).length;
    const totalPointsEarned = achievements
      .filter(a => a.is_earned)
      .reduce((sum, a) => sum + a.points_reward, 0);
    const totalPointsAvailable = achievements
      .reduce((sum, a) => sum + a.points_reward, 0);

    const categoryStats = achievements.reduce((stats, achievement) => {
      const category = achievement.category;
      if (!stats[category]) {
        stats[category] = { total: 0, earned: 0, points: 0 };
      }
      stats[category].total += 1;
      if (achievement.is_earned) {
        stats[category].earned += 1;
        stats[category].points += achievement.points_reward;
      }
      return stats;
    }, {});

    return {
      total: totalAchievements,
      earned: earnedAchievements,
      remaining: totalAchievements - earnedAchievements,
      completionPercentage: totalAchievements > 0 
        ? Math.round((earnedAchievements / totalAchievements) * 100) 
        : 0,
      totalPointsEarned,
      totalPointsAvailable,
      categoryStats
    };
  };

  // Filtrar conquistas por categoria
  const filterByCategory = (category) => {
    if (!category) return achievements;
    return achievements.filter(a => a.category === category);
  };

  // Obter conquistas recentes (últimas 5)
  const getRecentAchievements = () => {
    return achievements
      .filter(a => a.is_earned)
      .sort((a, b) => new Date(b.earned_at) - new Date(a.earned_at))
      .slice(0, 5);
  };

  useEffect(() => {
    fetchAchievements();
  }, [user]);

  return {
    achievements,
    userAchievements,
    loading,
    error,
    fetchAchievements,
    checkAndGrantAchievements,
    getAchievementStats,
    filterByCategory,
    getRecentAchievements,
    refetch: fetchAchievements
  };
};