import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';
import { professoresService } from '../../services/professoresService';
import ConteudoCard from '../../components/professores/ConteudoCard';
import FormConteudo from '../../components/professores/FormConteudo';

const ProfessoresMinhaArea = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
    status: '', // 'visivel', 'oculto', 'destaque'
    ordenacao: 'recente'
  });
  
  // Estados de visualização
  const [visualizacao, setVisualizacao] = useState('grid');
  const [mostrarEstatisticas, setMostrarEstatisticas] = useState(true);

  // Carregar dados do professor
  useEffect(() => {
    if (user?.id) {
      carregarMeuConteudos();
      carregarEstatisticas();
    }
  }, [user]);

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
    carregarEstatisticas(); // Atualizar estatísticas
  };

  const handleVisualizarCompleto = (conteudo) => {
    navigate(`/professores/conteudos/${conteudo.id}`);
  };

  const handleSalvarConteudo = (novoConteudo) => {
    if (editandoConteudo) {
      // Atualizar conteúdo existente
      setMeuConteudos(prev => prev.map(c => 
        c.id === editandoConteudo.id ? { ...c, ...novoConteudo } : c
      ));
    } else {
      // Adicionar novo conteúdo
      setMeuConteudos(prev => [novoConteudo, ...prev]);
    }
    
    setMostrarFormulario(false);
    setEditandoConteudo(null);
    carregarEstatisticas(); // Atualizar estatísticas
  };

  const limparFiltros = () => {
    setFiltroLocal({
      busca: '',
      tipo: '',
      status: '',
      ordenacao: 'recente'
    });
  };

  // Estatísticas por tipo
  const tiposEstatisticas = [
    { tipo: 'sacada', label: '💡 Sacadas', count: meuConteudos.filter(c => c.tipo === 'sacada').length },
    { tipo: 'video', label: '🎥 Vídeos', count: meuConteudos.filter(c => c.tipo === 'video').length },
    { tipo: 'devocional', label: '📖 Devocionais', count: meuConteudos.filter(c => c.tipo === 'devocional').length },
    { tipo: 'material', label: '📄 Materiais', count: meuConteudos.filter(c => c.tipo === 'material').length }
  ];

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
    <div className="min-h-screen bg-gray-50">
      {/* Header Personalizado */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                👤 Minha Área - {user?.nome || 'Professor'}
              </h1>
              <p className="text-red-100">
                Gerencie seus conteúdos e acompanhe suas estatísticas
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMostrarEstatisticas(!mostrarEstatisticas)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                {mostrarEstatisticas ? '📊 Ocultar Stats' : '📈 Mostrar Stats'}
              </button>
              
              <button
                onClick={() => setMostrarFormulario(true)}
                className="px-6 py-3 bg-white text-red-600 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                ✨ Novo Conteúdo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Estatísticas (se visível) */}
        {mostrarEstatisticas && (
          <div className="mb-8">
            {/* Cards de Estatísticas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Conteúdos</p>
                    <p className="text-3xl font-bold text-gray-900">{estatisticas.total}</p>
                  </div>
                  <div className="text-3xl">📚</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Visualizações</p>
                    <p className="text-3xl font-bold text-gray-900">{estatisticas.visualizacoes}</p>
                  </div>
                  <div className="text-3xl">👁️</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conteúdos Visíveis</p>
                    <p className="text-3xl font-bold text-gray-900">{estatisticas.visiveis}</p>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Downloads</p>
                    <p className="text-3xl font-bold text-gray-900">{estatisticas.downloads}</p>
                  </div>
                  <div className="text-3xl">⬇️</div>
                </div>
              </div>
            </div>

            {/* Estatísticas por Tipo */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Conteúdos por Tipo</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {tiposEstatisticas.map(item => (
                  <div key={item.tipo} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-2">{item.label}</div>
                    <div className="text-xl font-bold text-gray-900">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Controles e Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Meus Conteúdos ({conteudosFiltrados.length})
              </h2>
              <p className="text-gray-600">
                {meuConteudos.length} conteúdo{meuConteudos.length !== 1 ? 's' : ''} criado{meuConteudos.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Controles de Visualização */}
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setVisualizacao('grid')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    visualizacao === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ⊞ Grid
                </button>
                <button
                  onClick={() => setVisualizacao('list')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    visualizacao === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ☰ Lista
                </button>
              </div>
            </div>
          </div>

          {/* Filtros em linha */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Busca */}
            <div>
              <input
                type="text"
                value={filtroLocal.busca}
                onChange={(e) => handleFiltroChange('busca', e.target.value)}
                placeholder="🔍 Buscar..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Tipo */}
            <div>
              <select
                value={filtroLocal.tipo}
                onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Todos os tipos</option>
                <option value="sacada">💡 Sacadas</option>
                <option value="video">🎥 Vídeos</option>
                <option value="devocional">📖 Devocionais</option>
                <option value="material">📄 Materiais</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <select
                value={filtroLocal.status}
                onChange={(e) => handleFiltroChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Todos os status</option>
                <option value="visivel">✅ Visíveis</option>
                <option value="oculto">👁️ Ocultos</option>
                <option value="destaque">⭐ Em destaque</option>
              </select>
            </div>

            {/* Ordenação */}
            <div>
              <select
                value={filtroLocal.ordenacao}
                onChange={(e) => handleFiltroChange('ordenacao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="recente">Mais recente</option>
                <option value="antigo">Mais antigo</option>
                <option value="titulo">Título (A-Z)</option>
                <option value="visualizacoes">Mais visto</option>
              </select>
            </div>

            {/* Limpar filtros */}
            <div>
              <button
                onClick={limparFiltros}
                className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                🗑️ Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Conteúdos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-3 text-gray-600">Carregando seus conteúdos...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">❌ {error}</div>
            <button
              onClick={carregarMeuConteudos}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Tentar Novamente
            </button>
          </div>
        ) : conteudosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {meuConteudos.length === 0 
                ? 'Você ainda não criou nenhum conteúdo'
                : 'Nenhum conteúdo encontrado com os filtros atuais'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {meuConteudos.length === 0
                ? 'Que tal criar seu primeiro conteúdo para compartilhar conhecimento?'
                : 'Tente ajustar os filtros para encontrar seus conteúdos.'
              }
            </p>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              ✨ {meuConteudos.length === 0 ? 'Criar Primeiro Conteúdo' : 'Criar Novo Conteúdo'}
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
      </div>
    </div>
  );
};

export default ProfessoresMinhaArea;