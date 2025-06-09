import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInstrumentosComStats } from '../../shared/hooks';
import { useAuth } from '../../shared/contexts/AuthContext';

const InstrumentosList = () => {
  const { userProfile } = useAuth();
  const { instrumentos, loading, error } = useInstrumentosComStats();
  const [filtroCategoria, setFiltroCategoria] = useState('todos');

  // Categorias disponíveis
  const categorias = [
    { value: 'todos', label: '🎵 Todos os Instrumentos', count: instrumentos.length },
    { value: 'sopro', label: '🎷 Sopros', count: instrumentos.filter(i => i.categoria === 'sopro').length },
    { value: 'corda', label: '🎻 Cordas', count: instrumentos.filter(i => i.categoria === 'corda').length },
    { value: 'percussao', label: '🥁 Percussão', count: instrumentos.filter(i => i.categoria === 'percussao').length },
    { value: 'teclado', label: '🎹 Teclados', count: instrumentos.filter(i => i.categoria === 'teclado').length },
    { value: 'vocal', label: '🎤 Vocal', count: instrumentos.filter(i => i.categoria === 'vocal').length },
    { value: 'teoria', label: '📘 Teoria', count: instrumentos.filter(i => i.categoria === 'teoria').length },
  ];

  // Filtrar instrumentos
  const instrumentosFiltrados = filtroCategoria === 'todos' 
    ? instrumentos 
    : instrumentos.filter(inst => inst.categoria === filtroCategoria);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando instrumentos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro ao carregar instrumentos</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎵 Instrumentos Musicais
        </h1>
        <p className="text-gray-600">
          Escolha seu instrumento e comece sua jornada musical
        </p>
      </div>

      {/* Filtros por categoria */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categorias.map((categoria) => (
            <button
              key={categoria.value}
              onClick={() => setFiltroCategoria(categoria.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filtroCategoria === categoria.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {categoria.label} ({categoria.count})
            </button>
          ))}
        </div>
      </div>

      {/* Grid de instrumentos */}
      {instrumentosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {instrumentosFiltrados.map((instrumento) => (
            <InstrumentoCard 
              key={instrumento.id} 
              instrumento={instrumento}
              userProfile={userProfile}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum instrumento encontrado
          </h3>
          <p className="text-gray-500">
            Não há instrumentos disponíveis nesta categoria.
          </p>
        </div>
      )}

      {/* Estatísticas gerais */}
      {instrumentos.length > 0 && (
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Estatísticas Gerais</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {instrumentos.length}
              </div>
              <div className="text-gray-600 text-sm">Instrumentos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {instrumentos.reduce((sum, i) => sum + i.estatisticas.total_alunos, 0)}
              </div>
              <div className="text-gray-600 text-sm">Total de Alunos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {instrumentos.reduce((sum, i) => sum + i.estatisticas.total_professores, 0)}
              </div>
              <div className="text-gray-600 text-sm">Professores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {instrumentos.reduce((sum, i) => sum + i.estatisticas.novos_alunos_30dias, 0)}
              </div>
              <div className="text-gray-600 text-sm">Novos Alunos (30d)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente do card do instrumento
const InstrumentoCard = ({ instrumento, userProfile }) => {
  // Cores por categoria
  const getCategoryColor = (categoria) => {
    const colors = {
      sopro: '#EAB308',
      corda: '#DC2626', 
      percussao: '#EA580C',
      teclado: '#7C3AED',
      vocal: '#EC4899',
      teoria: '#059669',
      outros: '#6B7280'
    };
    return colors[categoria] || colors.outros;
  };

  const corCategoria = getCategoryColor(instrumento.categoria);
  const { estatisticas } = instrumento;

  return (
    <Link to={`/instrumentos/${instrumento.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden">
        {/* Header do card com cor da categoria */}
        <div 
          className="h-24 flex items-center justify-center text-white"
          style={{ backgroundColor: corCategoria }}
        >
          <div className="text-center">
            <div className="text-2xl mb-1">
              {getInstrumentEmoji(instrumento.nome)}
            </div>
            <div className="text-sm opacity-90 capitalize">
              {instrumento.categoria}
            </div>
          </div>
        </div>

        {/* Conteúdo do card */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {instrumento.nome}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {instrumento.descricao || `Aprenda ${instrumento.nome} com nossos professores especializados.`}
          </p>

          {/* Estatísticas */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">👥 Alunos:</span>
              <span className="font-medium">{estatisticas.total_alunos}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">👨‍🏫 Professores:</span>
              <span className="font-medium">{estatisticas.total_professores}</span>
            </div>
            {estatisticas.novos_alunos_30dias > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">🆕 Novos (30d):</span>
                <span className="font-medium text-green-600">
                  +{estatisticas.novos_alunos_30dias}
                </span>
              </div>
            )}
          </div>

          {/* Níveis disponíveis */}
          {Object.keys(estatisticas.distribuicao_nivel).length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-1">Níveis disponíveis:</div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(estatisticas.distribuicao_nivel).map(([nivel, count]) => (
                  <span 
                    key={nivel}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {nivel} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Call to action baseado no tipo de usuário */}
          <div className="pt-2 border-t border-gray-100">
            {userProfile?.tipo_usuario === 'aluno' ? (
              <div className="text-center">
                <span className="text-sm font-medium" style={{ color: corCategoria }}>
                  🎵 Explorar Instrumento
                </span>
              </div>
            ) : userProfile?.tipo_usuario === 'professor' ? (
              <div className="text-center">
                <span className="text-sm font-medium" style={{ color: corCategoria }}>
                  👨‍🏫 Área do Professor
                </span>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-sm font-medium" style={{ color: corCategoria }}>
                  📊 Ver Detalhes
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

// Função para obter emoji do instrumento
const getInstrumentEmoji = (nome) => {
  const emojis = {
    'Piano': '🎹',
    'Teclado': '🎹',
    'Violão': '🎸',
    'Guitarra': '🎸',
    'Baixo': '🎸',
    'Violino': '🎻',
    'Viola Clássica': '🎻',
    'Violoncelo': '🎻',
    'Contrabaixo Acústico': '🎻',
    'Bateria': '🥁',
    'Percussão Erudita': '🥁',
    'Saxofone': '🎷',
    'Clarinete': '🎶',
    'Oboé': '🎶',
    'Fagote': '🎶',
    'Flauta': '🎶',
    'Trompete': '🎺',
    'Trombone': '🎺',
    'Tuba': '🎺',
    'Eufônio': '🎺',
    'Canto / Voz': '🎤',
    'Teoria Musical': '📘',
    'Outro': '🎵'
  };
  return emojis[nome] || '🎵';
};

export default InstrumentosList;