import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';
import { professoresService } from '../../services/professoresService';

const ProfessoresEstatisticas = () => {
  const { user } = useAuth();
  const [estatisticas, setEstatisticas] = useState({
    gerais: {},
    minhas: {},
    conteudos: [],
    topConteudos: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodo, setPeriodo] = useState('todos'); // 'todos', '30dias', '7dias'
  const [visualizacao, setVisualizacao] = useState('geral'); // 'geral', 'pessoal'

  const carregarEstatisticas = React.useCallback(async () => {
    try {
      setLoading(true);
      
      const [geraisResponse, minhasResponse, topConteudosResponse] = await Promise.all([
        professoresService.getEstatisticasGerais(),
        user ? professoresService.getEstatisticasAutor(user.id) : { success: true, data: {} },
        professoresService.getConteudosMaisVistos(10)
      ]);

      setEstatisticas({
        gerais: geraisResponse.data || {},
        minhas: minhasResponse.data || {},
        topConteudos: topConteudosResponse.data || []
      });

    } catch (err) {
      setError('Erro ao carregar estatísticas');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    carregarEstatisticas();
  }, [user, periodo, carregarEstatisticas]);

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <div className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      {trend && (
        <div className="mt-4 text-sm">
          <span className={`font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? '↗️' : '↘️'} {trend.value}
          </span>
          <span className="text-gray-500 ml-2">{trend.period}</span>
        </div>
      )}
    </div>
  );

  const ProgressBar = ({ label, value, max, color }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm text-gray-600">{value}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar estatísticas</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={carregarEstatisticas}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const { gerais, minhas, topConteudos } = estatisticas;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">📊 Estatísticas e Analytics</h1>
              <p className="text-red-100">
                Acompanhe o desempenho dos conteúdos e engajamento da comunidade
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Seletor de Visualização */}
              <div className="flex bg-white/20 rounded-lg p-1">
                <button
                  onClick={() => setVisualizacao('geral')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    visualizacao === 'geral'
                      ? 'bg-white text-red-600'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  🌐 Geral
                </button>
                <button
                  onClick={() => setVisualizacao('pessoal')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    visualizacao === 'pessoal'
                      ? 'bg-white text-red-600'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  👤 Pessoal
                </button>
              </div>

              {/* Seletor de Período */}
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50 focus:border-transparent"
              >
                <option value="todos" className="text-gray-900">Todos os tempos</option>
                <option value="30dias" className="text-gray-900">Últimos 30 dias</option>
                <option value="7dias" className="text-gray-900">Últimos 7 dias</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas Principais */}
        {visualizacao === 'geral' ? (
          // Estatísticas Gerais
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Visão Geral da Plataforma</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total de Conteúdos"
                  value={gerais.total || 0}
                  icon="📚"
                  color="border-blue-500"
                  subtitle="Todos os conteúdos criados"
                />
                <StatCard
                  title="Visualizações Totais"
                  value={gerais.visualizacoes || 0}
                  icon="👁️"
                  color="border-green-500"
                  subtitle="Todas as visualizações"
                />
                <StatCard
                  title="Downloads Totais"
                  value={gerais.downloads || 0}
                  icon="⬇️"
                  color="border-purple-500"
                  subtitle="Materiais baixados"
                />
                <StatCard
                  title="Conteúdos Ativos"
                  value={gerais.visiveis || 0}
                  icon="✅"
                  color="border-yellow-500"
                  subtitle="Visíveis publicamente"
                />
              </div>
            </div>

            {/* Distribuição por Tipo */}
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">📊 Distribuição por Tipo de Conteúdo</h3>
                <div className="space-y-4">
                  <ProgressBar
                    label="💡 Sacadas Pedagógicas"
                    value={gerais.por_tipo?.sacada || 0}
                    max={gerais.total || 1}
                    color="bg-yellow-500"
                  />
                  <ProgressBar
                    label="🎥 Vídeos Educativos"
                    value={gerais.por_tipo?.video || 0}
                    max={gerais.total || 1}
                    color="bg-blue-500"
                  />
                  <ProgressBar
                    label="📖 Devocionais"
                    value={gerais.por_tipo?.devocional || 0}
                    max={gerais.total || 1}
                    color="bg-purple-500"
                  />
                  <ProgressBar
                    label="📄 Materiais Didáticos"
                    value={gerais.por_tipo?.material || 0}
                    max={gerais.total || 1}
                    color="bg-red-500"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          // Estatísticas Pessoais
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">👤 Suas Estatísticas Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Seus Conteúdos"
                  value={minhas.total || 0}
                  icon="📝"
                  color="border-blue-500"
                  subtitle="Conteúdos criados por você"
                />
                <StatCard
                  title="Suas Visualizações"
                  value={minhas.visualizacoes || 0}
                  icon="👁️"
                  color="border-green-500"
                  subtitle="Total de visualizações"
                />
                <StatCard
                  title="Seus Downloads"
                  value={minhas.downloads || 0}
                  icon="⬇️"
                  color="border-purple-500"
                  subtitle="Materiais baixados"
                />
                <StatCard
                  title="Em Destaque"
                  value={minhas.destaques || 0}
                  icon="⭐"
                  color="border-yellow-500"
                  subtitle="Conteúdos destacados"
                />
              </div>
            </div>

            {/* Seus Conteúdos por Tipo */}
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">📊 Seus Conteúdos por Tipo</h3>
                <div className="space-y-4">
                  <ProgressBar
                    label="💡 Suas Sacadas"
                    value={minhas.por_tipo?.sacada || 0}
                    max={minhas.total || 1}
                    color="bg-yellow-500"
                  />
                  <ProgressBar
                    label="🎥 Seus Vídeos"
                    value={minhas.por_tipo?.video || 0}
                    max={minhas.total || 1}
                    color="bg-blue-500"
                  />
                  <ProgressBar
                    label="📖 Seus Devocionais"
                    value={minhas.por_tipo?.devocional || 0}
                    max={minhas.total || 1}
                    color="bg-purple-500"
                  />
                  <ProgressBar
                    label="📄 Seus Materiais"
                    value={minhas.por_tipo?.material || 0}
                    max={minhas.total || 1}
                    color="bg-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Status dos Conteúdos */}
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">📋 Status dos Seus Conteúdos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{minhas.visiveis || 0}</div>
                    <div className="text-sm text-green-700 font-medium">✅ Visíveis</div>
                    <div className="text-xs text-green-600">Publicados e ativos</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-600">{minhas.ocultos || 0}</div>
                    <div className="text-sm text-gray-700 font-medium">👁️ Ocultos</div>
                    <div className="text-xs text-gray-600">Não visíveis publicamente</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">{minhas.destaques || 0}</div>
                    <div className="text-sm text-yellow-700 font-medium">⭐ Destaques</div>
                    <div className="text-xs text-yellow-600">Em destaque na plataforma</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Top Conteúdos Mais Visualizados */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">🏆 Top 10 Conteúdos Mais Visualizados</h3>
            
            {topConteudos.length > 0 ? (
              <div className="space-y-4">
                {topConteudos.map((conteudo, index) => (
                  <div key={conteudo.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-yellow-600' :
                        'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {conteudo.tipo === 'sacada' ? '💡' :
                           conteudo.tipo === 'video' ? '🎥' :
                           conteudo.tipo === 'devocional' ? '📖' : '📄'}
                        </span>
                        <div>
                          <h4 className="font-medium text-gray-900 line-clamp-1">{conteudo.titulo}</h4>
                          <p className="text-sm text-gray-600">Por: {conteudo.autor_nome}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="text-center">
                        <div className="font-bold text-lg text-gray-900">{conteudo.visualizacoes || 0}</div>
                        <div>👁️ Views</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-gray-900">{conteudo.downloads || 0}</div>
                        <div>⬇️ Downloads</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>Nenhum conteúdo encontrado ainda</p>
              </div>
            )}
          </div>
        </div>

        {/* Insights e Dicas */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              💡 Insights e Dicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">📈 Para Aumentar Visualizações:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Use títulos claros e atrativos</li>
                  <li>• Adicione tags relevantes</li>
                  <li>• Inclua imagens de capa chamativas</li>
                  <li>• Marque conteúdos importantes como destaque</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">🎯 Para Aumentar Engajamento:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Crie conteúdos práticos e aplicáveis</li>
                  <li>• Adicione materiais para download</li>
                  <li>• Use vídeos explicativos</li>
                  <li>• Mantenha uma frequência regular de posts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Ações Rápidas</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => window.location.href = '/professores/novo'}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                ✨ Criar Novo Conteúdo
              </button>
              <button
                onClick={() => window.location.href = '/professores/minha-area'}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                👤 Ver Minha Área
              </button>
              <button
                onClick={() => window.location.href = '/professores/conteudos'}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                📚 Explorar Conteúdos
              </button>
              <button
                onClick={carregarEstatisticas}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                🔄 Atualizar Dados
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessoresEstatisticas;