import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { professoresService } from '../services/professoresService';
import ConteudoCard from '../components/ConteudoCard';
import FormConteudo from '../components/FormConteudo';
import {
  Search,
  Filter,
  Grid,
  List,
  Rows,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Download,
  Star,
  Clock,
  Users,
  Video
} from 'lucide-react';

const ProfessoresConteudos = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  // Estados principais
  const [conteudos, setConteudos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  
  // Estados para edição
  const [editandoConteudo, setEditandoConteudo] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  // Estados de filtros e busca
  const [filtros, setFiltros] = useState({
    busca: searchParams.get('search') || '',
    tipo: searchParams.get('tipo') || '',
    categoria: searchParams.get('categoria') || '',
    nivel: searchParams.get('nivel') || '',
    autor: searchParams.get('autor') || '',
    visivel: searchParams.get('visivel') || '',
    ordenacao: searchParams.get('ordenacao') || 'recente'
  });
  
  // Estados de paginação e visualização
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [visualizacao, setVisualizacao] = useState('grid');
  const [conteudosPorPagina] = useState(12);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Evita problemas de hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    if (mounted) {
      carregarDados();
    }
  }, [mounted]);

  // Sincronizar filtros com URL
  useEffect(() => {
    if (mounted) {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      setSearchParams(params);
    }
  }, [filtros, mounted, setSearchParams]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const promises = [
        professoresService.getConteudos()
      ];

      // Verificar se a função getCategorias existe
      if (typeof professoresService.getCategorias === 'function') {
        promises.push(professoresService.getCategorias());
      } else {
        console.warn('⚠️ getCategorias não encontrada, usando categorias vazias');
        promises.push(Promise.resolve({ success: true, data: [] }));
      }

      const [conteudosResponse, categoriasResponse] = await Promise.all(promises);

      if (conteudosResponse.success) {
        setConteudos(conteudosResponse.data || []);
      } else {
        throw new Error(conteudosResponse.error || 'Erro ao carregar conteúdos');
      }

      if (categoriasResponse.success) {
        setCategorias(categoriasResponse.data || []);
      }

    } catch (err) {
      setError('Erro ao carregar conteúdos. Tente novamente.');
      console.error('🚫 Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtros e busca computados
  const conteudosFiltrados = useMemo(() => {
    let resultado = [...conteudos];

    // Filtro de busca
    if (filtros.busca) {
      const termo = filtros.busca.toLowerCase();
      resultado = resultado.filter(conteudo =>
        (conteudo.titulo || '').toLowerCase().includes(termo) ||
        (conteudo.descricao || '').toLowerCase().includes(termo) ||
        (conteudo.conteudo || '').toLowerCase().includes(termo) ||
        (Array.isArray(conteudo.tags) && conteudo.tags.some(tag => 
          (tag || '').toLowerCase().includes(termo)
        ))
      );
    }

    // Filtro por tipo
    if (filtros.tipo) {
      resultado = resultado.filter(conteudo => conteudo.tipo === filtros.tipo);
    }

    // Filtro por categoria
    if (filtros.categoria) {
      resultado = resultado.filter(conteudo => 
        conteudo.categoria_id === filtros.categoria || 
        conteudo.categoria === filtros.categoria
      );
    }

    // Filtro por nível
    if (filtros.nivel) {
      resultado = resultado.filter(conteudo => 
        conteudo.nivel === filtros.nivel || 
        conteudo.nivel_dificuldade === filtros.nivel
      );
    }

    // Filtro por visibilidade
    if (filtros.visivel !== '') {
      const visivel = filtros.visivel === 'true';
      resultado = resultado.filter(conteudo => conteudo.visivel === visivel);
    }

    // Filtro por autor (apenas para admins/pastores)
    if (filtros.autor && ['admin', 'pastor'].includes(user?.nivel_acesso)) {
      resultado = resultado.filter(conteudo => conteudo.criado_por === filtros.autor);
    }

    // Ordenação
    switch (filtros.ordenacao) {
      case 'recente':
        resultado.sort((a, b) => new Date(b.criado_em || 0) - new Date(a.criado_em || 0));
        break;
      case 'antigo':
        resultado.sort((a, b) => new Date(a.criado_em || 0) - new Date(b.criado_em || 0));
        break;
      case 'titulo':
        resultado.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''));
        break;
      case 'visualizacoes':
        resultado.sort((a, b) => (b.visualizacoes || 0) - (a.visualizacoes || 0));
        break;
      case 'destaque':
        resultado.sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));
        break;
      default:
        break;
    }

    return resultado;
  }, [conteudos, filtros, user]);

  // Paginação
  const totalPaginas = Math.ceil(conteudosFiltrados.length / conteudosPorPagina);
  const indiceInicio = (paginaAtual - 1) * conteudosPorPagina;
  const conteudosPaginados = conteudosFiltrados.slice(indiceInicio, indiceInicio + conteudosPorPagina);

  // Handlers
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPaginaAtual(1);
  };

  const handleEditarConteudo = (conteudo) => {
    setEditandoConteudo(conteudo);
    setMostrarFormulario(true);
  };

  const handleDeletarConteudo = (conteudoId) => {
    setConteudos(prev => prev.filter(c => c.id !== conteudoId));
  };

  const handleVisualizarCompleto = (conteudo) => {
    navigate(`/professores/conteudos/${conteudo.id}`);
  };

  const handleSalvarConteudo = (novoConteudo) => {
    if (editandoConteudo) {
      setConteudos(prev => prev.map(c => 
        c.id === editandoConteudo.id ? { ...c, ...novoConteudo } : c
      ));
    } else {
      setConteudos(prev => [novoConteudo, ...prev]);
    }
    
    setMostrarFormulario(false);
    setEditandoConteudo(null);
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      tipo: '',
      categoria: '',
      nivel: '',
      autor: '',
      visivel: '',
      ordenacao: 'recente'
    });
    setPaginaAtual(1);
    setSearchParams({});
  };

  // Tipos de conteúdo com emojis
  const tiposConteudo = [
    { 
      value: 'sacada', 
      label: 'Sacadas', 
      emoji: '💡',
      count: conteudos.filter(c => c.tipo === 'sacada').length,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    { 
      value: 'video', 
      label: 'Vídeos', 
      emoji: '🎥',
      count: conteudos.filter(c => c.tipo === 'video').length,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    { 
      value: 'devocional', 
      label: 'Devocionais', 
      emoji: '📖',
      count: conteudos.filter(c => c.tipo === 'devocional').length,
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    { 
      value: 'material', 
      label: 'Materiais', 
      emoji: '📄',
      count: conteudos.filter(c => c.tipo === 'material').length,
      color: 'bg-red-100 text-red-800 border-red-200'
    }
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse shadow-lg">
            <span className="text-white text-2xl">📚</span>
          </div>
          <p className="text-base text-gray-700">Carregando Biblioteca...</p>
        </div>
      </div>
    );
  }

  if (mostrarFormulario) {
    return (
      <FormConteudo
        conteudoParaEditar={editandoConteudo}
        onSalvar={handleSalvarConteudo}
        onCancelar={() => {
          setMostrarFormulario(false);
          setEditandoConteudo(null);
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        
        {/* Header com Search e Controles */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-light text-gray-800 mb-2 flex items-center">
                <span className="text-3xl mr-3">📚</span>
                Biblioteca de Conteúdos
              </h1>
              <p className="text-base text-gray-700">
                {loading ? 'Carregando...' : `${conteudosFiltrados.length} conteúdo${conteudosFiltrados.length !== 1 ? 's' : ''} encontrado${conteudosFiltrados.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Controles de Visualização */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setVisualizacao('grid')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    visualizacao === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setVisualizacao('list')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    visualizacao === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Lista</span>
                </button>
                <button
                  onClick={() => setVisualizacao('compact')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    visualizacao === 'compact'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Rows className="w-4 h-4" />
                  <span className="hidden sm:inline">Compacto</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setEditandoConteudo(null);
                  setMostrarFormulario(true);
                }}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Conteúdo</span>
              </button>
            </div>
          </div>

          {/* Search e Filtros */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={filtros.busca}
                onChange={(e) => handleFiltroChange('busca', e.target.value)}
                placeholder="Buscar por título, descrição, conteúdo ou tags..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* Filtros Toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
                {mostrarFiltros && <X className="w-4 h-4" />}
              </button>
              
              {(Object.values(filtros).some(v => v && v !== 'recente')) && (
                <button
                  onClick={limparFiltros}
                  className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>

            {/* Panel de Filtros */}
            {mostrarFiltros && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Tipo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo
                    </label>
                    <select
                      value={filtros.tipo}
                      onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-sm"
                    >
                      <option value="">Todos os tipos</option>
                      {tiposConteudo.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.emoji} {tipo.label} ({tipo.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      value={filtros.categoria}
                      onChange={(e) => handleFiltroChange('categoria', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-sm"
                    >
                      <option value="">Todas as categorias</option>
                      {categorias.map(categoria => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.icone} {categoria.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nível */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nível
                    </label>
                    <select
                      value={filtros.nivel}
                      onChange={(e) => handleFiltroChange('nivel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-sm"
                    >
                      <option value="">Todos os níveis</option>
                      <option value="iniciante">Iniciante</option>
                      <option value="intermediario">Intermediário</option>
                      <option value="avancado">Avançado</option>
                      <option value="todos">Todos os Níveis</option>
                    </select>
                  </div>

                  {/* Ordenação */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ordenar por
                    </label>
                    <select
                      value={filtros.ordenacao}
                      onChange={(e) => handleFiltroChange('ordenacao', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-sm"
                    >
                      <option value="recente">Mais recente</option>
                      <option value="antigo">Mais antigo</option>
                      <option value="titulo">Título (A-Z)</option>
                      <option value="visualizacoes">Mais visualizado</option>
                      <option value="destaque">Em destaque</option>
                    </select>
                  </div>
                </div>

                {/* Filtros para Admin/Pastor */}
                {['admin', 'pastor'].includes(user?.nivel_acesso) && (
                  <div className="pt-4 border-t border-gray-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Visibilidade
                        </label>
                        <select
                          value={filtros.visivel}
                          onChange={(e) => handleFiltroChange('visivel', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-sm"
                        >
                          <option value="">Todos</option>
                          <option value="true">✅ Visíveis</option>
                          <option value="false">👁️ Ocultos</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {tiposConteudo.map(tipo => (
            <button
              key={tipo.value}
              onClick={() => handleFiltroChange('tipo', filtros.tipo === tipo.value ? '' : tipo.value)}
              className={`bg-white/90 backdrop-blur-sm rounded-xl p-4 border text-center hover:shadow-md transition-all duration-200 ${
                filtros.tipo === tipo.value 
                  ? tipo.color + ' shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{tipo.emoji}</div>
              <p className="text-lg font-bold text-gray-900">{tipo.count}</p>
              <p className="text-xs text-gray-600">{tipo.label}</p>
            </button>
          ))}
        </div>

        {/* Conteúdo Principal */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-4" />
              <p className="text-base text-gray-700">Carregando conteúdos...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-red-100 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
            <button
              onClick={carregarDados}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg"
            >
              Tentar Novamente
            </button>
          </div>
        ) : conteudosPaginados.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-red-100 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum conteúdo encontrado
            </h3>
            <p className="text-base text-gray-700 mb-6">
              {conteudosFiltrados.length === 0 && conteudos.length > 0
                ? 'Tente ajustar os filtros para encontrar conteúdos.'
                : 'Que tal criar o primeiro conteúdo?'
              }
            </p>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Criar Primeiro Conteúdo
            </button>
          </div>
        ) : (
          <>
            {/* Grid de Conteúdos */}
            <div className={`
              ${visualizacao === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : ''}
              ${visualizacao === 'list' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}
              ${visualizacao === 'compact' ? 'space-y-4' : ''}
            `}>
              {conteudosPaginados.map(conteudo => (
                <ConteudoCard
                  key={conteudo.id}
                  conteudo={conteudo}
                  variant={visualizacao === 'compact' ? 'compact' : 'default'}
                  onEditar={handleEditarConteudo}
                  onDeletar={handleDeletarConteudo}
                  onVisualizarCompleto={handleVisualizarCompleto}
                />
              ))}
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Mostrando {indiceInicio + 1} a {Math.min(indiceInicio + conteudosPorPagina, conteudosFiltrados.length)} de {conteudosFiltrados.length} resultados
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                      disabled={paginaAtual === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Anterior</span>
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                        let pagina;
                        if (totalPaginas <= 5) {
                          pagina = i + 1;
                        } else if (paginaAtual <= 3) {
                          pagina = i + 1;
                        } else if (paginaAtual >= totalPaginas - 2) {
                          pagina = totalPaginas - 4 + i;
                        } else {
                          pagina = paginaAtual - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pagina}
                            onClick={() => setPaginaAtual(pagina)}
                            className={`px-3 py-2 border rounded-lg text-sm transition-colors ${
                              pagina === paginaAtual
                                ? 'bg-red-600 text-white border-red-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pagina}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                      disabled={paginaAtual === totalPaginas}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <span className="hidden sm:inline">Próxima</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Stats Footer */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Estatísticas da Biblioteca
              </h3>
              <p className="text-sm text-gray-600">
                Explore o conhecimento compartilhado pelos professores da Nipo School
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/60 rounded-lg p-3">
                <div className="text-lg font-bold text-blue-600">{conteudos.length}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <div className="text-lg font-bold text-green-600">
                  {conteudos.reduce((sum, c) => sum + (c.visualizacoes || 0), 0)}
                </div>
                <div className="text-xs text-gray-600">Views</div>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <div className="text-lg font-bold text-purple-600">
                  {conteudos.reduce((sum, c) => sum + (c.downloads || 0), 0)}
                </div>
                <div className="text-xs text-gray-600">Downloads</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setMostrarFormulario(true)}
              className="flex items-center justify-center gap-2 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Criar Conteúdo</div>
                <div className="text-xs text-gray-600">Nova sacada ou material</div>
              </div>
            </button>

            <button
              onClick={() => handleFiltroChange('tipo', 'video')}
              className="flex items-center justify-center gap-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Ver Vídeos</div>
                <div className="text-xs text-gray-600">Conteúdo audiovisual</div>
              </div>
            </button>

            <button
              onClick={() => handleFiltroChange('ordenacao', 'visualizacoes')}
              className="flex items-center justify-center gap-2 p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Mais Vistos</div>
                <div className="text-xs text-gray-600">Conteúdo popular</div>
              </div>
            </button>

            <button
              onClick={carregarDados}
              className="flex items-center justify-center gap-2 p-4 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Atualizar</div>
                <div className="text-xs text-gray-600">Recarregar dados</div>
              </div>
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white text-xl">💡</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Dicas para Encontrar Conteúdo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold mb-2 text-gray-800">🔍 Busca Eficiente:</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">•</span>
                      <span>Use palavras-chave específicas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">•</span>
                      <span>Combine filtros para resultados precisos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">•</span>
                      <span>Busque por tags relacionadas</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-gray-800">📚 Navegação Rápida:</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>Clique nos cards de tipo para filtrar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>Use a ordenação por popularidade</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>Salve links com filtros aplicados</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessoresConteudos;