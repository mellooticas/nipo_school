import { useState, useEffect, useCallback } from 'react';
import { instrumentPageService } from '../../services/instrumentPageService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook principal para página do instrumento
 */
export const useInstrumentPage = (instrumentoId) => {
  const { user, userProfile } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Buscar dashboard do instrumento
  const fetchDashboard = useCallback(async () => {
    if (!instrumentoId) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar ID do aluno se for aluno
      let alunoId = null;
      if (userProfile?.tipo_usuario === 'aluno') {
        alunoId = user?.id;
      }

      const response = await instrumentPageService.getInstrumentDashboard(
        instrumentoId,
        alunoId
      );

      if (response.success) {
        setDashboard(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Erro no useInstrumentPage:', err);
      setError('Erro ao carregar página do instrumento');
    } finally {
      setLoading(false);
    }
  }, [instrumentoId, user?.id, userProfile?.tipo_usuario]);

  // Carregar dashboard quando componente montar
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    loading,
    error,
    refresh: fetchDashboard
  };
};

/**
 * Hook para atividades do instrumento
 */
export const useInstrumentActivities = (instrumentoId, filtros = {}) => {
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAtividades = useCallback(async () => {
    if (!instrumentoId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await instrumentPageService.getInstrumentActivities(
        instrumentoId,
        filtros
      );

      if (response.success) {
        setAtividades(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Erro ao buscar atividades:', err);
      setError('Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  }, [instrumentoId, JSON.stringify(filtros)]);

  // Inscrever em atividade
  const inscreverEmAtividade = async (atividadeId, observacoes = '') => {
    try {
      const { user } = useAuth();
      const response = await instrumentPageService.inscriverEmAtividade(
        atividadeId,
        user.id,
        observacoes
      );

      if (response.success) {
        await fetchAtividades(); // Recarregar lista
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('Erro ao inscrever em atividade:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchAtividades();
  }, [fetchAtividades]);

  return {
    atividades,
    loading,
    error,
    inscreverEmAtividade,
    refresh: fetchAtividades
  };
};

/**
 * Hook para progresso do aluno no instrumento
 */
export const useInstrumentProgress = (instrumentoId) => {
  const { user, userProfile } = useAuth();
  const [progresso, setProgresso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgresso = useCallback(async () => {
    if (!instrumentoId || !user?.id || userProfile?.tipo_usuario !== 'aluno') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await instrumentPageService.getProgressoDetalhado(
        user.id,
        instrumentoId
      );

      if (response.success) {
        setProgresso(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Erro ao buscar progresso:', err);
      setError('Erro ao carregar progresso');
    } finally {
      setLoading(false);
    }
  }, [instrumentoId, user?.id, userProfile?.tipo_usuario]);

  // Registrar tempo de prática
  const registrarTempoPratica = async (minutos, observacoes = '') => {
    try {
      const response = await instrumentPageService.registrarTempoPratica(
        user.id,
        instrumentoId,
        minutos,
        observacoes
      );

      if (response.success) {
        await fetchProgresso(); // Recarregar progresso
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('Erro ao registrar prática:', err);
      throw err;
    }
  };

  // Atualizar meta semanal
  const atualizarMetaSemanal = async (metaMinutos, objetivo = null) => {
    try {
      const response = await instrumentPageService.atualizarMetaSemanal(
        user.id,
        instrumentoId,
        metaMinutos,
        objetivo
      );

      if (response.success) {
        await fetchProgresso(); // Recarregar progresso
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('Erro ao atualizar meta:', err);
      throw err;
    }
  };

  // Registrar conclusão de exercício
  const registrarConclusaoExercicio = async (atividadeId, dados = {}) => {
    try {
      const response = await instrumentPageService.registrarConclusaoExercicio(
        user.id,
        atividadeId,
        { ...dados, instrumento_id: instrumentoId }
      );

      if (response.success) {
        await fetchProgresso(); // Recarregar progresso
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('Erro ao registrar exercício:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProgresso();
  }, [fetchProgresso]);

  return {
    progresso,
    loading,
    error,
    registrarTempoPratica,
    atualizarMetaSemanal,
    registrarConclusaoExercicio,
    refresh: fetchProgresso
  };
};

/**
 * Hook para conteúdos recomendados do instrumento
 */
export const useInstrumentContent = (instrumentoId, limite = 10) => {
  const { user, userProfile } = useAuth();
  const [conteudos, setConteudos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConteudos = useCallback(async () => {
    if (!instrumentoId) return;

    try {
      setLoading(true);
      setError(null);

      // Passar ID do aluno se for aluno
      let alunoId = null;
      if (userProfile?.tipo_usuario === 'aluno') {
        alunoId = user?.id;
      }

      const response = await instrumentPageService.getConteudosRecomendados(
        instrumentoId,
        alunoId,
        limite
      );

      if (response.success) {
        setConteudos(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Erro ao buscar conteúdos:', err);
      setError('Erro ao carregar conteúdos');
    } finally {
      setLoading(false);
    }
  }, [instrumentoId, user?.id, userProfile?.tipo_usuario, limite]);

  useEffect(() => {
    fetchConteudos();
  }, [fetchConteudos]);

  return {
    conteudos,
    loading,
    error,
    refresh: fetchConteudos
  };
};

/**
 * Hook para ranking do instrumento
 */
export const useInstrumentRanking = (instrumentoId, criterio = 'pontos_totais', limite = 10) => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRanking = useCallback(async () => {
    if (!instrumentoId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await instrumentPageService.getRankingAlunos(
        instrumentoId,
        criterio,
        limite
      );

      if (response.success) {
        setRanking(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Erro ao buscar ranking:', err);
      setError('Erro ao carregar ranking');
    } finally {
      setLoading(false);
    }
  }, [instrumentoId, criterio, limite]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  return {
    ranking,
    loading,
    error,
    refresh: fetchRanking
  };
};

/**
 * Hook para próximas atividades do aluno
 */
export const useProximasAtividades = (instrumentoId = null, limite = 5) => {
  const { user, userProfile } = useAuth();
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProximasAtividades = useCallback(async () => {
    if (!user?.id || userProfile?.tipo_usuario !== 'aluno') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await instrumentPageService.getProximasAtividades(
        user.id,
        instrumentoId,
        limite
      );

      if (response.success) {
        setAtividades(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Erro ao buscar próximas atividades:', err);
      setError('Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  }, [user?.id, userProfile?.tipo_usuario, instrumentoId, limite]);

  // Cancelar participação
  const cancelarParticipacao = async (participacaoId, motivo = '') => {
    try {
      const response = await instrumentPageService.cancelarParticipacao(
        participacaoId,
        motivo
      );

      if (response.success) {
        await fetchProximasAtividades(); // Recarregar lista
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('Erro ao cancelar participação:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProximasAtividades();
  }, [fetchProximasAtividades]);

  return {
    atividades,
    loading,
    error,
    cancelarParticipacao,
    refresh: fetchProximasAtividades
  };
};