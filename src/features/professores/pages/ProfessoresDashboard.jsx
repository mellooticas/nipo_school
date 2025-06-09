import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
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
  Users,
  Clock,
  LogOut
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabase/supabaseClient';

const ProfessorDashboard = () => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState('');
  
  // Estados para dados
  const [stats, setStats] = useState({
    totalConteudos: 0,
    totalVisualizacoes: 0,
    totalDownloads: 0,
    totalAlunos: 0,
    conteudosPorTipo: {
      video: 0,
      sacada: 0,
      devocional: 0,
      material: 0
    }
  });
  const [recentConteudos, setRecentConteudos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inicialização
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

      // Buscar conteúdos do professor
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
        totalAlunos: 0, // TODO: Implementar contagem de alunos
        conteudosPorTipo
      });

      // Conteúdos recentes (últimos 3)
      const recentContent = conteudos
        .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
        .slice(0, 3);

      setRecentConteudos(recentContent);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
            <span className="text-white text-2xl">👨‍🏫</span>
          </div>
          <p className="text-gray-600">Carregando Dashboard...</p>
        </div>
      </div>
    );
  }

  // Componente de Card de Conteúdo
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
        case 'video': return 'bg-blue-50 border-blue-200';
        case 'sacada': return 'bg-yellow-50 border-yellow-200';
        case 'devocional': return 'bg-purple-50 border-purple-200';
        case 'material': return 'bg-red-50 border-red-200';
        default: return 'bg-gray-50 border-gray-200';
      }
    };

    return (
      <div className={`rounded-xl border p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-1 ${getTypeColor(conteudo.tipo)}`}>
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 text-sm">{conteudo.titulo}</h3>
          <span className="text-lg ml-2">{getTypeIcon(conteudo.tipo)}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
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
          <span>{new Date(conteudo.criado_em).toLocaleDateString('pt-BR')}</span>
        </div>

        <Link
          to={`/professores/conteudos/${conteudo.id}`}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Ver detalhes →
        </Link>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
      
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-green-100 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-white text-sm sm:text-lg font-bold">先</span>
            </div>
            <div>
              <span className="font-bold text-gray-800 text-base sm:text-lg">Nipo School</span>
              <p className="text-xs text-green-500 font-medium hidden sm:block">Área do Professor</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {loading && (
              <RefreshCw className="w-4 h-4 text-green-500 animate-spin" />
            )}
            <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-full border border-green-200">
              <span className="text-green-500 font-bold">師</span>
              <span className="text-green-600 font-bold text-sm">{stats.totalConteudos}</span>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
              {userProfile?.avatar_url ? (
                <img 
                  src={userProfile.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Welcome Section */}
        <header className="text-center mb-8">
          <h1 className="text-2xl sm:text-4xl font-light text-gray-800 mb-3">
            {greeting}, {userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}! 
            <span className="inline-block animate-bounce ml-2">👨‍🏫</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-2">
            Área dos Professores - Inspire e Eduque
          </p>
          <p className="text-sm text-green-500 font-medium">🎓 "Ensinar é tocar uma vida para sempre"</p>
        </header>

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
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-blue-200 text-center">
            <BookOpen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '...' : stats.totalConteudos}
            </p>
            <p className="text-xs text-gray-600">Conteúdos</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-green-200 text-center">
            <Eye className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '...' : stats.totalVisualizacoes.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">Visualizações</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-purple-200 text-center">
            <Download className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '...' : stats.totalDownloads.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">Downloads</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-orange-200 text-center">
            <Users className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '...' : stats.totalAlunos}
            </p>
            <p className="text-xs text-gray-600">Alunos</p>
          </div>
        </div>

        {/* Conteúdos por Tipo e Recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Tipos de Conteúdo */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-green-100">
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

          {/* Conteúdos Recentes */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-500" />
                Conteúdos Recentes
              </h3>
              <Link
                to="/professores/conteudos"
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

        {/* Action Buttons Grid */}
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

          {/* Biblioteca */}
          <Link
            to="/professores/conteudos"
            className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border border-blue-100 hover:border-blue-300 hover:-translate-y-1"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2 text-lg">Biblioteca</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Explorar todos os conteúdos
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
              Métricas e engajamento
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
              Perfil e configurações
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

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border-2 border-gray-200 hover:border-gray-300 hover:-translate-y-1 sm:col-span-2"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <LogOut className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2 text-lg">Sair</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              さようなら (Sayounara)
            </p>
          </button>
        </div>

        {/* Dica para Professores */}
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

        {/* Footer */}
        <footer className="text-center py-8 border-t border-green-200 bg-white/50 rounded-t-2xl backdrop-blur-sm">
          <div className="mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <span className="text-white text-sm font-bold">先</span>
            </div>
          </div>
          <p className="text-gray-600 font-medium mb-1">
            Nipo School App &copy; 2025
          </p>
          <p className="text-green-500 text-sm font-bold">
            🎓 "Ensinar é tocar uma vida para sempre"
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Versão Beta • ADNIPO Suzano • Área do Professor
          </p>
        </footer>
      </div>
      
      {/* Floating Icons */}
      <div className="fixed top-1/4 left-4 text-green-200 text-2xl animate-bounce opacity-30 pointer-events-none">
        📚
      </div>
      <div className="fixed top-1/3 right-8 text-green-200 text-xl animate-bounce opacity-30 pointer-events-none" style={{animationDelay: '1s'}}>
        ✨
      </div>
      <div className="fixed bottom-1/3 left-8 text-green-200 text-lg animate-bounce opacity-30 pointer-events-none" style={{animationDelay: '2s'}}>
        🎓
      </div>
    </div>
  );
};

export default ProfessorDashboard;