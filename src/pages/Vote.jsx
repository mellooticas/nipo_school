import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Check, 
  Heart, 
  Users, 
  ArrowRight,
  Vote as VoteIcon,
  Trophy,
  Sparkles,
  Eye,
  LogOut,
  User,
  SkipForward,
  ChevronDown,
  Settings
} from 'lucide-react';
import { useAuth } from '../shared/contexts/AuthContext';
import { supabase } from '../shared/lib/supabase/supabaseClient';

const Vote = () => {
  const { user, userProfile, recordVote, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [logos, setLogos] = useState([]);
  const [votes, setVotes] = useState({});
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Verificar se foi forçado a mostrar (vindo do dashboard)
  const urlParams = new URLSearchParams(location.search);
  const forceShow = urlParams.get('from') === 'dashboard';

  // Carrega logos e votos do Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar logos ativos
        const { data: logosData, error: logosError } = await supabase
          .from('logos')
          .select('*')
          .eq('ativo', true);

        // Buscar votos da view
        const { data: votosData, error: votosError } = await supabase
          .from('view_placar_logos')
          .select('*');

        if (logosError) throw logosError;
        if (votosError) throw votosError;

        setLogos(logosData || []);

        // Mapear votos por ID
        const votosMap = {};
        if (votosData) {
          votosData.forEach(v => {
            votosMap[v.id] = v.votos;
          });
        }
        setVotes(votosMap);

        // Se usuário já votou E não foi forçado a vir aqui, mostrar resultados
        if (userProfile?.voted_logo && !forceShow) {
          setShowResults(true);
          setSelectedLogo(userProfile.voted_logo);
        } else if (userProfile?.voted_logo) {
          // Se foi forçado (veio do dashboard), apenas definir o logo mas permitir nova votação
          setSelectedLogo(userProfile.voted_logo);
        }

      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    };

    if (userProfile) {
      fetchData();
    }
  }, [userProfile, forceShow]);

  // Calcular percentuais
  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
  const getPercentage = (logoId) => {
    const count = votes[logoId] || 0;
    return totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
  };

  // Determinar logo vencedor
  const getWinningLogo = () => {
    if (Object.keys(votes).length === 0) return null;
    const maxVotes = Math.max(...Object.values(votes));
    const winningId = Object.keys(votes).find(id => votes[id] === maxVotes);
    return logos.find(logo => logo.id === winningId);
  };

  const handleVote = async () => {
    if (!selectedLogo || loading) return;

    setLoading(true);
    try {
      await recordVote(selectedLogo);
      
      // Atualiza voto localmente
      setVotes(prev => ({
        ...prev,
        [selectedLogo]: (prev[selectedLogo] || 0) + 1
      }));
      
      setShowResults(true);
    } catch (error) {
      console.error('Erro ao votar:', error);
      alert('Erro ao registrar voto. Tente novamente.');
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

  const handleSkipVoting = () => {
    if (window.confirm('Você tem certeza que quer pular a votação? Você poderá votar depois.')) {
      navigate('/dashboard');
    }
  };

  // Função para alternar entre votação e resultados
  const toggleView = () => {
    setShowResults(!showResults);
  };

  const selectedLogoData = logos.find(logo => logo.id === selectedLogo);

  // Loading state
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil do usuário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-sm border-b border-red-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          {/* User Info Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                {userProfile?.avatar_url ? (
                  <img 
                    src={userProfile.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">
                  {userProfile?.full_name || user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-600" />
                <ChevronDown className="w-3 h-3 text-gray-600" />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>Ir para Dashboard</span>
                    </button>
                    
                    {/* Novo botão para alternar visualização */}
                    <button
                      onClick={toggleView}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{showResults ? 'Ver Opções de Voto' : 'Ver Resultados'}</span>
                    </button>

                    <button
                      onClick={handleSkipVoting}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                    >
                      <SkipForward className="w-4 h-4" />
                      <span>Pular Votação</span>
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">鳥</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
              {showResults ? 'Resultados da Votação' : 'Escolha o Logo da Nipo School'}
            </h1>
            <p className="text-gray-600 mb-2">
              {showResults 
                ? 'Veja como está a disputa em tempo real'
                : 'Sua opinião é fundamental para nossa identidade visual'
              }
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {totalVotes} votos
              </div>
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-1 text-red-500" />
                Comunidade ativa
              </div>
              {userProfile?.has_voted && (
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-1 text-green-500" />
                  Você já votou
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Voting Section */}
        {!showResults && logos.length > 0 ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Qual logo representa melhor a Nipo School?
              </h2>
              <p className="text-gray-600 mb-4">
                {userProfile?.has_voted 
                  ? 'Você já votou, mas pode visualizar as opções novamente'
                  : 'Clique no seu favorito e depois confirme seu voto'
                }
              </p>
              
              {/* Skip Option - apenas se não votou */}
              {!userProfile?.has_voted && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-orange-700 text-sm mb-2">
                    <strong>Não quer votar agora?</strong>
                  </p>
                  <p className="text-orange-600 text-xs mb-3">
                    Você pode pular e votar depois no dashboard
                  </p>
                  <button
                    onClick={handleSkipVoting}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm flex items-center space-x-2 mx-auto"
                  >
                    <SkipForward className="w-4 h-4" />
                    <span>Pular por Agora</span>
                  </button>
                </div>
              )}
            </div>

            {/* Logo Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {logos.map((logo) => (
                <div
                  key={logo.id}
                  onClick={() => setSelectedLogo(logo.id)}
                  className={`relative bg-white rounded-2xl shadow-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                    selectedLogo === logo.id 
                      ? 'ring-4 ring-red-500 bg-red-50 transform -translate-y-2 shadow-xl' 
                      : 'hover:ring-2 hover:ring-red-300'
                  }`}
                >
                  {/* Selection Check */}
                  {selectedLogo === logo.id && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}

                  {/* User's previous choice indicator */}
                  {userProfile?.voted_logo === logo.id && (
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                  )}

                  {/* Logo Preview */}
                  <div className="w-full h-48 bg-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    <img 
                      src={logo.url} 
                      alt={logo.nome} 
                      className="max-h-40 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center"
                      style={{ display: 'none' }}
                    >
                      <span className="text-white text-4xl font-bold">鳥</span>
                    </div>
                  </div>

                  {/* Logo Info */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {logo.nome}
                      {userProfile?.voted_logo === logo.id && (
                        <span className="ml-2 text-sm text-green-600">✓ Seu voto</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{logo.descricao}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Vote Button */}
            {selectedLogo && !userProfile?.has_voted && (
              <div className="text-center">
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 max-w-md mx-auto">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Você escolheu: {selectedLogoData?.nome}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {selectedLogoData?.descricao}
                  </p>
                  <button
                    onClick={handleVote}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-xl hover:from-red-600 hover:to-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Registrando Voto...
                      </>
                    ) : (
                      <>
                        <VoteIcon className="w-5 h-5 mr-2" />
                        Confirmar Meu Voto
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Message for users who already voted */}
            {userProfile?.has_voted && (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 max-w-md mx-auto">
                  <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-green-800 mb-2">
                    Obrigado pelo seu voto!
                  </h3>
                  <p className="text-sm text-green-600 mb-4">
                    Você já participou da votação. Clique abaixo para ver os resultados.
                  </p>
                  <button
                    onClick={() => setShowResults(true)}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    Ver Resultados
                  </button>
                </div>
              </div>
            )}
          </>
        ) : showResults && logos.length > 0 ? (
          /* Results Section */
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Resultados em Tempo Real! 🎉
              </h2>
              {userProfile?.has_voted && (
                <p className="text-gray-600 mb-4">
                  Você votou no <strong>{selectedLogoData?.nome}</strong>
                </p>
              )}
              <div className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4 inline mr-1" />
                Total de {totalVotes} votos!
              </div>
            </div>

            {/* Current Results */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center justify-center mb-6">
                <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
                <h3 className="text-2xl font-bold text-gray-800">Resultados em Tempo Real</h3>
              </div>

              <div className="space-y-6">
                {logos.map((logo) => {
                  const percentage = getPercentage(logo.id);
                  const isWinning = getWinningLogo()?.id === logo.id;
                  const isUserChoice = selectedLogo === logo.id;
                  
                  return (
                    <div key={logo.id} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <img src={logo.url} alt="" className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <h4 className="font-bold text-gray-800 flex items-center">
                              {logo.nome}
                              {isWinning && <Trophy className="w-4 h-4 text-yellow-500 ml-2" />}
                              {isUserChoice && <Heart className="w-4 h-4 text-red-500 ml-2" />}
                            </h4>
                            <p className="text-sm text-gray-600">{logo.descricao}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-800">{percentage}%</div>
                          <div className="text-sm text-gray-500">{votes[logo.id] || 0} votos</div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 ${
                            isWinning 
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                              : isUserChoice 
                                ? 'bg-gradient-to-r from-red-500 to-pink-500'
                                : 'bg-gradient-to-r from-gray-400 to-gray-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      
                      {isUserChoice && (
                        <div className="text-xs text-red-600 font-medium">
                          ❤️ Seu voto
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Winner Announcement */}
              {getWinningLogo() && (
                <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <div className="text-center">
                    <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                    <h4 className="text-lg font-bold text-gray-800 mb-2">
                      🏆 Liderando: {getWinningLogo()?.nome}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {getWinningLogo()?.descricao}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 text-center hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <ArrowRight className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-lg">Ir para Dashboard</h3>
                <p className="text-gray-600 text-sm">
                  Comece sua jornada musical agora
                </p>
              </button>

              <button
                onClick={() => setShowResults(false)}
                className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 text-center hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-lg">Ver Opções Novamente</h3>
                <p className="text-gray-600 text-sm">
                  Revisar os logos candidatos
                </p>
              </button>
            </div>
          </>
        ) : (
          /* Loading or No Data */
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando opções de logos...</p>
          </div>
        )}

        {/* Footer Info */}
        {logos.length > 0 && (
          <>
            <div className="mt-12 text-center">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto">
                <h4 className="font-bold text-gray-800 mb-3">Por que sua escolha importa?</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-gray-600">
                      <strong>Identidade</strong><br />
                      Representa nossa comunidade
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-gray-600">
                      <strong>União</strong><br />
                      Escolha coletiva da família Nipo
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-gray-600">
                      <strong>Futuro</strong><br />
                      Marca nossa história juntos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="text-center mt-12 py-8 border-t border-red-200">
              <p className="text-gray-600 font-medium mb-1">
                Nipo School App &copy; 2025
              </p>
              <p className="text-red-500 text-sm font-bold">
                🎵 "Se não for divertido, ninguém aprende. Se não for fácil, ninguém começa. Se não for TikTokável, ninguém compartilha."
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Votação encerra em 31/12/2025 • Resultado será anunciado em janeiro
              </p>
            </footer>
          </>
        )}
      </div>

      {/* Floating Elements */}
      <div className="fixed top-20 left-8 text-red-200 text-3xl animate-bounce opacity-20 pointer-events-none">
        🗳️
      </div>
      <div className="fixed bottom-20 right-8 text-red-200 text-2xl animate-bounce opacity-20 pointer-events-none" style={{animationDelay: '1s'}}>
        🏆
      </div>
      <div className="fixed top-1/2 left-4 text-red-200 text-xl animate-bounce opacity-20 pointer-events-none" style={{animationDelay: '2s'}}>
        ❤️
      </div>

      {/* Click outside to close menu */} 
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </div>
  );
};

export default Vote;