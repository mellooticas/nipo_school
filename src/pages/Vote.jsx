import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  Heart, 
  Users, 
  ArrowRight,
  Vote as VoteIcon,
  Trophy,
  Sparkles,
  Eye
} from 'lucide-react';
import { useAuth } from '../shared/contexts/AuthContext';

const Vote = () => {
  const { userProfile, recordVote } = useAuth();
  const navigate = useNavigate();
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [votes, setVotes] = useState({
    logo1: 42,
    logo2: 38,
    logo3: 35
  });

  // Logos para votação (baseados nas imagens que você mostrou)
  const logos = [
    {
      id: 'logo1',
      name: 'Círculo Zen',
      description: 'Design minimalista com espiral zen, representando o fluxo musical e a harmonia.',
      image: '/api/placeholder/300/300',
      concept: 'Simplicidade e Fluidez',
      colors: ['#E53E3E', '#F5F5F5'],
      style: '🌸 Zen Japonês'
    },
    {
      id: 'logo2', 
      name: 'Nota Musical',
      description: 'Nota musical integrada ao círculo, simbolizando a música como centro da educação.',
      image: '/api/placeholder/300/300',
      concept: 'Música em Foco',
      colors: ['#E53E3E', '#F97316'],
      style: '🎵 Musical Direto'
    },
    {
      id: 'logo3',
      name: 'Origami Musical',
      description: 'Pássaro origami com nota musical, unindo tradição japonesa e música moderna.',
      image: '/api/placeholder/300/300',
      concept: 'Tradição + Inovação',
      colors: ['#E53E3E', '#DC2626'],
      style: '🕊️ Origami Moderno'
    }
  ];

  useEffect(() => {
    // Se usuário já votou, mostrar resultados
    if (userProfile?.has_voted) {
      setShowResults(true);
      setSelectedLogo(userProfile.voted_logo);
    }
  }, [userProfile]);

  // Calcular percentuais
  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
  const getPercentage = (logoId) => {
    const count = votes[logoId] || 0;
    return totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
  };

  // Determinar logo vencedor
  const getWinningLogo = () => {
    const maxVotes = Math.max(...Object.values(votes));
    const winningId = Object.keys(votes).find(id => votes[id] === maxVotes);
    return logos.find(logo => logo.id === winningId);
  };

  const handleVote = async () => {
    if (!selectedLogo || loading) return;

    setLoading(true);
    try {
      await recordVote(selectedLogo);
      
      // Simular atualização dos votos (em produção viria do Supabase)
      setVotes(prev => ({
        ...prev,
        [selectedLogo]: prev[selectedLogo] + 1
      }));
      
      setShowResults(true);
    } catch (error) {
      console.error('Erro ao votar:', error);
      alert('Erro ao registrar voto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const selectedLogoData = logos.find(logo => logo.id === selectedLogo);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-sm border-b border-red-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">鳥</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
              Escolha o Logo da Nipo School
            </h1>
            <p className="text-gray-600 mb-2">
              Sua opinião é fundamental para nossa identidade visual
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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Voting Section */}
        {!showResults ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Qual logo representa melhor a Nipo School?
              </h2>
              <p className="text-gray-600">
                Clique no seu favorito e depois confirme seu voto
              </p>
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

                  {/* Logo Preview */}
                  <div className="w-full h-48 bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">鳥</span>
                    </div>
                  </div>

                  {/* Logo Info */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{logo.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{logo.description}</p>
                    
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500">
                        <strong>Conceito:</strong> {logo.concept}
                      </div>
                      <div className="text-xs text-gray-500">
                        <strong>Estilo:</strong> {logo.style}
                      </div>
                      <div className="flex items-center justify-center space-x-1">
                        {logo.colors.map((color, index) => (
                          <div 
                            key={index}
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vote Button */}
            {selectedLogo && (
              <div className="text-center">
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 max-w-md mx-auto">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Você escolheu: {selectedLogoData?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {selectedLogoData?.description}
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
          </>
        ) : (
          /* Results Section */
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Obrigado pelo seu voto! 🎉
              </h2>
              <p className="text-gray-600 mb-4">
                Você votou no <strong>{selectedLogoData?.name}</strong>
              </p>
              <div className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4 inline mr-1" />
                +50 pontos conquistados!
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
                          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">鳥</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 flex items-center">
                              {logo.name}
                              {isWinning && <Trophy className="w-4 h-4 text-yellow-500 ml-2" />}
                              {isUserChoice && <Heart className="w-4 h-4 text-red-500 ml-2" />}
                            </h4>
                            <p className="text-sm text-gray-600">{logo.style}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-800">{percentage}%</div>
                          <div className="text-sm text-gray-500">{votes[logo.id]} votos</div>
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
              <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <div className="text-center">
                  <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                  <h4 className="text-lg font-bold text-gray-800 mb-2">
                    🏆 Liderando: {getWinningLogo()?.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {getWinningLogo()?.description}
                  </p>
                </div>
              </div>
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
        )}

        {/* Footer Info */}
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
            Um som por vez. Uma geração por vez.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Votação encerra em 31/12/2025 • Resultado será anunciado em janeiro
          </p>
        </footer>
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
    </div>
  );
};

export default Vote;