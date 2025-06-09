import { useState, useEffect, useCallback } from 'react';
import { turmasService } from '../../services/turmasService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook principal para gerenciar turmas
 */
export const useTurmas = (filtros = {}) => {
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTurmas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await turmasService.getTurmas(filtros);

      if (response.success) {
        setTurmas(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Erro no useTurmas:', err);
      setError('Erro ao carregar turmas');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filtros)]);

  // Criar nova turma
  const criarTurma = async (dadosTurma) => {
    try {
      const response = await turmasService.createTurma(dadosTurma);

      if (response.success) {
        await fetchTurmas(); // Recarregar lista
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('Erro ao criar turma:', err);
      throw err;
    }
  };

  // Atualizar turma
  const atualizarTurma = async (turmaId, dadosAtualizacao) => {
    try {
      const response = await turmasService.updateTurma(turmaId, dadosAtualizacao);

      if (response.success) {
        await fetchTurmas(); // Recarregar lista
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('Erro ao atualizar turma:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchTurmas();
  }, [fetchTurmas]);

  // Filtrar turmas por status
  const turmasAtivas = turmas.filter(t => t.status === 'ativa');
  const turmasPlanejadas = turmas.filter(t => t.status === 'planejada');
  const turmasFinalizadas = turmas.filter(t => t.status === 'finalizada');

  return {
    // Estados
    turmas,
    loading,
    error,
    
    // Funções
    criarTurma,
    atualizarTurma,
    refresh: fetchTurmas,
    
    // Dados filtrados
    turmasAtivas,
    turmasPlanejadas,
    turmasFinalizadas
  };
};

/**
 * Hook para uma turma específica
 */
export const useTurma = (turmaId) => {
  const [turma, setTurma] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTurma = useCallback(async () => {
    if (!turmaId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await turmasService.getTurmaById(turmaId);

      if (response.success) {
        setTurma(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Erro ao buscar turma:', err);
      setError('Erro ao carregar turma');
    } finally {
      setLoading(false);
    }
  }, [turmaId]);

  useEffect(() => {
    fetchTurma();
  }, [fetchTurma]);

  return {
    turma,
    loading,
    error,
    refresh: fetchTurma
  };
};

/**
 * Hook para matrículas
 */
export const useMatriculas = (turmaId = null) => {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Matricular aluno
  const matricularAluno = async (turmaIdParam, alunoId, dadosMatricula = {}) => {
    const turmaParaMatricula = turmaIdParam || turmaId;
    
    if (!turmaParaMatricula) {
      throw new Error('ID da turma é obrigatório');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await turmasService.matricularAluno(
        turmaParaMatricula,
        alunoId,
        dadosMatricula
      );

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('Erro ao matricular aluno:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancelar matrícula
  const cancelarMatricula = async (matriculaId, motivo = '') => {
    try {
      setLoading(true);
      setError(null);

      const response = await turmasService.cancelarMatricula(matriculaId, motivo);

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('Erro ao cancelar matrícula:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-matrícula (aluno se matricula)
  const autoMatricula = async (turmaIdParam, dadosMatricula = {}) => {
    if (userProfile?.tipo_usuario !== 'aluno') {
      throw new Error('Apenas alunos podem se matricular');
    }

    return matricularAluno(turmaIdParam, user.id, dadosMatricula);
  };

  return {
    loading,
    error,
    matricularAluno,
    cancelarMatricula,
    autoMatricula
  };
};

/**
 * Hook para estatísticas de turmas
 */
export const useTurmasStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await turmasService.getEstatisticasTurmas();

      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas de turmas:', err);
      setError('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  };
};

/**
 * Hook para turmas de um professor específico
 */
export const useTurmasProfessor = (professorId) => {
  const filtros = professorId ? { professor_id: professorId } : {};
  const { turmas, loading, error, refresh } = useTurmas(filtros);

  return {
    turmas,
    loading,
    error,
    refresh
  };
};

/**
 * Hook para turmas de um instrumento específico
 */
export const useTurmasInstrumento = (instrumentoId) => {
  const filtros = instrumentoId ? { instrumento_id: instrumentoId } : {};
  const { turmas, loading, error, refresh } = useTurmas(filtros);

  return {
    turmas,
    loading,
    error,
    refresh
  };
};

/**
 * Hook simplificado para listar turmas disponíveis
 */
export const useTurmasDisponiveis = () => {
  const { turmas, loading, error } = useTurmas({ status: 'ativa' });
  
  // Filtrar apenas turmas com vagas
  const turmasComVagas = turmas.filter(turma => turma.vagas_disponiveis > 0);

  return {
    turmas: turmasComVagas,
    loading,
    error
  };
};