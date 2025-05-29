import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';
import { professoresService } from '../../services/professoresService';
import ConteudoCard from '../../components/professores/ConteudoCard';
import FormConteudo from '../../components/professores/FormConteudo';

const ProfessoresConteudos = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
    busca: '',
    tipo: '',
    categoria: '',
    nivel: '',
    autor: '',
    visivel: '',
    ordenacao: 'recente'
  });
  
  // Estados de paginação e visualização
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [visualizacao, setVisualizacao] = useState('grid'); // 'grid', 'list', 'compact'
  const [conteudosPorPagina] = useState(12);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [conteudosResponse, categoriasResponse] = await Promise.all([
        professoresService.getConteudos(),
        professoresService.getCategorias()
      ]);

      setConteudos(conteudosResponse.data || []);
      setCategorias(categoriasResponse.data || []);
    } catch (err) {
      setError('Erro ao carregar conteúdos. Tente novamente.');
      console.error('Erro:', err);
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
        conteudo.titulo.toLowerCase().includes(termo) ||
        conteudo.descricao.toLowerCase().includes(termo) ||
        conteudo.conteudo.toLowerCase().includes(termo) ||
        (conteudo.tags && conteudo.tags.some(tag => tag.toLowerCase().includes(termo)))
      );
    }

    // Filtro por tipo
    if (filtros.tipo) {
      resultado = resultado.filter(conteudo => conteudo.tipo === filtros.tipo);
    }

    // Filtro por categoria
    if (filtros.categoria) {
      resultado = resultado.filter(conteudo => conteudo.categoria_id === filtros.categoria);
    }

    // Filtro por nível
    if (filtros.nivel) {
      resultado = resultado.filter(conteudo => conteudo.nivel === filtros.nivel);
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
      case 'destaque':
        resultado.sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));
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
    setPaginaAtual(1); // Reset para primeira página
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
      // Atualizar conteúdo existente
      setConteudos(prev => prev.map(c => 
        c.id === editandoConteudo.id ? { ...c, ...novoConteudo } : c
      ));
    } else {
      // Adicionar novo conteúdo
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
  };

  // Tipos de conteúdo
  const tiposConteudo = [
    { value: 'sacada', label: '💡 Sacadas', count: conteudos.filter(c => c.tipo === 'sacada').length },
    { value: 'video', label: '🎥 Vídeos', count: conteudos.filter(c => c.tipo === 'video').length },
    { value: 'devocional', label: '📖 Devocionais', count: conteudos.filter(c => c.tipo === 'devocional').length },
    { value: 'material', label: '📄 Materiais', count: conteudos.filter(c => c.tipo === 'material').length }
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📚 Conteúdos dos Professores
              </h1>
              <p className="text-gray-600 mt-1">
                {conteudosFiltrados.length} conteúdo{conteudosFiltrados.length !== 1 ? 's' : ''} encontrado{conteudosFiltrados.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Controles de Visualização */}
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
                <button
                  onClick={() => setVisualizacao('compact')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    visualizacao === 'compact'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ≡ Compacto
                </button>
              </div>

              <button
                onClick={() => {
                  setEditandoConteudo(null);
                  setMostrarFormulario(true);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                ✨ Novo Conteúdo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de Filtros */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">🔍 Filtros</h2>
                <button
                  onClick={limparFiltros}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Limpar
                </button>
              </div>

              <div className="space-y-6">
                {/* Busca */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <input
                    type="text"
                    value={filtros.busca}
                    onChange={(e) => handleFiltroChange('busca', e.target.value)}
                    placeholder="Título, descrição, tags..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                {/* Tipos de Conteúdo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de Conteúdo
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleFiltroChange('tipo', '')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        filtros.tipo === ''
                          ? 'bg-red-100 text-red-800 font-medium'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      📂 Todos ({conteudos.length})
                    </button>
                    {tiposConteudo.map(tipo => (
                      <button
                        key={tipo.value}
                        onClick={() => handleFiltroChange('tipo', tipo.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          filtros.tipo === tipo.value
                            ? 'bg-red-100 text-red-800 font-medium'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {tipo.label} ({tipo.count})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categorias */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={filtros.categoria}
                    onChange={(e) => handleFiltroChange('categoria', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Todos os níveis</option>
                    <option value="iniciante">Iniciante</option>
                    <option value="intermediario">Intermediário</option>
                    <option value="avancado">Avançado</option>
                    <option value="todos">Todos os Níveis</option>
                  </select>
                </div>

                {/* Visibilidade (apenas para admins/pastores) */}
                {['admin', 'pastor'].includes(user?.nivel_acesso) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visibilidade
                    </label>
                    <select
                      value={filtros.visivel}
                      onChange={(e) => handleFiltroChange('visivel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Todos</option>
                      <option value="true">Visíveis</option>
                      <option value="false">Ocultos</option>
                    </select>
                  </div>
                )}

                {/* Ordenação */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={filtros.ordenacao}
                    onChange={(e) => handleFiltroChange('ordenacao', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="recente">Mais recente</option>
                    <option value="antigo">Mais antigo</option>
                    <option value="titulo">Título (A-Z)</option>
                    <option value="visualizacoes">Mais visualizado</option>
                    <option value="destaque">Em destaque</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Área Principal de Conteúdo */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600">Carregando conteúdos...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 text-lg mb-4">❌ {error}</div>
                <button
                  onClick={carregarDados}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Tentar Novamente
                </button>
              </div>
            ) : conteudosPaginados.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum conteúdo encontrado
                </h3>
                <p className="text-gray-600 mb-6">
                  {conteudosFiltrados.length === 0 && conteudos.length > 0
                    ? 'Tente ajustar os filtros para encontrar conteúdos.'
                    : 'Que tal criar o primeiro conteúdo?'
                  }
                </p>
                <button
                  onClick={() => setMostrarFormulario(true)}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  ✨ Criar Primeiro Conteúdo
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
                  <div className="mt-8 flex items-center justify-center">
                    <nav className="flex items-center gap-2">
                      <button
                        onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                        disabled={paginaAtual === 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        ← Anterior
                      </button>
                      
                      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(pagina => (
                        <button
                          key={pagina}
                          onClick={() => setPaginaAtual(pagina)}
                          className={`px-3 py-2 border rounded-lg ${
                            pagina === paginaAtual
                              ? 'bg-red-600 text-white border-red-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pagina}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                        disabled={paginaAtual === totalPaginas}
                        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Próxima →
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessoresConteudos;