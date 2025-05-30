import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';
import {
  Plus,
  Eye,
  Download,
  TrendingUp,
  BookOpen,
  Video,
  Lightbulb,
  Heart,
  FileText,
  Calendar,
  Activity,
  BarChart3,
  User,
  ChevronRight,
  Shield,
  RefreshCw,
  Star,
  Zap,
  Users,
  Award,
  Clock
} from 'lucide-react';
import { supabase } from '../../shared/lib/supabase/supabaseClient';

const ProfessoresDashboard = () => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState('');
  
  // Estados para dados
  const [stats, setStats] = useState({
    totalConteudos: 0,
    totalVisualizacoes: 0,
    totalDownloads: 0,
    conteudosPorTipo: {
      video: 0,
      sacada: 0,
      devocional: 0,
      material: 0
    }
  });
  const [recentConteudos, setRecentConteudos] = useState([]);
  const [conteudosDestaque, setConteudosDestaque] = useState([]);
  const [loading, setLoading] = useState(true);

  // Evita problemas de hydration + saudação japonesa
  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('おはよう');
    else if (hour < 18) setGreeting('こんにちは');
    else setGreeting('こんばんは');
  }, []);

  // Carregar dados
  useEffect(() => {
    if (mounted && userProfile?.id) {
      loadDashboardData();
    }
  }, [mounted, userProfile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar estatísticas do professor logado
      const { data: conteudos, error } = await supabase
        .from('professores_conteudos')
        .select('*')
        .eq('criado_por', userProfile.id)
        .eq('ativo', true);

      if (error) throw error;

      // Calcular estatísticas
      const totalConteudos = conteudos.length;
      const totalVisualizacoes = conteudos.reduce((sum, item) => sum + (item.visualizacoes || 0), 0);
      const totalDownloads = conteudos.reduce((sum, item) => sum + (item.downloads || 0), 0);

      const conteudosPorTipo = {
        video: conteudos.filter(c => c.tipo === 'video').length,
        sacada: conteudos.filter(c => c.tipo === 'sacada').length,
        devocional: conteudos.filter(c => c.tipo === 'devocional').length,
        material: conteudos.filter(c => c.tipo === 'material').length
      };

      setStats({
        totalConteudos,
        totalVisualizacoes,
        totalDownloads,
        conteudosPorTipo
      });

      // Conteúdos recentes
      const recentContent = conteudos
        .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
        .slice(0, 4);

      setRecentConteudos(recentContent);

      // Conteúdos em destaque
      const featuredContent = conteudos
        .sort((a, b) => (b.visualizacoes || 0) - (a.visualizacoes || 0))
        .slice(0, 3);
      setConteudosDestaque(featuredContent);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
            <span className="text-white text-2xl">👨‍🏫</span>
          </div>
          <p className="text-gray-600">Carregando Dashboard...</p>
        </div>
      </div>
    );
  }

  // Componente de Card de Estatística - NORMALIZADO
  const StatsCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 text-center hover:shadow-md transition-all duration-200">
      <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600">{title}</p>
      {trend && (
        <div className="flex items-center justify-center mt-1">
          <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
          <span className="text-xs text-green-600 font-medium">{trend}</span>
        </div>
      )}
    </div>
  );

  // Componente de Card de Conteúdo - MELHORADO
  const ConteudoCard = ({ conteudo }) => {
    const getTypeIcon = (tipo) => {
      switch (tipo) {
        case 'video': return '🎥';
        case 'sacada': return '💡';
        case 'devocional': return '❤️';
        case 'material': return '📄';
        default: return '📚';
      }
    };

    const getTypeColor = (tipo) => {
      switch (tipo) {
        case 'video': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'sacada': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'devocional': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'material': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 text-sm">{conteudo.titulo}</h3>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 border ${getTypeColor(conteudo.tipo)}`}>
            <span className="mr-1">{getTypeIcon(conteudo.tipo)}</span>
            <span className="capitalize">{conteudo.tipo}</span>
          </span>
        </div>

        {conteudo.descricao && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{conteudo.descricao}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Eye className="w-3 h-3 mr-1" />
              <span>{conteudo.visualizacoes || 0}</span>
            </div>
            <div className="flex items-center">
              <Download className="w-3 h-3 mr-1" />
              <span>{conteudo.downloads || 0}</span>
            </div>
          </div>

          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{new Date(conteudo.criado_em).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-4xl font-light text-gray-800 mb-3">
          {greeting}, {userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}! 
          <span className="inline-block animate-bounce ml-2">👨‍🏫</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-2">
          Área dos Professores - Nipo School
        </p>
        <p className="text-sm text-green-500 font-medium">🎓 "Ensinar é tocar uma vida para sempre. Criar é inspirar gerações."</p>
      </div>

      {/* Progress Circle */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-32 h-32 sm:w-36 sm:h-36 border-4 border-green-200 rounded-full flex items-center justify-center relative bg-white shadow-lg">
            <div className="absolute inset-2 border-4 border-green-400 rounded-full opacity-30"></div>
            <div className="text-center z-10 relative">
              <span className="text-3xl sm:text-4xl font-light text-green-500 block">
                {loading ? '...' : stats.totalConteudos}
              </span>
              <p className="text-xs text-gray-500 mt-1 font-medium">CONTEÚDOS</p>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">CRIADOS</p>
            </div>
            <div className="absolute top-2 right-2 text-green-300 animate-pulse">📚</div>
            <div className="absolute bottom-2 left-2 text-green-300 animate-pulse">✨</div>
          </div>
          <div className="absolute inset-0 w-32 h-32 sm:w-36 sm:h-36 border border-green-300 rounded-full animate-ping opacity-20"></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Conteúdos"
          value={stats.totalConteudos}
          icon={BookOpen}
          color="text-blue-500"
          trend="+12% este mês"
        />
        <StatsCard
          title="Visualizações"
          value={stats.totalVisualizacoes.toLocaleString()}
          icon={Eye}
          color="text-green-500"
          trend="+8% semana"
        />
        <StatsCard
          title="Downloads"
          value={stats.totalDownloads.toLocaleString()}
          icon={Download}
          color="text-purple-500"
          trend="+15% mês"
        />
        <StatsCard
          title="Engajamento"
          value="94%"
          icon={Activity}
          color="text-orange-500"
          trend="+5% semana"
        />
      </div>

      {/* Conteúdos por Tipo e Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Tipos de Conteúdo */}
        <div className="lg:col-span-1">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
              Conteúdos por Tipo
            </h3>
            <div className="space-y-4">
              {[
                { tipo: 'video', label: 'Vídeos', count: stats.conteudosPorTipo.video, color: 'bg-blue-500', emoji: '🎥' },
                { tipo: 'sacada', label: 'Sacadas', count: stats.conteudosPorTipo.sacada, color: 'bg-yellow-500', emoji: '💡' },
                { tipo: 'devocional', label: 'Devocionais', count: stats.conteudosPorTipo.devocional, color: 'bg-purple-500', emoji: '❤️' },
                { tipo: 'material', label: 'Materiais', count: stats.conteudosPorTipo.material, color: 'bg-red-500', emoji: '📄' }
              ].map((item) => {
                const percentage = stats.totalConteudos > 0 ? (item.count / stats.totalConteudos) * 100 : 0;

                return (
                  <div key={item.tipo} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center mr-3`}>
                        <span className="text-white text-sm">{item.emoji}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-900">{item.count}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 ${item.color} rounded-full transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Conteúdos Recentes */}
        <div className="lg:col-span-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-500" />
                Conteúdos Recentes
              </h3>
              <Link
                to="/professores/minha-area"
                className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
              >
                Ver todos
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {recentConteudos.length > 0 ? (
              <div className="space-y-3">
                {recentConteudos.map((conteudo) => (
                  <ConteudoCard key={conteudo.id} conteudo={conteudo} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum conteúdo ainda</h4>
                <p className="text-gray-500 mb-4">
                  Comece criando seu primeiro conteúdo!
                </p>
                <Link
                  to="/professores/novo"
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Primeiro Conteúdo</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdos em Destaque */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Conteúdos em Destaque
            <span className="ml-2 text-yellow-500">⭐</span>
          </h3>
          <Link
            to="/professores/conteudos"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            Ver todos
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        {conteudosDestaque.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conteudosDestaque.map((conteudo) => (
              <ConteudoCard key={conteudo.id} conteudo={conteudo} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum conteúdo em destaque</h4>
            <p className="text-gray-500">
              Conteúdos com melhor desempenho aparecerão aqui automaticamente.
            </p>
          </div>
        )}
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        
        {/* Criar Conteúdo */}
        <Link
          to="/professores/novo"
          className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border border-green-100 hover:border-green-300 hover:-translate-y-1"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2 text-lg">Criar Conteúdo</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Nova sacada, vídeo ou material didático
          </p>
        </Link>

        {/* Ver Biblioteca */}
        <Link
          to="/professores/conteudos"
          className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border border-blue-100 hover:border-blue-300 hover:-translate-y-1"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2 text-lg">Biblioteca</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Explorar todos os conteúdos disponíveis
          </p>
        </Link>

        {/* Estatísticas */}
        <Link
          to="/professores/estatisticas"
          className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border border-purple-100 hover:border-purple-300 hover:-translate-y-1"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2 text-lg">Estatísticas</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Métricas detalhadas e engajamento
          </p>
        </Link>

        {/* Minha Área */}
        <Link
          to="/professores/minha-area"
          className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border border-orange-100 hover:border-orange-300 hover:-translate-y-1"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <User className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2 text-lg">Minha Área</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Perfil e configurações pessoais
          </p>
        </Link>

        {/* Painel Admin - se for admin */}
        {userProfile?.tipo_usuario === 'admin' && (
          <Link
            to="/professores/admin"
            className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border-2 border-purple-200 hover:border-purple-300 hover:-translate-y-1 sm:col-span-2"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-purple-900 mb-2 text-lg">Painel Administrativo</h3>
            <p className="text-purple-700 text-sm leading-relaxed">
              Controle total da escola e usuários
            </p>
          </Link>
        )}
      </div>

      {/* Dica do Dia */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200 p-6 mb-8">
        <div className="flex items-start">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0 shadow-lg">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <span className="text-2xl mr-2">💡</span>
              Dica para Professores
            </h3>
            <p className="text-gray-700 mb-4">
              Para aumentar o engajamento, use títulos curiosos e adicione elementos visuais 
              aos seus conteúdos. Alunos adoram aprender de forma divertida!
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center space-x-2 bg-white/60 px-3 py-1 rounded-full">
                <span className="text-blue-500">📚</span>
                <span className="text-gray-700 font-medium">{stats.totalConteudos} conteúdos</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 px-3 py-1 rounded-full">
                <span className="text-green-500">👀</span>
                <span className="text-gray-700 font-medium">{stats.totalVisualizacoes} visualizações</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 px-3 py-1 rounded-full">
                <span className="text-purple-500">⬇️</span>
                <span className="text-gray-700 font-medium">{stats.totalDownloads} downloads</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessoresDashboard;