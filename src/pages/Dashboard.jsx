import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/contexts/AuthContext';

const Dashboard = () => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🎵</span>
            </div>
          </div>
          <p className="mt-4 text-gray-600">Carregando Nipo School...</p>
        </div>
      </div>
    );
  }

  // Se não tem usuário, o ProtectedRoute vai redirecionar
  if (!user || !userProfile) {
    return null;
  }

  // Dashboard específico baseado no tipo de usuário
  const getDashboardInfo = () => {
    switch (userProfile.tipo_usuario) {
      case 'admin':
        return {
          title: '🔴 Área Administrativa',
          subtitle: 'Dashboard do Administrador',
          description: 'Gerencie usuários, conteúdos e configurações do sistema.',
          actions: [
            { label: 'Painel Admin', path: '/admin', color: 'bg-red-600 hover:bg-red-700' },
            { label: 'Professores', path: '/admin/professores', color: 'bg-blue-600 hover:bg-blue-700' },
            { label: 'Alunos', path: '/admin/alunos', color: 'bg-green-600 hover:bg-green-700' }
          ]
        };
      
      case 'professor':
      case 'pastor':
        return {
          title: '🟡 Área dos Educadores',
          subtitle: 'Dashboard do Professor',
          description: 'Crie conteúdos, acompanhe alunos e gerencie suas aulas.',
          actions: [
            { label: 'Área Professor', path: '/professores', color: 'bg-green-600 hover:bg-green-700' },
            { label: 'Meus Conteúdos', path: '/professores/conteudos', color: 'bg-blue-600 hover:bg-blue-700' },
            { label: 'Estatísticas', path: '/professores/estatisticas', color: 'bg-purple-600 hover:bg-purple-700' }
          ]
        };
      
      case 'aluno':
      default:
        return {
          title: '🔵 Área do Aluno',
          subtitle: 'Dashboard do Estudante',
          description: 'Explore instrumentos, faça módulos e acompanhe seu progresso.',
          actions: [
            { label: 'Meus Estudos', path: '/alunos', color: 'bg-blue-600 hover:bg-blue-700' },
            { label: 'Instrumentos', path: '/instrumentos', color: 'bg-green-600 hover:bg-green-700' },
            { label: 'Módulos', path: '/modulos', color: 'bg-purple-600 hover:bg-purple-700' }
          ]
        };
    }
  };

  const dashboardInfo = getDashboardInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <span className="text-white text-4xl font-bold">鳥</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Nipo School
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Bem-vindo, {userProfile.full_name || user.email}!
          </p>
          <div className="inline-block bg-white px-4 py-2 rounded-full shadow-sm border">
            <span className="text-sm font-medium text-gray-700">
              {dashboardInfo.title}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          
          {/* Dashboard Info */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {dashboardInfo.subtitle}
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              {dashboardInfo.description}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {dashboardInfo.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className={`${action.color} text-white py-4 px-6 rounded-xl transition-all duration-200 font-medium hover:transform hover:scale-105 shadow-md`}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-xl text-center">
              <div className="text-3xl mb-2">🎸</div>
              <div className="text-sm font-medium text-blue-700">Instrumentos</div>
              <div className="text-xl font-bold text-blue-900">23+</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-xl text-center">
              <div className="text-3xl mb-2">📚</div>
              <div className="text-sm font-medium text-green-700">Módulos</div>
              <div className="text-xl font-bold text-green-900">50+</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-xl text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-sm font-medium text-purple-700">Conquistas</div>
              <div className="text-xl font-bold text-purple-900">{userProfile.total_points || 0}</div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-xl text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-sm font-medium text-orange-700">Streak</div>
              <div className="text-xl font-bold text-orange-900">{userProfile.current_streak || 0}</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/instrumentos')}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl mb-2">🎵</span>
                <span className="text-sm font-medium text-gray-700">Instrumentos</span>
              </button>
              
              <button
                onClick={() => navigate('/modulos')}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl mb-2">📖</span>
                <span className="text-sm font-medium text-gray-700">Módulos</span>
              </button>
              
              <button
                onClick={() => navigate('/conquistas')}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl mb-2">🏅</span>
                <span className="text-sm font-medium text-gray-700">Conquistas</span>
              </button>
              
              <button
                onClick={() => navigate('/perfil')}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl mb-2">👤</span>
                <span className="text-sm font-medium text-gray-700">Perfil</span>
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja sair?')) {
                  // O logout será implementado no AuthContext
                  window.location.href = '/login';
                }
              }}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Sair da conta
            </button>
          </div>
        </div>

        {/* Debug info apenas em desenvolvimento */}
        {(typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
            <h4 className="font-bold mb-2">🐛 Debug Info:</h4>
            <div className="space-y-1">
              <div>User: {user ? user.email : 'None'}</div>
              <div>Profile: {userProfile ? userProfile.tipo_usuario : 'None'}</div>
              <div>Full Name: {userProfile?.full_name || 'Not set'}</div>
              <div>Has Voted: {userProfile?.has_voted ? 'Yes' : 'No'}</div>
              <div>Current Path: {window.location.pathname}</div>
              <div>Loading: {loading ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;