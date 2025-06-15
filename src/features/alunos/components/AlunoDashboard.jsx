import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  BookOpen, 
  Trophy, 
  Play, 
  ChevronRight, 
  Flame,
  Music,
  Star,
  Award,
  Heart,
  LogOut,
  RefreshCw,
  Camera  // 🚀 ADICIONAR ESTA LINHA
} from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useModules } from '../../modulos/hooks/useModules';
import { useAchievements } from '../../gamificacao/hooks/useAchievements';
import { useProgress } from '../../alunos/hooks/useAlunoProgress';
import { useDevotionals } from '../../devocional/hooks/useDevotionals';
import { supabase } from '../../../shared/lib/supabase/supabaseClient';

const AlunoDashboard = () => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState('');
  
  // Estados para votação 
  const [votingData, setVotingData] = useState([]);
  const [userVotedLogo, setUserVotedLogo] = useState(null);

  // Hooks do Supabase
  const { modules, loading: modulesLoading, getModuleStats } = useModules();
  const { loading: achievementsLoading, getAchievementStats } = useAchievements();
  const { loading: progressLoading, getProgressStats } = useProgress();
  const { loading: devotionalsLoading, getTodayDevotional } = useDevotionals();

  // Buscar dados de votação
  const fetchVotingData = async () => {
    try {
      const { data: votosData, error: votosError } = await supabase
        .from('view_placar_logos')
        .select('*') 
        .order('votos', { ascending: false });

      if (votosError) throw votosError;
      
      setVotingData(votosData || []);
      
      if (userProfile?.voted_logo) {
        const logoVotado = votosData?.find(logo => logo.id === userProfile.voted_logo);
        setUserVotedLogo(logoVotado);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de votação:', error);
    }
  };

  // Inicialização
  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('おはよう');
    else if (hour < 18) setGreeting('こんにちは');
    else setGreeting('こんばんは');
    
    if (userProfile) {
      fetchVotingData();
    }
  }, [userProfile]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
            <span className="text-white text-2xl">🎵</span>
          </div>
          <p className="text-gray-600">Carregando Nipo School...</p>
        </div>
      </div>
    );
  }

  // Calcular estatísticas
  const moduleStats = getModuleStats();
  const achievementStats = getAchievementStats();
  const progressStats = getProgressStats();
  const todayDevotional = getTodayDevotional();

  const getInstrumentEmoji = (instrument) => {
    const emojiMap = {
      'teclado': '🎹',
      'bateria': '🥁',
      'violao': '🎸',
      'baixo': '🎸',
      'voz': '🎤',
      'teoria': '🎼'
    };
    return emojiMap[instrument?.toLowerCase()] || '🎵';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isLoading = modulesLoading || achievementsLoading || progressLoading || devotionalsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-red-100 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-white text-sm sm:text-lg font-bold">鳥</span>
            </div>
            <div>
              <span className="font-bold text-gray-800 text-base sm:text-lg">Nipo School</span>
              <p className="text-xs text-red-500 font-medium hidden sm:block">#NipoSchoolOn</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isLoading && (
              <RefreshCw className="w-4 h-4 text-red-500 animate-spin" />
            )}
            <div className="flex items-center space-x-2 bg-gradient-to-r from-red-50 to-orange-50 px-3 py-2 rounded-full border border-red-200">
              <span className="text-red-500 font-bold">改</span>
              <span className="text-red-600 font-bold text-sm">1</span>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Welcome Section */}
        <header className="text-center mb-8">
          <h1 className="text-2xl sm:text-4xl font-light text-gray-800 mb-3">
            {greeting}, {userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}! 
            <span className="inline-block animate-bounce ml-2">👋</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-2">
            Bem-vindo à sua área de estudos
          </p>
          <p className="text-sm text-red-500 font-medium">🎵 "Se não for divertido, ninguém aprende"</p>
        </header>

        {/* Progress Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 sm:w-36 sm:h-36 border-4 border-red-200 rounded-full flex items-center justify-center relative bg-white shadow-lg">
              <div className="absolute inset-2 border-4 border-red-400 rounded-full opacity-30"></div>
              <div className="text-center z-10 relative">
                <span className="text-3xl sm:text-4xl font-light text-red-500 block">
                  {isLoading ? '...' : `${moduleStats.averageProgress}%`}
                </span>
                <p className="text-xs text-gray-500 mt-1 font-medium">PROGRESSO</p>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">GERAL</p>
              </div>
              <div className="absolute top-2 right-2 text-red-300 animate-pulse">🎵</div>
              <div className="absolute bottom-2 left-2 text-red-300 animate-pulse">🎶</div>
            </div>
            <div className="absolute inset-0 w-32 h-32 sm:w-36 sm:h-36 border border-red-300 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>

        {/* Stats Grid - Específico para Alunos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-amber-200 text-center">
            <Star className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? '...' : (userProfile?.total_points || 0)}
            </p>
            <p className="text-xs text-gray-600">Pontos</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-red-200 text-center">
            <Flame className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? '...' : (userProfile?.current_streak || 0)}
            </p>
            <p className="text-xs text-gray-600">Dias</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-blue-200 text-center">
            <BookOpen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? '...' : progressStats.completedLessons}
            </p>
            <p className="text-xs text-gray-600">Aulas</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-emerald-200 text-center">
            <Trophy className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? '...' : achievementStats.earned}
            </p>
            <p className="text-xs text-gray-600">Conquistas</p>
          </div>
        </div>

        // Encontre a seção "Action Buttons Grid" no seu AlunoDashboard.jsx e SUBSTITUA por esta versão:

        {/* Action Buttons Grid - Específico para Alunos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          
          {/* 🚀 NOVO: Scanner QR Code - PRIORIDADE MÁXIMA */}
          <button 
            onClick={() => navigate('/scanner')}
            className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border-2 border-red-200 hover:border-red-400 hover:-translate-y-1 bg-gradient-to-br from-red-50 to-pink-50"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 animate-pulse">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-red-800 mb-2 text-lg">📱 Registrar Presença</h3>
            <p className="text-red-600 text-sm leading-relaxed font-medium">
              Escaneie o QR Code da aula
            </p>
            <div className="mt-2 text-xs text-red-500 bg-red-100 px-2 py-1 rounded-full inline-block">
              ✨ Sistema Alpha School
            </div>
          </button>

          {/* Meu Instrumento */}
          <button 
            onClick={() => navigate('/alunos/meu-instrumento')}
            className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border border-blue-100 hover:border-blue-300 hover:-translate-y-1"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2 text-lg">Meu Instrumento</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {userProfile?.instrument ? `Página do ${userProfile.instrument}` : 'Explore instrumentos'}
            </p>
          </button>

          {/* Módulos */}
          <button 
            onClick={() => navigate('/modulos')}
            className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border border-green-100 hover:border-green-300 hover:-translate-y-1"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2 text-lg">Módulos</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {isLoading ? 'Carregando...' : `${moduleStats.total} módulos disponíveis`}
            </p>
          </button>

          {/* Conquistas */}
          <button 
            onClick={() => navigate('/conquistas')}
            className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border border-yellow-100 hover:border-yellow-300 hover:-translate-y-1"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2 text-lg">Conquistas</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {isLoading ? 'Carregando...' : `${achievementStats.earned} conquistadas`}
            </p>
          </button>

          {/* Devocional */}
          <button 
            onClick={() => navigate('/devocional')}  
            className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border border-purple-100 hover:border-purple-300 hover:-translate-y-1"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2 text-lg">Devocional</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {isLoading ? 'Carregando...' : (todayDevotional ? 'Novo conteúdo disponível' : 'Reflexões diárias')}
            </p>
          </button>

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
              またね (Mata ne)
            </p>
          </button>
        </div>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-red-200 bg-white/50 rounded-t-2xl backdrop-blur-sm">
          <div className="mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <span className="text-white text-sm font-bold">鳥</span>
            </div>
          </div>
          <p className="text-gray-600 font-medium mb-1">
            Nipo School App &copy; 2025
          </p>
          <p className="text-red-500 text-sm font-bold">
            🎵 "Se não for divertido, ninguém aprende"
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Versão Beta • ADNIPO Suzano • Área do Aluno
          </p>
        </footer>
      </div>
      
      {/* Floating Musical Notes */}
      <div className="fixed top-1/4 left-4 text-red-200 text-2xl animate-bounce opacity-30 pointer-events-none">
        🎵
      </div>
      <div className="fixed top-1/3 right-8 text-red-200 text-xl animate-bounce opacity-30 pointer-events-none" style={{animationDelay: '1s'}}>
        🎶
      </div>
      <div className="fixed bottom-1/3 left-8 text-red-200 text-lg animate-bounce opacity-30 pointer-events-none" style={{animationDelay: '2s'}}>
        🎼
      </div>
    </div>
  );
};

export default AlunoDashboard;