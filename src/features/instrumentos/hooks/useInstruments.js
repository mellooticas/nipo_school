import { useState, useEffect } from 'react';
import { instrumentsService } from '../services/instrumentsService';

/**
 * Hook para gerenciar instrumentos
 */
export const useInstruments = (filtros = {}) => {
  const [instrumentos, setInstrumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Buscar instrumentos - CORRIGIDO: usar getAllInstruments
  const fetchInstrumentos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ CORREÇÃO: Usar o método correto do service
      const response = await instrumentsService.getAllInstruments();
      
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

  // Buscar instrumentos por categoria - CORRIGIDO
  const getInstrumentosByCategory = async (categoria) => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ CORREÇÃO: Usar o método correto do service
      const response = await instrumentsService.getInstrumentsByCategory(categoria);
      
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

  // Buscar estatísticas por instrumento - CORRIGIDO
  const [estatisticas, setEstatisticas] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchEstatisticas = async () => {
    try {
      setLoadingStats(true);
      
      // ✅ CORREÇÃO: Buscar stats de todos os instrumentos
      const instrumentsResponse = await instrumentsService.getAllInstruments();
      
      if (instrumentsResponse.success) {
        // Extrair estatísticas que já vêm junto com os instrumentos
        const statsData = instrumentsResponse.data.map(inst => ({
          instrumento_id: inst.id,
          ...inst.stats
        }));
        setEstatisticas(statsData);
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Buscar professores por instrumento - CORRIGIDO
  const getProfessoresByInstrumento = async (instrumentoId) => {
    try {
      // ✅ CORREÇÃO: Usar o método correto do service
      const response = await instrumentsService.getInstrumentProfessores(instrumentoId);
      
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

  // Buscar alunos por instrumento - CORRIGIDO
  const getAlunosByInstrumento = async (instrumentoId) => {
    try {
      // ✅ CORREÇÃO: Usar o método correto do service
      const response = await instrumentsService.getInstrumentAlunos(instrumentoId);
      
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

  // Adicionar instrumento a professor - MANTIDO (não existe no service atual)
  const addInstrumentoToProfessor = async (professorId, instrumentoId, dados = {}) => {
    try {
      // TODO: Implementar no service se necessário
      console.warn('addInstrumentoToProfessor não implementado no service');
      throw new Error('Funcionalidade não implementada');
    } catch (err) {
      console.error('Erro ao adicionar instrumento ao professor:', err);
      throw err;
    }
  };

  // Remover instrumento de professor - MANTIDO (não existe no service atual)
  const removeInstrumentoFromProfessor = async (professorId, instrumentoId) => {
    try {
      // TODO: Implementar no service se necessário
      console.warn('removeInstrumentoFromProfessor não implementado no service');
      throw new Error('Funcionalidade não implementada');
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
  const instrumentosAtivos = instrumentos.filter(inst => inst.ativo !== false);
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
    
    // Funções de modificação (limitadas)
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

// Hook para patrimônio físico - CORRIGIDO para usar métodos do service
export const useInstrumentsPhysical = (instrumentoId = null) => {
  const [instrumentosFisicos, setInstrumentosFisicos] = useState([]);
  const [cessoes, setCessoes] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [estatisticasPatrimonio, setEstatisticasPatrimonio] = useState({});
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const carregarDadosCompletos = async () => {
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
  };

  useEffect(() => {
    carregarDadosCompletos();
  }, [instrumentoId]);

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