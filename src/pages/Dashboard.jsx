import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/contexts/AuthContext';
import { getDefaultDashboard } from '../shared/services/redirectService';

const Dashboard = () => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [dashboardState, setDashboardState] = useState({
    status: 'analyzing',
    message: 'Analisando seu perfil...'
  });

  useEffect(() => {
    const analyzeDashboard = async () => {
      // Aguardar carregamento
      if (loading) {
        setDashboardState({
          status: 'analyzing',
          message: 'Carregando dados do usuário...'
        });
        return;
      }

      // Verificar usuário
      if (!user) {
        setDashboardState({
          status: 'redirecting',
          message: 'Redirecionando para login...'
        });
        
        setTimeout(() => navigate('/login', { replace: true }), 1000);
        return;
      }

      // Aguardar perfil
      if (!userProfile) {
        setDashboardState({
          status: 'analyzing',
          message: 'Carregando perfil...'
        });
        return;
      }

      // Determinar redirecionamento
      const userName = userProfile.full_name || user.email;
      setDashboardState({
        status: 'analyzing',
        message: `Bem-vindo, ${userName}!`
      });

      let targetRoute = '/dashboard';

      // Regra 1: Votação obrigatória
      if (!userProfile.has_voted) {
        targetRoute = '/vote';
        setDashboardState(prev => ({
          ...prev,
          status: 'redirecting',
          message: 'Você precisa votar no logo primeiro'
        }));
      } else {
        // Regra 2: Dashboard específico por tipo
        targetRoute = getDefaultDashboard(userProfile.tipo_usuario);
        setDashboardState(prev => ({
          ...prev,
          status: 'redirecting',
          message: `Redirecionando para área ${userProfile.tipo_usuario}`
        }));
      }

      // Se já está na rota certa, mostrar boas-vindas
      if (window.location.pathname === targetRoute) {
        setDashboardState(prev => ({
          ...prev,
          status: 'welcome',
          message: `Bem-vindo à sua área!`
        }));
        return;
      }

      // Redirecionar
      setTimeout(() => {
        navigate(targetRoute, { replace: true });
      }, 1500);
    };

    analyzeDashboard();
  }, [user, userProfile, loading, navigate]);

  const handleRetry = () => window.location.reload();

  // Loading Component
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">🎵</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {dashboardState.message}
        </h3>
      </div>
    </div>
  );

  // Welcome Component
  const WelcomeMessage = () => (
    <div className="text-center">
      <div className="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center mb-6">
        <span className="text-3xl">👋</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {dashboardState.message}
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl mb-2">🎸</div>
            <div className="text-sm font-medium">Instrumentos</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl mb-2">📚</div>
            <div className="text-sm font-medium">Módulos</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl mb-2">🏆</div>
            <div className="text-sm font-medium">Conquistas</div>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={() => navigate('/instrumentos')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Instrumentos
          </button>
          <button
            onClick={() => navigate('/perfil')}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Meu Perfil
          </button>
        </div>
      </div>
    </div>
  );

  // Error Component
  const ErrorMessage = () => (
    <div className="text-center">
      <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-3xl">⚠️</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Ops! Algo deu errado
      </h2>
      <p className="text-gray-600 mb-6">
        {dashboardState.message}
      </p>
      <div className="space-x-4">
        <button
          onClick={handleRetry}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tentar Novamente
        </button>
        <button
          onClick={() => navigate('/login')}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Fazer Login
        </button>
      </div>
    </div>
  );

  // Render baseado no status
  const renderContent = () => {
    switch (dashboardState.status) {
      case 'analyzing':
      case 'redirecting':
        return <LoadingSpinner />;
      case 'welcome':
        return <WelcomeMessage />;
      case 'error':
        return <ErrorMessage />;
      default:
        return <LoadingSpinner />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto p-8">
        {renderContent()}
        
        {/* Debug info apenas em desenvolvimento */}
        {(typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
            <h4 className="font-bold mb-2">🐛 Debug Info:</h4>
            <div className="space-y-1">
              <div>Status: {dashboardState.status}</div>
              <div>User: {user ? user.email : 'None'}</div>
              <div>Profile: {userProfile ? userProfile.tipo_usuario : 'None'}</div>
              <div>Has Voted: {userProfile?.has_voted ? 'Yes' : 'No'}</div>
              <div>Loading: {loading ? 'Yes' : 'No'}</div>
              <div>Current Path: {window.location.pathname}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;