import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';
import { 
  BookOpen, 
  Plus, 
  BarChart3, 
  User, 
  Grid,
  Home,
  Settings,
  LogOut,
  Bell,
  Search
} from 'lucide-react';
import QuickSwitch from '../../components/professores/QuickSwitch';

const ProfessoresLayout = () => {
  const { user, userProfile, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar se usuário tem permissão
  useEffect(() => {
    if (!loading && (!user || !userProfile)) {
      navigate('/login');
      return;
    }

    if (!loading && userProfile && !['professor', 'pastor', 'admin'].includes(userProfile.tipo_usuario)) {
      navigate('/dashboard');
      return;
    }
  }, [user, userProfile, loading, navigate]);

  // Menu de navegação
  const menuItems = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/professores',
      active: location.pathname === '/professores'
    },
    {
      label: 'Todos os Conteúdos',
      icon: Grid,
      href: '/professores/conteudos',
      active: location.pathname.startsWith('/professores/conteudos')
    },
    {
      label: 'Criar Conteúdo',
      icon: Plus,
      href: '/professores/novo',
      active: location.pathname === '/professores/novo'
    },
    {
      label: 'Minha Área',
      icon: User,
      href: '/professores/minha-area',
      active: location.pathname === '/professores/minha-area'
    },
    {
      label: 'Estatísticas',
      icon: BarChart3,
      href: '/professores/estatisticas',
      active: location.pathname === '/professores/estatisticas'
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Carregando área dos professores...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile || !['professor', 'pastor', 'admin'].includes(userProfile.tipo_usuario)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo e Título */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center hover:opacity-80 transition-opacity group">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">Área dos Professores</h1>
                  <p className="text-sm text-gray-500">Nipo School • Clique para voltar</p>
                </div>
              </Link>
            </div>

            {/* Barra de Busca */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar conteúdos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            {/* Menu do Usuário */}
            <div className="flex items-center space-x-4">
              {/* Quick Switch */}
              <QuickSwitch />

              {/* Notificações */}
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {userProfile.full_name?.charAt(0) || 'P'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{userProfile.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{userProfile.tipo_usuario}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
          <div className="p-4">
            {/* Menu Principal */}
            <div className="space-y-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                      item.active
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className={`mr-3 w-5 h-5 ${
                      item.active ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-gray-200"></div>

            {/* Categorias Rápidas */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Categorias
              </h3>
              <div className="space-y-1">
                {[
                  { name: 'Sacadas', color: 'bg-yellow-100 text-yellow-800', count: 0 },
                  { name: 'Vídeos', color: 'bg-blue-100 text-blue-800', count: 0 },
                  { name: 'Devocionais', color: 'bg-purple-100 text-purple-800', count: 0 },
                  { name: 'Materiais', color: 'bg-red-100 text-red-800', count: 0 }
                ].map((category) => (
                  <Link
                    key={category.name}
                    to={`/professores/categoria/${category.name.toLowerCase()}`}
                    className="flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-700">{category.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                      {category.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Link
                to="/dashboard"
                className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-blue-600 rounded-lg hover:bg-blue-50 transition-colors group"
              >
                <Home className="mr-3 w-5 h-5 text-blue-500" />
                Voltar ao Dashboard
              </Link>

              <button className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors group">
                <Settings className="mr-3 w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                Configurações
              </button>
              
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors group"
              >
                <LogOut className="mr-3 w-5 h-5 text-red-500" />
                Sair
              </button>
            </div>
          </div>
        </nav>

        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Aqui é onde as páginas filhas serão renderizadas */}
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Menu Button - Para implementar depois */}
      <button className="fixed bottom-4 right-4 md:hidden w-12 h-12 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ProfessoresLayout;