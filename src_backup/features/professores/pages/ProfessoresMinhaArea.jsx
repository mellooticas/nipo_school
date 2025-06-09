import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';
import { professoresService } from '../../services/professoresService';
import ConteudoCard from '../../components/professores/ConteudoCard';
import FormConteudo from '../../components/professores/FormConteudo';
import {
  Search,
  Grid,
  List,
  Plus,
  RefreshCw,
  Star,
  Eye,
  Download,
  BarChart3,
  Clock,
  Filter,
  X,
  TrendingUp,
  Target,
  Award,
  Zap
} from 'lucide-react';

const ProfessoresMinhaArea = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  // Estados principais
  const [meuConteudos, setMeuConteudos] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    visiveis: 0,
    ocultos: 0,
    visualizacoes: 0,
    downloads: 0,
    por_tipo: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para edição
  const [editandoConteudo, setEditandoConteudo] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  // Estados de filtros locais
  const [filtroLocal, setFiltroLocal] = useState({
    busca: '',
    tipo: '',
    status: '',
    ordenacao: 'recente'
  });
  
  // Estados de visualização
  const [visualizacao, setVisualizacao] = useState('grid');
  const [mostrarEstatisticas, setMostrarEstatisticas] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Evita problemas de hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Carregar dados do professor
  useEffect(() => {
    if (mounted && user?.id) {
      carregarMeuConteudos();
      carregarEstatisticas();
    }
  }, [mounted, user]);

  const carregarMeuConteudos = async () => {
    try {
      setLoading(true);
      const response = await professoresService.getConteudosByAutor(user.id);
      setMeuConteudos(response.data || []);
    } catch (err) {
      setError('Erro ao carregar seus conteúdos.');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const response = await professoresService.getEstatisticasAutor(user.id);
      setEstatisticas(response.data || {
        total: 0,
        visiveis: 0,
        ocultos: 0,
        visualizacoes: 0,
        downloads: 0,
        por_tipo: {}
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  // Filtros computados
  const conteudosFiltrados = useMemo(() => {
    let resultado = [...meuConteudos];

    // Filtro de busca
    if (filtroLocal.busca) {
      const termo = filtroLocal.busca.toLowerCase();
      resultado = resultado.filter(conteudo =>
        conteudo.titulo.toLowerCase().includes(termo) ||
        conteudo.descricao.toLowerCase().includes(termo) ||
        (conteudo.tags && conteudo.tags.some(tag => tag.toLowerCase().includes(termo)))
      );
    }

    // Filtro por tipo
    if (filtroLocal.tipo) {
      resultado = resultado.filter(conteudo => conteudo.tipo === filtroLocal.tipo);
    }

    // Filtro por status
    if (filtroLocal.status === 'visivel') {
      resultado = resultado.filter(conteudo => conteudo.visivel);
    } else if (filtroLocal.status === 'oculto') {
      resultado = resultado.filter(conteudo => !conteudo.visivel);
    } else if (filtroLocal.status === 'destaque') {
      resultado = resultado.filter(conteudo => conteudo.destaque);
    }

    // Ordenação
    switch (filtroLocal.ordenacao) {
      case 'recente':
        resultado.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));
        break;
      case 'antigo':
        resultado.sort((a, b) => new Date(a.criado_em) - new Date(b.criado_em));
        break;
      case 'titulo':
        resultado.sort((a, b) => a.titulo.localeCompare(b.titulo));
        break;
      case 'visualizacoes':
        resultado.sort((a, b) => (b.visualizacoes || 0) - (a.visualizacoes || 0));
        break;
      default:
        break;
    }

    return resultado;
  }, [meuConteudos, filtroLocal]);

  // Handlers
  const handleFiltroChange = (campo, valor) => {
    setFiltroLocal(prev => ({ ...prev, [campo]: valor }));
  };

  const handleEditarConteudo = (conteudo) => {
    setEditandoConteudo(conteudo);
    setMostrarFormulario(true);
  };

  const handleDeletarConteudo = (conteudoId) => {
    setMeuConteudos(prev => prev.filter(c => c.id !== conteudoId));
    carregarEstatisticas();
  };

  const handleVisualizarCompleto = (conteudo) => {
    navigate(`/professores/conteudos/${conteudo.id}`);
  };

  const handleSalvarConteudo = (novoConteudo) => {
    if (editandoConteudo) {
      setMeuConteudos(prev => prev.map(c => 
        c.id === editandoConteudo.id ? { ...c, ...novoConteudo } : c
      )); 
    } else {
      setMeuConteudos(prev => [novoConteudo, ...prev]);
    }
    
    setMostrarFormulario(false);
    setEditandoConteudo(null);
    carregarEstatisticas();
  };

  const limparFiltros = () => {
    setFiltroLocal({
      busca: '',
      tipo: '',
      status: '',
      ordenacao: 'recente'
    });
  };

  // Estatísticas por tipo com emojis
  const tiposEstatisticas = [
    { 
      tipo: 'sacada', 
      label: 'Sacadas', 
      emoji: '💡',
      count: meuConteudos.filter(c => c.tipo === 'sacada').length,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    { 
      tipo: 'video', 
      label: 'Vídeos', 
      emoji: '🎥',
      count: meuConteudos.filter(c => c.tipo === 'video').length,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    { 
      tipo: 'devocional', 
      label: 'Devocionais', 
      emoji: '❤️',
      count: meuConteudos.filter(c => c.tipo === 'devocional').length,
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    { 
      tipo: 'material', 
      label: 'Materiais', 
      emoji: '📄',
      count: meuConteudos.filter(c => c.tipo === 'material').length,
      color: 'bg-red-100 text-red-800 border-red-200'
    }
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
            <span className="text-white text-2xl">👤</span>
          </div>
          <p className="text-gray-600">Carregando Sua Área...</p>
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
    <div className="space-y-6">
      
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              {userProfile?.avatar_url ? (
                <img 
                  src={userProfile.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <span className="text-white text-2xl font-bold">
                  {userProfile?.full_name?.charAt(0) || 'P'}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-light text-gray-800 mb-1 flex items-center">
                <span className="text-3xl mr-3">👤</span>
                Olá, {userProfile?.full_name?.split(' ')[0] || 'Professor'}!
              </h1>
              <p className="text-gray-600">
                Esta é sua área pessoal - gerencie seus conteúdos e acompanhe suas estatísticas
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMostrarEstatisticas(!mostrarEstatisticas)}
              className={`px-4 py-2 rounded-xl transition-colors font-medium flex items-center gap-2 ${
                mostrarEstatisticas 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-white border border-green-300 text-green-600 hover:bg-green-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">
                {mostrarEstatisticas ? 'Ocultar Stats' : 'Mostrar Stats'}
              </span>
            </button>
            
            <button
              onClick={() => setMostrarFormulario(true)}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Conteúdo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas Cards */}
      {mostrarEstatisticas && (
        <div className="space-y-6">
          {/* Stats Principais */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-blue-200 text-center hover:shadow-md transition-all duration-200">
              <BarChart3 className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{estatisticas.total}</p>
              <p className="text-xs text-gray-600">Total Criados</p>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-green-200 text-center hover:shadow-md transition-all duration-200">
              <Eye className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{estatisticas.visualizacoes || 0}</p>
              <p className="text-xs text-gray-600">Visualizações</p>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-purple-200 text-center hover:shadow-md transition-all duration-200">
              <Download className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{estatisticas.downloads || 0}</p>
              <p className="text-xs text-gray-600">Downloads</p>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-yellow-200 text-center hover:shadow-md transition-all duration-200">
              <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{estatisticas.visiveis || 0}</p>
              <p className="text-xs text-gray-600">Publicados</p>
            </div>
          </div>

          {/* Estatísticas por Tipo */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Seus Conteúdos por Tipo
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {tiposEstatisticas.map(item => (
                <button
                  key={item.tipo}
                  onClick={() => handleFiltroChange('tipo', filtroLocal.tipo === item.tipo ? '' : item.tipo)}
                  className={`p-4 rounded-xl border text-center transition-all duration-200 hover:shadow-md ${
                    filtroLocal.tipo === item.tipo 
                      ? item.color + ' shadow-md' 
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{item.emoji}</div>
                  <div className="text-xl font-bold text-gray-900">{item.count}</div>
                  <div className="text-xs text-gray-600">{item.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Progress & Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status dos Conteúdos */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                Status dos Conteúdos
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">✅</span>
                    </div>
                    <span className="font-medium text-gray-900">Publicados</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{estatisticas.visiveis || 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">👁️</span>
                    </div>
                    <span className="font-medium text-gray-900">Rascunhos</span>
                  </div>
                  <span className="text-lg font-bold text-gray-600">{estatisticas.ocultos || 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">⭐</span>
                    </div>
                    <span className="font-medium text-gray-900">Em Destaque</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">
                    {meuConteudos.filter(c => c.destaque).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Performance
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Engajamento Médio</span>
                    <span className="text-sm font-bold text-blue-600">
                      {meuConteudos.length > 0 
                        ? Math.round((estatisticas.visualizacoes || 0) / meuConteudos.length)
                        : 0
                      } views/conteúdo
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(
                          ((estatisticas.visualizacoes || 0) / Math.max(meuConteudos.length * 100, 1)) * 100, 
                          100
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Taxa de Download</span>
                    <span className="text-sm font-bold text-purple-600">
                      {estatisticas.visualizacoes > 0 
                        ? Math.round(((estatisticas.downloads || 0) / estatisticas.visualizacoes) * 100)
                        : 0
                      }%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${estatisticas.visualizacoes > 0 
                          ? Math.min(((estatisticas.downloads || 0) / estatisticas.visualizacoes) * 100, 100)
                          : 0
                        }%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conquistas */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Suas Conquistas
              </h3>
              <div className="space-y-3">
                <div className={`flex items-center gap-3 p-2 rounded-lg ${
                  meuConteudos.length >= 1 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                }`}>
                  <span className="text-lg">{meuConteudos.length >= 1 ? '🏆' : '⭕'}</span>
                  <div>
                    <div className="font-medium text-sm">Primeiro Conteúdo</div>
                    <div className="text-xs text-gray-600">Crie seu primeiro conteúdo</div>
                  </div>
                </div>
                
                <div className={`flex items-center gap-3 p-2 rounded-lg ${
                  meuConteudos.length >= 5 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                }`}>
                  <span className="text-lg">{meuConteudos.length >= 5 ? '🏅' : '⭕'}</span>
                  <div>
                    <div className="font-medium text-sm">Criador Ativo</div>
                    <div className="text-xs text-gray-600">Crie 5 conteúdos ({meuConteudos.length}/5)</div>
                  </div>
                </div>
                
                <div className={`flex items-center gap-3 p-2 rounded-lg ${
                  (estatisticas.visualizacoes || 0) >= 100 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                }`}>
                  <span className="text-lg">{(estatisticas.visualizacoes || 0) >= 100 ? '⭐' : '⭕'}</span>
                  <div>
                    <div className="font-medium text-sm">Influenciador</div>
                    <div className="text-xs text-gray-600">100+ visualizações ({estatisticas.visualizacoes || 0}/100)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controles e Filtros */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">📚</span>
              Meus Conteúdos ({conteudosFiltrados.length})
            </h2>
            <p className="text-gray-600">
              {meuConteudos.length} conteúdo{meuConteudos.length !== 1 ? 's' : ''} criado{meuConteudos.length !== 1 ? 's' : ''} por você
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
            </div>
          </div>
        </div>

        {/* Search e Filtros */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={filtroLocal.busca}
              onChange={(e) => handleFiltroChange('busca', e.target.value)}
              placeholder="Buscar em seus conteúdos..."
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
            
            {(Object.values(filtroLocal).some(v => v && v !== 'recente')) && (
              <button
                onClick={limparFiltros}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
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
                    value={filtroLocal.tipo}
                    onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-sm"
                  >
                    <option value="">Todos os tipos</option>
                    <option value="sacada">💡 Sacadas</option>
                    <option value="video">🎥 Vídeos</option>
                    <option value="devocional">❤️ Devocionais</option>
                    <option value="material">📄 Materiais</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filtroLocal.status}
                    onChange={(e) => handleFiltroChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-sm"
                  >
                    <option value="">Todos os status</option>
                    <option value="visivel">✅ Publicados</option>
                    <option value="oculto">👁️ Rascunhos</option>
                    <option value="destaque">⭐ Em destaque</option>
                  </select>
                </div>

                {/* Ordenação */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={filtroLocal.ordenacao}
                    onChange={(e) => handleFiltroChange('ordenacao', e.target.value)}
                    className="w-full px-3py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-sm"
>
<option value="recente">Mais recente</option>
<option value="antigo">Mais antigo</option>
<option value="titulo">Título (A-Z)</option>
<option value="visualizacoes">Mais visualizado</option>
</select>
</div>
            {/* Quick Actions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ações Rápidas
              </label>
              <button
                onClick={() => setMostrarFormulario(true)}
                className="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
              >
                ✨ Criar Novo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>

  {/* Lista de Conteúdos */}
  {loading ? (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Carregando seus conteúdos...</p>
      </div>
    </div>
  ) : error ? (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-red-100 text-center">
      <div className="text-6xl mb-4">❌</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
      <button
        onClick={carregarMeuConteudos}
        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg"
      >
        Tentar Novamente
      </button>
    </div>
  ) : conteudosFiltrados.length === 0 ? (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-red-100 text-center">
      <div className="text-6xl mb-4">📝</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {meuConteudos.length === 0 
          ? 'Você ainda não criou nenhum conteúdo'
          : 'Nenhum conteúdo encontrado com os filtros atuais'
        }
      </h3>
      <p className="text-gray-600 mb-6">
        {meuConteudos.length === 0
          ? 'Que tal criar seu primeiro conteúdo para compartilhar conhecimento com outros professores?'
          : 'Tente ajustar os filtros para encontrar seus conteúdos.'
        }
      </p>
      <button
        onClick={() => setMostrarFormulario(true)}
        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg flex items-center gap-2 mx-auto"
      >
        <Plus className="w-4 h-4" />
        {meuConteudos.length === 0 ? 'Criar Primeiro Conteúdo' : 'Criar Novo Conteúdo'}
      </button>
    </div>
  ) : (
    <div className={`
      ${visualizacao === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-6'}
    `}>
      {conteudosFiltrados.map(conteudo => (
        <ConteudoCard
          key={conteudo.id}
          conteudo={conteudo}
          variant={visualizacao === 'list' ? 'compact' : 'default'}
          onEditar={handleEditarConteudo}
          onDeletar={handleDeletarConteudo}
          onVisualizarCompleto={handleVisualizarCompleto}
          showActions={true}
        />
      ))}
    </div>
  )}

  {/* Quick Actions Footer */}
  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <Zap className="w-5 h-5 text-yellow-500" />
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
        onClick={() => handleFiltroChange('status', 'destaque')}
        className="flex items-center justify-center gap-2 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl hover:from-yellow-100 hover:to-orange-100 transition-all duration-200 group"
      >
        <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
          <Star className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <div className="font-medium text-gray-900">Em Destaque</div>
          <div className="text-xs text-gray-600">Conteúdos destacados</div>
        </div>
      </button>

      <button
        onClick={() => handleFiltroChange('ordenacao', 'visualizacoes')}
        className="flex items-center justify-center gap-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 group"
      >
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
          <Eye className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <div className="font-medium text-gray-900">Mais Vistos</div>
          <div className="text-xs text-gray-600">Seus sucessos</div>
        </div>
      </button>

      <button
        onClick={() => navigate('/professores/estatisticas')}
        className="flex items-center justify-center gap-2 p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all duration-200 group"
      >
        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <div className="font-medium text-gray-900">Estatísticas</div>
          <div className="text-xs text-gray-600">Ver métricas completas</div>
        </div>
      </button>
    </div>
  </div>

  {/* Tips & Motivação */}
  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
        <span className="text-white text-xl">💪</span>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Dicas para Maximizar seu Impact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold mb-2">🎯 Engajamento:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Use títulos descritivos e chamativos</li>
              <li>• Adicione tags relevantes para facilitar busca</li>
              <li>• Inclua materiais para download quando possível</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">📈 Crescimento:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Publique conteúdo regularmente</li>
              <li>• Marque seus melhores conteúdos como destaque</li>
              <li>• Analise suas estatísticas para melhorar</li>
            </ul>
          </div>
        </div>
        
        {/* Personal Stats Summary */}
        <div className="mt-4 p-4 bg-white/60 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-900">Seu progresso hoje:</span>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {meuConteudos.length} criados
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {estatisticas.visualizacoes || 0} views
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                {estatisticas.downloads || 0} downloads
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
);
};
export default ProfessoresMinhaArea;