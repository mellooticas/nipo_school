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
  Target,
  Star,
  Award,
  Heart,
  TrendingUp,
  Clock,
  Calendar,
  LogOut,
  RefreshCw,
  Users,
  Zap,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../shared/contexts/AuthContext';
import { useModules } from '../shared/hooks/useModules';
import { useAchievements } from '../shared/hooks/useAchievements';
import { useProgress } from '../shared/hooks/useProgress';
import { useDevotionals } from '../shared/hooks/useDevotionals';
import { supabase } from '../shared/lib/supabase/supabaseClient';

// 🎯 IMPORTAR O BANNER DOS PROFESSORES
import ProfessorAccessBanner from '../components/professores/ProfessorAccessBanner';

const Dashboard = () => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState('');
  
  // Estados para votação 
  const [votingData, setVotingData] = useState([]);
  const [userVotedLogo, setUserVotedLogo] = useState(null);

  // Hooks reais do Supabase
  const { modules, loading: modulesLoading, getModuleStats } = useModules();
  const { loading: achievementsLoading, getAchievementStats, getRecentAchievements } = useAchievements();
  const { loading: progressLoading, getProgressStats } = useProgress();
  const { loading: devotionalsLoading, getTodayDevotional } = useDevotionals();

  // Função para buscar dados de votação
  const fetchVotingData = async () => {
    try {
      const { data: votosData, error: votosError } = await supabase
        .from('view_placar_logos')
        .select('*')
        .order('votos', { ascending: false });

      if (votosError) throw votosError;
      
      setVotingData(votosData || []);
      
      // Encontrar o logo que o usuário votou
      if (userProfile?.voted_logo) {
        const logoVotado = votosData?.find(logo => logo.id === userProfile.voted_logo);
        setUserVotedLogo(logoVotado);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de votação:', error);
    }
  };

  // Evita problemas de hydration
  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('おはよう');
    else if (hour < 18) setGreeting('こんにちは');
    else setGreeting('こんばんは');
    
    // Buscar dados de votação quando userProfile estiver disponível
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

  // Calcular estatísticas combinadas
  const moduleStats = getModuleStats();
  const achievementStats = getAchievementStats();
  const progressStats = getProgressStats();
  const recentAchievements = getRecentAchievements();
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

  // Loading state quando dados ainda estão carregando
  const isLoading = modulesLoading || achievementsLoading || progressLoading || devotionalsLoading;

  // Determinar tipo de usuário
  const userType = userProfile?.tipo_usuario || 'aluno';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      
      {/* Navigation - Mobile First */}
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
            Bem-vindo à Nipo School
            {userType === 'professor' && ' - Área do Professor'}
            {userType === 'admin' && ' - Administração'}
          </p>
          <p className="text-sm text-red-500 font-medium">🎵 "Se não for divertido, ninguém aprende. Se não for fácil, ninguém começa. Se não for TikTokável, ninguém compartilha."</p>
        </header>

        {/* 🎯 BANNER DOS PROFESSORES - Mostrar apenas para professores/admins */}
        {['professor', 'pastor', 'admin'].includes(userType) && (
          <ProfessorAccessBanner />
        )}

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

        {/* Stats Grid - Personalizado por tipo de usuário */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {userType === 'aluno' && (
            <>
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
            </>
          )}

          {userType === 'professor' && (
            <>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-green-200 text-center">
                <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-600">Alunos</p>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-blue-200 text-center">
                <BookOpen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-600">Turmas</p>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-purple-200 text-center">
                <Music className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-600">Conteúdos</p>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-orange-200 text-center">
                <BarChart3 className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-600">Visualizações</p>
              </div>
            </>
          )}

          {userType === 'admin' && (
            <>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-blue-200 text-center">
                <Music className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">23</p>
                <p className="text-xs text-gray-600">Instrumentos</p>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-green-200 text-center">
                <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">9</p>
                <p className="text-xs text-gray-600">Alunos</p>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-purple-200 text-center">
                <User className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">2</p>
                <p className="text-xs text-gray-600">Professores</p>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-red-200 text-center">
                <Trophy className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-xs text-gray-600">Turmas Ativas</p>
              </div>
            </>
          )}
        </div>

        {/* Profile Card + Batalha dos Logos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Profile Card - Personalizado por tipo */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-2xl sm:text-3xl mr-3">
                {userType === 'aluno' && '🎵'}
                {userType === 'professor' && '👨‍🏫'}
                {userType === 'admin' && '⚙️'}
              </span>
              {userType === 'aluno' && 'Seu Perfil Musical'}
              {userType === 'professor' && 'Perfil do Professor'}
              {userType === 'admin' && 'Perfil Administrativo'}
            </h2>
            <div className="space-y-4">
              {userType === 'aluno' && (
                <>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
                    <span className="font-semibold text-gray-700 flex items-center">
                      <span className="mr-2 text-xl">{getInstrumentEmoji(userProfile?.instrument)}</span>
                      Instrumento:
                    </span>
                    <span className="text-gray-800 font-bold">{userProfile?.instrument || "Não cadastrado"}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <span className="font-semibold text-gray-700 flex items-center">
                      <span className="mr-2 text-xl">🎂</span>
                      Nascimento:
                    </span>
                    <span className="text-gray-800 font-bold">{userProfile?.dob || "Não informado"}</span>
                  </div>
                </>
              )}

              {userType === 'professor' && (
                <>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <span className="font-semibold text-gray-700 flex items-center">
                      <span className="mr-2 text-xl">🎵</span>
                      Especialidade:
                    </span>
                    <span className="text-gray-800 font-bold">{userProfile?.instrument || "Múltiplos"}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <span className="font-semibold text-gray-700 flex items-center">
                      <span className="mr-2 text-xl">👥</span>
                      Status:
                    </span>
                    <span className="text-green-600 font-bold">Ativo</span>
                  </div>
                </>
              )}

              {userType === 'admin' && (
                <>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
                    <span className="font-semibold text-gray-700 flex items-center">
                      <span className="mr-2 text-xl">⚙️</span>
                      Cargo:
                    </span>
                    <span className="text-gray-800 font-bold">Administrador</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <span className="font-semibold text-gray-700 flex items-center">
                      <span className="mr-2 text-xl">🔐</span>
                      Permissões:
                    </span>
                    <span className="text-red-600 font-bold">Total</span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <span className="font-semibold text-gray-700 flex items-center">
                  <span className="mr-2 text-xl">🗳️</span>
                  Votação Logo:
                </span>
                {userProfile?.has_voted ? (
                  <div className="text-right">
                    <span className="text-green-600 flex items-center font-bold text-sm">
                      <span className="mr-2">✅</span>
                      {userVotedLogo?.nome || 'Concluído'}
                    </span>
                  </div>
                ) : (
                  <span className="text-red-600 font-bold">Pendente</span>
                )}
              </div>
            </div>
          </div>

          {/* Batalha dos Logos - Igual para todos */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold">🎵</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Batalha dos Logos</h3>
                    <p className="text-purple-100 text-xs">
                      {votingData.reduce((sum, logo) => sum + (logo.votos || 0), 0)} votos • Encerra 22/02
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">🏆</div>
                  <div className="text-purple-100 text-xs">Em disputa</div>
                </div>
              </div>
            </div>

            <div className="p-4">
              {/* Status do Usuário */}
              {userProfile?.has_voted ? (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    {userVotedLogo?.url && (
                      <img 
                        src={userVotedLogo.url} 
                        alt={userVotedLogo.nome}
                        className="w-8 h-8 rounded-full object-cover border-2 border-green-500"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-green-800 font-medium text-sm">
                        ✅ Você votou no <strong>{userVotedLogo?.nome || 'seu logo'}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                    <p className="text-orange-800 font-medium text-sm">
                      ⏳ <strong>Seu voto é importante!</strong>
                    </p>
                    <button
                      onClick={() => navigate('/vote')}
                      className="bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600 transition-colors text-xs font-medium"
                    >
                      Votar
                    </button>
                  </div>
                </div>
              )}

              {/* Placar */}
              {votingData.length > 0 ? (
                <div className="space-y-3">
                  {votingData.slice(0, 3).map((logo, index) => {
                    const totalVotes = votingData.reduce((sum, l) => sum + (l.votos || 0), 0);
                    const percentage = totalVotes > 0 ? Math.round((logo.votos / totalVotes) * 100) : 0;
                    const isLeading = index === 0;
                    const isUserChoice = logo.id === userProfile?.voted_logo;
                    
                    return (
                      <div 
                        key={logo.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                          isLeading 
                            ? 'bg-yellow-50 border border-yellow-200' 
                            : isUserChoice 
                              ? 'bg-purple-50 border border-purple-200'
                              : 'bg-gray-50'
                        }`}
                      >
                        <div className="relative">
                          <img 
                            src={logo.url} 
                            alt={logo.nome}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          {isLeading && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">1</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-800 text-sm truncate flex items-center">
                              {logo.nome}
                              {isLeading && <span className="ml-1 text-xs">🏆</span>}
                              {isUserChoice && <span className="ml-1 text-xs">❤️</span>}
                            </h4>
                            <div className="text-right">
                              <span className="font-bold text-gray-800 text-sm">{percentage}%</span>
                              <span className="text-gray-500 text-xs ml-1">({logo.votos})</span>
                            </div>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-1000 ${
                                isLeading 
                                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                                  : isUserChoice
                                    ? 'bg-gradient-to-r from-purple-400 to-pink-500'
                                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">Carregando placar...</p>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-4">
                <button
                  onClick={() => navigate('/vote')}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2"
                >
                  <span className="text-lg">👁️</span>
                  <span>Ver Detalhes Completos</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Modules */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-red-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Music className="w-5 h-5 mr-2 text-red-500" />
              Seus Módulos
            </h2>
            <button 
              onClick={() => navigate('/modulos')}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
            >
              Ver todos
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando módulos...</p>
            </div>
          ) : modules.length > 0 ? (
            <div className="space-y-4">
              {modules.slice(0, 2).map((module) => (
                <div
                  key={module.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer group"
                >
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-xl text-white">
                        {getInstrumentEmoji(module.instrument_category)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-600">{module.lessons_count} aulas</p>
                    </div>
                    <button className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progresso</span>
                      <span className="font-medium">{module.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${module.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum módulo disponível ainda.</p>
            </div>
          )}
        </div>

        {/* Action Buttons Grid - Personalizado por tipo de usuário */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          
          {/* Botões para ALUNOS */}
          {userType === 'aluno' && (
            <>
              {/* Meu Instrumento */}
              <button 
                onClick={() => navigate('/instrumentos')}
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
            </>
          )}

          {/* Botões para PROFESSORES */}
          {userType === 'professor' && (
            <>
              {/* Área do Professor */}
              <button 
                onClick={() => navigate('/professores')}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border border-green-100 hover:border-green-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-lg">Área do Professor</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Dashboard e gestão de conteúdo
                </p>
              </button>

              {/* Meus Instrumentos */}
              <button 
                onClick={() => navigate('/instrumentos')}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border border-blue-100 hover:border-blue-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-lg">Meus Instrumentos</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Instrumentos que ensino
                </p>
              </button>

              {/* Meus Alunos */}
              <button 
                onClick={() => navigate('/professores')}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border border-orange-100 hover:border-orange-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-lg">Meus Alunos</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Acompanhar progresso dos alunos
                </p>
              </button>

              {/* Conteúdo */}
              <button 
                onClick={() => navigate('/professores/conteudos')}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border border-purple-100 hover:border-purple-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-lg">Gerenciar Conteúdo</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Criar e editar materiais
                </p>
              </button>
            </>
          )}

          {/* Botões para ADMINS */}
          {userType === 'admin' && (
            <>
              {/* Gestão de Instrumentos */}
              <button 
                onClick={() => navigate('/instrumentos')}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border border-blue-100 hover:border-blue-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-lg">Instrumentos</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Gestão completa de instrumentos
                </p>
              </button>

              {/* Gestão de Usuários */}
              <button 
                onClick={() => navigate('/professores/admin')}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border border-green-100 hover:border-green-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-lg">Usuários</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Alunos, professores e administração
                </p>
              </button>

              {/* Área dos Professores */}
              <button 
                onClick={() => navigate('/professores')}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border border-purple-100 hover:border-purple-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-lg">Área dos Professores</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Dashboard e ferramentas
                </p>
              </button>

              {/* Relatórios */}
              <button 
                onClick={() => navigate('/professores/estatisticas')}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border border-orange-100 hover:border-orange-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-lg">Relatórios</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Estatísticas completas da escola
                </p>
              </button>
            </>
          )}

          {/* Logout Button - Para todos */}
          <button
            onClick={handleLogout}
            className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 border-2 border-gray-200 hover:border-gray-300 hover:-translate-y-1"
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
            🎵 "Se não for divertido, ninguém aprende. Se não for fácil, ninguém começa. Se não for TikTokável, ninguém compartilha."
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Versão Beta • ADNIPO Suzano
            {userType !== 'aluno' && ` • ${userType.charAt(0).toUpperCase() + userType.slice(1)}`}
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

export default Dashboard;