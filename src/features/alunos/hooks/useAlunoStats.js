import { useState, useEffect } from 'react';
import { supabase } from '../../shared/lib/supabase/supabaseClient';
import { useAuth } from '../../shared/contexts/AuthContext';

export const useAlunoStats = () => {
  const { user, userProfile } = useAuth();
  const [stats, setStats] = useState({
    pontos: {
      total: 0,
      semana: 0,
      mes: 0,
      ranking: 0
    },
    sequencia: {
      atual: 0,
      melhor: 0,
      diasConsecutivos: []
    },
    aulas: {
      concluidas: 0,
      tempoTotal: 0,
      mediaAvaliacao: 0
    },
    conquistas: {
      total: 0,
      novas: 0,
      categorias: {}
    },
    progresso: {
      modulosAtivos: 0,
      modulosConcluidos: 0,
      proximaMeta: null
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPontosStats = async () => {
    try {
      const totalPontos = userProfile?.total_points || 0;

      const semanaAtras = new Date();
      semanaAtras.setDate(semanaAtras.getDate() - 7);

      const { data: pontosSemanais, error: pontosError } = await supabase
        .from('user_progress')
        .select('points_earned, created_at')
        .eq('user_id', user.id)
        .gte('created_at', semanaAtras.toISOString());

      if (pontosError) throw pontosError;

      const pontosSemana = pontosSemanais?.reduce((sum, p) => sum + (p.points_earned || 0), 0) || 0;

      const mesAtras = new Date();
      mesAtras.setDate(mesAtras.getDate() - 30);

      const { data: pontosMensais, error: mesError } = await supabase
        .from('user_progress')
        .select('points_earned')
        .eq('user_id', user.id)
        .gte('created_at', mesAtras.toISOString());

      if (mesError) throw mesError;

      const pontosMes = pontosMensais?.reduce((sum, p) => sum + (p.points_earned || 0), 0) || 0;

      const { data: ranking, error: rankingError } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('tipo_usuario', 'aluno')
        .gt('total_points', totalPontos);

      if (rankingError) throw rankingError;

      const posicaoRanking = (ranking?.length || 0) + 1;

      return {
        total: totalPontos,
        semana: pontosSemana,
        mes: pontosMes,
        ranking: posicaoRanking
      };

    } catch (error) {
      console.error('Erro ao buscar pontos:', error);
      return { total: 0, semana: 0, mes: 0, ranking: 0 };
    }
  };

  const fetchAlunoStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const pontosResult = await fetchPontosStats();

      setStats(prevStats => ({
        ...prevStats,
        pontos: pontosResult
      }));

    } catch (err) {
      console.error('Erro ao buscar estatísticas do aluno:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRankingSemanal = async () => {
    try {
      const semanaAtras = new Date();
      semanaAtras.setDate(semanaAtras.getDate() - 7);

      const { data: ranking, error } = await supabase
        .from('user_progress')
        .select(`
          user_id,
          profiles!inner(full_name, avatar_url),
          points_earned
        `)
        .gte('created_at', semanaAtras.toISOString())
        .order('points_earned', { ascending: false })
        .limit(10);

      if (error) throw error;

      const pontosPorUsuario = {};
      ranking?.forEach(item => {
        const userId = item.user_id;
        if (!pontosPorUsuario[userId]) {
          pontosPorUsuario[userId] = {
            nome: item.profiles.full_name,
            avatar: item.profiles.avatar_url,
            pontos: 0
          };
        }
        pontosPorUsuario[userId].pontos += item.points_earned || 0;
      });

      const rankingFinal = Object.entries(pontosPorUsuario)
        .map(([userId, dados]) => ({
          userId,
          ...dados
        }))
        .sort((a, b) => b.pontos - a.pontos)
        .slice(0, 10);

      return rankingFinal;

    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAlunoStats();
    }
  }, [user?.id]);

  return {
    stats,
    loading,
    error,
    refetch: fetchAlunoStats,
    getRankingSemanal
  };
};