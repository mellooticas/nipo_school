import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { professoresService } from '../services/professoresService';
import {
  RefreshCw,
  TrendingUp,
  BarChart3,
  Eye,
  Download,
  Star,
  Target,
  Award,
  Users,
  BookOpen,
  Globe,
  User,
  Plus,
  ChevronRight
} from 'lucide-react';

const ProfessoresEstatisticas = () => {
  const { user, userProfile } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    gerais: {},
    minhas: {},
    conteudos: [],
    topConteudos: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodo, setPeriodo] = useState('todos');
  const [visualizacao, setVisualizacao] = useState('geral');

  // Evita problemas de hydration
  useEffect(() => {
    setMounted(true);
  }, []);
 
  const carregarEstatisticas = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // Verificar se as funções existem antes de chamá-las
      const promises = [
        professoresService.getEstatisticasGerais(),
        user ? professoresService.getEstatisticasAutor(user.id) : Promise.resolve({ success: true, data: {} })
      ];

      // Verificar se a função getConteudosMaisVistos existe
      if (typeof professoresService.getConteudosMaisVistos === 'function') {
        promises.push(professoresService.getConteudosMaisVistos(10));
      } else {
        // Usar função alternativa ou buscar conteúdos normais
        console.warn('⚠️ getConteudosMaisVistos não encontrada, usando getConteudos');
        promises.push(
          professoresService.getConteudos({ visivel: true })
            .then(response => ({
              success: response.success,
              data: response.success ? response.data.slice(0, 10) : []
            }))
        );
      }

      const [geraisResponse, minhasResponse, topConteudosResponse] = await Promise.all(promises);

      setEstatisticas({
        gerais: geraisResponse.data || {},
        minhas: minhasResponse.data || {},
        topConteudos: topConteudosResponse.data || []
      });

    } catch (err) {
      setError('Erro ao carregar estatísticas');
      console.error('🚫 Erro ao carregar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (mounted) {
      carregarEstatisticas();
    }
  }, [mounted, user, periodo, carregarEstatisticas]);

  // Componente StatCard seguindo Design System mas mantendo visual original
  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 text-center hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <p className="text-xs text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          {typeof icon === 'string' ? (
            <span className="text-lg">{icon}</span>
          ) : (
            React.createElement(icon, { className: "w-5 h-5 text-white" })
          )}
        </div>
      </div>
      {trend && (
        <div className="mt-3 text-xs">
          <span className={`font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? '↗️' : '↘️'} {trend.value}
          </span>
          <span className="text-gray-500 ml-2">{trend.period}</span>
        </div>
      )}
    </div>
  );

  // Componente ProgressBar mantendo visual original
  const ProgressBar = ({ label, value, max, color }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm text-gray-600">{value}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Função para obter ícone do tipo de conteúdo
  const getTipoIcone = (tipo) => {
    const icones = {
      'sacada': '💡',
      'video': '🎥',
      'devocional': '📖',
      'material': '📄'
    };
    return icones[tipo] || '📚';
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse shadow-lg">
            <span className="text-white text-2xl">📊</span>
          </div>
          <p className="text-base text-gray-700">Carregando Estatísticas...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-base text-gray-700">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-red-100 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar estatísticas</h2>
        <p className="text-base text-gray-700 mb-6">{error}</p>
        <button
          onClick={carregarEstatisticas}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const { gerais, minhas, topConteudos } = estatisticas;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-4xl font-light text-gray-800 mb-3 flex items-center justify-center">
            <span className="text-4xl mr-3">📊</span>
            Estatísticas e Analytics
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-2">
            Acompanhe o desempenho dos conteúdos e engajamento da comunidade
          </p>
          <p className="text-sm text-red-500 font-medium">📈 "Dados transformam intuição em estratégia inteligente."</p>
        </div>

        {/* Controles Principais */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Painel de Controle</h2>
              <p className="text-gray-600 text-sm">Configure a visualização das suas métricas</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Seletor de Visualização */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setVisualizacao('geral')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    visualizacao === 'geral'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Geral</span>
                </button>
                <button
                  onClick={() => setVisualizacao('pessoal')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    visualizacao === 'pessoal'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Pessoal</span>
                </button>
              </div>

              {/* Seletor de Período */}
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-sm"
              >
                <option value="todos">Todos os tempos</option>
                <option value="30dias">Últimos 30 dias</option>
                <option value="7dias">Últimos 7 dias</option>
              </select>

              <button
                onClick={carregarEstatisticas}
                className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas Principais */}
        {visualizacao === 'geral' ? (
          // Estatísticas Gerais
          <>
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">📈</span>
                Visão Geral da Plataforma
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total de Conteúdos"
                  value={gerais.total || 0}
                  icon={BookOpen}
                  color="bg-gradient-to-br from-blue-500 to-blue-600"
                  subtitle="Todos os conteúdos criados"
                />
                <StatCard
                  title="Visualizações Totais"
                  value={gerais.visualizacoes || 0}
                  icon={Eye}
                  color="bg-gradient-to-br from-green-500 to-green-600"
                  subtitle="Todas as visualizações"
                />
                <StatCard
                  title="Downloads Totais"
                  value={gerais.downloads || 0}
                  icon={Download}
                  color="bg-gradient-to-br from-purple-500 to-purple-600"
                  subtitle="Materiais baixados"
                />
                <StatCard
                  title="Conteúdos Ativos"
                  value={gerais.visiveis || 0}
                  icon="✅"
                  color="bg-gradient-to-br from-yellow-500 to-yellow-600"
                  subtitle="Visíveis publicamente"
                />
              </div>
            </div>

            {/* Distribuição por Tipo */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Distribuição por Tipo de Conteúdo
              </h3>
              <div className="space-y-4">
                <ProgressBar
                  label="💡 Sacadas Pedagógicas"
                  value={gerais.por_tipo?.sacada || 0}
                  max={gerais.total || 1}
                  color="bg-gradient-to-r from-yellow-500 to-yellow-600"
                />
                <ProgressBar
                  label="🎥 Vídeos Educativos"
                  value={gerais.por_tipo?.video || 0}
                  max={gerais.total || 1}
                  color="bg-gradient-to-r from-blue-500 to-blue-600"
                />
                <ProgressBar
                  label="📖 Devocionais"
                  value={gerais.por_tipo?.devocional || 0}
                  max={gerais.total || 1}
                  color="bg-gradient-to-r from-purple-500 to-purple-600"
                />
                <ProgressBar
                  label="📄 Materiais Didáticos"
                  value={gerais.por_tipo?.material || 0}
                  max={gerais.total || 1}
                  color="bg-gradient-to-r from-red-500 to-red-600"
                />
              </div>
            </div>
          </>
        ) : (
          // Estatísticas Pessoais
          <>
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                Suas Estatísticas Pessoais
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Seus Conteúdos"
                  value={minhas.total || 0}
                  icon="📝"
                  color="bg-gradient-to-br from-blue-500 to-blue-600"
                  subtitle="Conteúdos criados por você"
                />
                <StatCard
                  title="Suas Visualizações"
                  value={minhas.visualizacoes || 0}
                  icon={Eye}
                  color="bg-gradient-to-br from-green-500 to-green-600"
                  subtitle="Total de visualizações"
                />
                <StatCard
                  title="Seus Downloads"
                  value={minhas.downloads || 0}
                  icon={Download}
                  color="bg-gradient-to-br from-purple-500 to-purple-600"
                  subtitle="Materiais baixados"
                />
                <StatCard
                  title="Em Destaque"
                  value={minhas.destaques || 0}
                  icon={Star}
                  color="bg-gradient-to-br from-yellow-500 to-yellow-600"
                  subtitle="Conteúdos destacados"
                />
              </div>
            </div>

            {/* Seus Conteúdos por Tipo */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Seus Conteúdos por Tipo
              </h3>
              <div className="space-y-4">
                <ProgressBar
                  label="💡 Suas Sacadas"
                  value={minhas.por_tipo?.sacada || 0}
                  max={minhas.total || 1}
                  color="bg-gradient-to-r from-yellow-500 to-yellow-600"
                />
                <ProgressBar
                  label="🎥 Seus Vídeos"
                  value={minhas.por_tipo?.video || 0}
                  max={minhas.total || 1}
                  color="bg-gradient-to-r from-blue-500 to-blue-600"
                />
                <ProgressBar
                  label="📖 Seus Devocionais"
                  value={minhas.por_tipo?.devocional || 0}
                  max={minhas.total || 1}
                  color="bg-gradient-to-r from-purple-500 to-purple-600"
                />
                <ProgressBar
                  label="📄 Seus Materiais"
                  value={minhas.por_tipo?.material || 0}
                  max={minhas.total || 1}
                  color="bg-gradient-to-r from-red-500 to-red-600"
                />
              </div>
            </div>

            {/* Status dos Conteúdos */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-500" />
                Status dos Seus Conteúdos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-4xl font-bold text-green-600 mb-2">{minhas.visiveis || 0}</div>
                  <div className="text-sm text-green-700 font-medium mb-1">✅ Visíveis</div>
                  <div className="text-xs text-green-600">Publicados e ativos</div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-4xl font-bold text-gray-600 mb-2">{minhas.ocultos || 0}</div>
                  <div className="text-sm text-gray-700 font-medium mb-1">👁️ Ocultos</div>
                  <div className="text-xs text-gray-600">Não visíveis publicamente</div>
                </div>
                <div className="text-center p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="text-4xl font-bold text-yellow-600 mb-2">{minhas.destaques || 0}</div>
                  <div className="text-sm text-yellow-700 font-medium mb-1">⭐ Destaques</div>
                  <div className="text-xs text-yellow-600">Em destaque na plataforma</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Top Conteúdos Mais Visualizados */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            Top 10 Conteúdos {Array.isArray(topConteudos) && topConteudos.length > 0 ? 'Mais Visualizados' : 'Recentes'}
          </h3>
          
          {Array.isArray(topConteudos) && topConteudos.length > 0 ? (
            <div className="space-y-4">
              {topConteudos.slice(0, 10).map((conteudo, index) => (
                <div key={conteudo.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white shadow-md ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-br from-yellow-600 to-yellow-700' :
                      'bg-gradient-to-br from-gray-300 to-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getTipoIcone(conteudo.tipo)}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900 line-clamp-1">{conteudo.titulo || 'Sem título'}</h4>
                        <p className="text-sm text-gray-600">Por: {conteudo.autor_nome || 'Autor desconhecido'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="text-center">
                      <div className="font-bold text-lg text-gray-900">{conteudo.visualizacoes || 0}</div>
                      <div className="flex items-center gap-1 justify-center">
                        <Eye className="w-3 h-3" />
                        <span>Views</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg text-gray-900">{conteudo.downloads || 0}</div>
                      <div className="flex items-center gap-1 justify-center">
                        <Download className="w-3 h-3" />
                        <span>Downloads</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum conteúdo encontrado ainda</h4>
              <p className="text-base text-gray-700 mb-6">Os conteúdos aparecerão aqui conforme são criados</p>
              <button
                onClick={() => window.location.href = '/professores/novo'}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg"
              >
                Criar Primeiro Conteúdo
              </button>
            </div>
          )}
        </div>

        {/* Insights e Dicas */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white text-xl">💡</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Insights e Dicas para Professores
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    Para Aumentar Visualizações:
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Use títulos claros e atrativos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Adicione tags relevantes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Inclua imagens de capa chamativas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Marque conteúdos importantes como destaque</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    Para Aumentar Engajamento:
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Crie conteúdos práticos e aplicáveis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Adicione materiais para download</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Use vídeos explicativos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Mantenha uma frequência regular de posts</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => window.location.href = '/professores/novo'}
              className="flex items-center justify-center gap-2 p-4 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl hover:from-red-100 hover:to-red-200 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Criar Conteúdo</div>
                <div className="text-xs text-gray-600">Nova sacada ou material</div>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/professores/minha-area'}
              className="flex items-center justify-center gap-2 p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Minha Área</div>
                <div className="text-xs text-gray-600">Perfil pessoal</div>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/professores/conteudos'}
              className="flex items-center justify-center gap-2 p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Explorar</div>
                <div className="text-xs text-gray-600">Biblioteca completa</div>
              </div>
            </button>

            <button
              onClick={carregarEstatisticas}
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
      </div>
    </div>
  );
};

export default ProfessoresEstatisticas;