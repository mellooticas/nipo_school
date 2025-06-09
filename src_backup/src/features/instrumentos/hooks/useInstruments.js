import { useState, useEffect } from 'react';
import { instrumentsService } from '../../services/instrumentsService';

/**
 * Hook para gerenciar instrumentos
 */
export const useInstruments = (filtros = {}) => {
  const [instrumentos, setInstrumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Buscar instrumentos
  const fetchInstrumentos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await instrumentsService.getInstrumentos();
      
      if (response.success) {
        let dados = response.data;
        
        // Aplicar filtros se fornecidos
        if (filtros.categoria) {
          dados = dados.filter(inst => inst.categoria === filtros.categoria);
        }
        
        setInstrumentos(dados);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Erro no useInstruments:', err);
      setError('Erro ao carregar instrumentos');
    } finally {
      setLoading(false);
    }
  };

  // Buscar instrumentos por categoria
  const getInstrumentosByCategory = async (categoria) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await instrumentsService.getInstrumentosByCategory(categoria);
      
      if (response.success) {
        setInstrumentos(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Erro ao buscar por categoria:', err);
      setError('Erro ao carregar instrumentos da categoria');
    } finally {
      setLoading(false);
    }
  };

  // Buscar estatísticas por instrumento
  const [estatisticas, setEstatisticas] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchEstatisticas = async () => {
    try {
      setLoadingStats(true);
      
      const response = await instrumentsService.getEstatisticasByInstrumento();
      
      if (response.success) {
        setEstatisticas(response.data);
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Buscar professores por instrumento
  const getProfessoresByInstrumento = async (instrumentoId) => {
    try {
      const response = await instrumentsService.getProfessoresByInstrumento(instrumentoId);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('Erro ao buscar professores:', err);
      throw err;
    }
  };

  // Buscar alunos por instrumento
  const getAlunosByInstrumento = async (instrumentoId) => {
    try {
      const response = await instrumentsService.getAlunosByInstrumento(instrumentoId);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('Erro ao buscar alunos:', err);
      throw err;
    }
  };

  // Adicionar instrumento a professor
  const addInstrumentoToProfessor = async (professorId, instrumentoId, dados = {}) => {
    try {
      const response = await instrumentsService.addInstrumentoToProfessor(
        professorId, 
        instrumentoId, 
        dados
      );
      
      if (response.success) {
        // Atualizar lista se necessário
        await fetchInstrumentos();
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('Erro ao adicionar instrumento ao professor:', err);
      throw err;
    }
  };

  // Remover instrumento de professor
  const removeInstrumentoFromProfessor = async (professorId, instrumentoId) => {
    try {
      const response = await instrumentsService.removeInstrumentoFromProfessor(
        professorId, 
        instrumentoId
      );
      
      if (response.success) {
        // Atualizar lista se necessário
        await fetchInstrumentos();
        return true;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('Erro ao remover instrumento do professor:', err);
      throw err;
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchInstrumentos();
  }, []);

  // Funções utilitárias
  const getInstrumentoById = (id) => {
    return instrumentos.find(inst => inst.id === id);
  };

  const getInstrumentosByCategoria = () => {
    const grouped = {};
    instrumentos.forEach(inst => {
      const categoria = inst.categoria || 'outros';
      if (!grouped[categoria]) {
        grouped[categoria] = [];
      }
      grouped[categoria].push(inst);
    });
    return grouped;
  };

  const getCategorias = () => {
    const categorias = [...new Set(instrumentos.map(inst => inst.categoria || 'outros'))];
    return categorias.sort();
  };

  // Dados computados
  const instrumentosAtivos = instrumentos.filter(inst => inst.ativo);
  const totalInstrumentos = instrumentos.length;

  return {
    // Estados
    instrumentos: instrumentosAtivos,
    loading,
    error,
    estatisticas,
    loadingStats,
    
    // Funções de busca
    fetchInstrumentos,
    getInstrumentosByCategory,
    fetchEstatisticas,
    getProfessoresByInstrumento,
    getAlunosByInstrumento,
    
    // Funções de modificação
    addInstrumentoToProfessor,
    removeInstrumentoFromProfessor,
    
    // Funções utilitárias
    getInstrumentoById,
    getInstrumentosByCategoria,
    getCategorias,
    
    // Dados computados
    totalInstrumentos,
    
    // Refresh
    refresh: fetchInstrumentos
  };
};

/**
 * Hook simplificado para buscar apenas lista de instrumentos
 */
export const useInstrumentosList = (categoria = null) => {
  const { instrumentos, loading, error } = useInstruments({ categoria });
  
  return {
    instrumentos,
    loading,
    error
  };
};

/**
 * Hook para buscar instrumentos com estatísticas
 */
export const useInstrumentosComStats = () => {
  const { 
    instrumentos, 
    loading, 
    estatisticas, 
    loadingStats, 
    fetchEstatisticas,
    error 
  } = useInstruments();

  // Combinar instrumentos com estatísticas
  const instrumentosComStats = instrumentos.map(instrumento => {
    const stats = estatisticas.find(stat => stat.instrumento_id === instrumento.id);
    return {
      ...instrumento,
      estatisticas: stats || {
        total_alunos: 0,
        total_professores: 0,
        novos_alunos_30dias: 0,
        distribuicao_nivel: {},
        media_experiencia_professores: 0
      }
    };
  });

  // Auto-fetch das estatísticas quando instrumentos carregarem
  useEffect(() => {
    if (instrumentos.length > 0 && estatisticas.length === 0) {
      fetchEstatisticas();
    }
  }, [instrumentos.length]);

  return {
    instrumentos: instrumentosComStats,
    loading: loading || loadingStats,
    error
  };
};
// Adicionar estas funções ao hook existente:

export const useInstrumentsPhysical = (instrumentoId = null) => {
  const [instrumentosFisicos, setInstrumentosFisicos] = useState([]);
  const [cessoes, setCessoes] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [estatisticasPatrimonio, setEstatisticasPatrimonio] = useState({});
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const carregarDadosCompletos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        fisicosResult,
        cessoesResult,
        manutencoesResult,
        statsResult,
        alertasResult
      ] = await Promise.all([
        instrumentsService.getInstrumentosFisicos(instrumentoId),
        instrumentsService.getCessoesAtivas(instrumentoId),
        instrumentsService.getManutencoes(),
        instrumentsService.getEstatisticasPatrimonio(instrumentoId),
        instrumentsService.getAlertasVencimento(7)
      ]);

      if (fisicosResult.success) setInstrumentosFisicos(fisicosResult.data);
      if (cessoesResult.success) setCessoes(cessoesResult.data);
      if (manutencoesResult.success) setManutencoes(manutencoesResult.data);
      if (statsResult.success) setEstatisticasPatrimonio(statsResult.data);
      if (alertasResult.success) setAlertas(alertasResult.data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [instrumentoId]);

  useEffect(() => {
    carregarDadosCompletos();
  }, [carregarDadosCompletos]);

  return {
    instrumentosFisicos,
    cessoes,
    manutencoes,
    estatisticasPatrimonio,
    alertas,
    loading,
    error,
    recarregar: carregarDadosCompletos
  };
};