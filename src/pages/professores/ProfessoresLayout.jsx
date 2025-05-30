import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';
import { 
  BookOpen, 
  Plus, 
  BarChart3, 
  User, 
  Grid,
  Home,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  RefreshCw,
  ChevronRight,
  Star,
  Eye,
  Download,
  FileText,
  Video,
  Lightbulb,
  Heart
} from 'lucide-react';
import QuickSwitch from '../../components/professores/QuickSwitch';

const ProfessoresLayout = () => {
  const { user, userProfile, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Evita problemas de hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Verificar permissões
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

  // Fechar sidebar no mobile quando navegar
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Menu de navegação - NORMALIZADO
  const menuItems = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/professores',
      active: location.pathname === '/professores',
      color: 'text-green-500',
      emoji: '🏠'
    },
    {
      label: 'Biblioteca',
      icon: Grid,
      href: '/professores/conteudos',
      active: location.pathname.startsWith('/professores/conteudos'),
      color: 'text-blue-500',
      emoji: '📚'
    },
    {
      label: 'Criar Conteúdo',
      icon: Plus,
      href: '/professores/novo',
      active: location.pathname === '/professores/novo',
      color: 'text-purple-500',
      emoji: '✨'
    },
    {
      label: 'Minha Área',
      icon: User,
      href: '/professores/minha-area',
      active: location.pathname === '/professores/minha-area',
      color: 'text-orange-500',
      emoji: '👤'
    },
    {
      label: 'Estatísticas',
      icon: BarChart3,
      href: '/professores/estatisticas',
      active: location.pathname === '/professores/estatisticas',
      color: 'text-red-500',
      emoji: '📊'
    }
  ];

  // Categorias rápidas - MELHORADAS
  const categorias = [
    { name: 'Sacadas', emoji: '💡', count: 0, color: 'bg-yellow-100 text-yellow-800 border-yellow-200', href: '/professores/tipo/sacada' },
    { name: 'Vídeos', emoji: '🎥', count: 0, color: 'bg-blue-100 text-blue-800 border-blue-200', href: '/professores/tipo/video' },
    { name: 'Devocionais', emoji: '❤️', count: 0, color: 'bg-purple-100 text-purple-800 border-purple-200', href: '/professores/tipo/devocional' },
    { name: 'Materiais', emoji: '📄', count: 0, color: 'bg-red-100 text-red-800 border-red-200', href: '/professores/tipo/material' }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/professores/conteudos?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
            <span className="text-white text-2xl">👨‍🏫</span>
          </div>
          <p className="text-gray-600">Carregando Área dos Professores...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        {/* Navigation Loading */}
        <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-red-100 sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-md">
                <span className="text-white text-sm sm:text-lg font-bold">鳥</span>
              </div>
              <div>
                <span className="font-bold text-gray-800 text-base sm:text-lg">Nipo School</span>
                <p className="text-xs text-red-500 font-medium hidden sm:block">#ProfessoresOn</p>
              </div>
            </div>
            <RefreshCw className="w-4 h-4 text-red-500 animate-spin" />
          </div>
        </nav>

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Carregando área dos professores...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !userProfile || !['professor', 'pastor', 'admin'].includes(userProfile.tipo_usuario)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      
      {/* Navigation Header - PADRÃO NIPO */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-red-100 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          
          {/* Logo + Mobile Menu */}
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-md">
                <span className="text-white text-sm sm:text-lg font-bold">鳥</span>
              </div>
              <div>
                <span className="font-bold text-gray-800 text-base sm:text-lg group-hover:text-red-600 transition-colors">Nipo School</span>
                <p className="text-xs text-red-500 font-medium hidden sm:block">#ProfessoresOn</p>
              </div>
            </Link>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar conteúdos..."
                className="w-full pl-10 pr-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm"
              />
            </form>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Quick Switch */}
            <div className="hidden sm:block">
              <QuickSwitch />
            </div>

            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* Profile Badge */}
            <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-blue-50 px-3 py-2 rounded-full border border-green-200">
              <span className="text-green-500 font-bold text-sm">👨‍🏫</span>
              <span className="text-green-600 font-bold text-xs sm:text-sm hidden sm:inline">Professor</span>
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
              {userProfile?.avatar_url ? (
                <img 
                  src={userProfile.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-xs sm:text-sm font-bold">
                  {userProfile?.full_name?.charAt(0) || 'P'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar conteúdos..."
              className="w-full pl-10 pr-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm"
            />
          </form>
        </div>
      </nav>


      <div className="flex relative">
        
        {/* Sidebar - RESPONSIVA */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static
          fixed inset-y-0 left-0 z-40
          w-80 bg-white/90 backdrop-blur-md shadow-xl border-r border-red-100
          transition-transform duration-300 ease-in-out
          overflow-y-auto
        `}>
          
          {/* Sidebar Header */}
          <div className="p-6 border-b border-red-100">
            <div className="flex items-center justify-between lg:justify-center">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="text-2xl mr-2">📚</span>
                Área dos Professores
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-6">
            
            {/* Menu Principal */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                Navegação
              </h3>
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                        item.active
                          ? 'bg-gradient-to-r from-red-50 to-orange-50 text-red-700 border border-red-200 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-lg mr-3">{item.emoji}</span>
                      <span className="flex-1">{item.label}</span>
                      {item.active && (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Categorias Rápidas */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                Categorias
              </h3>
              <div className="space-y-2">
                {categorias.map((categoria) => (
                  <Link
                    key={categoria.name}
                    to={categoria.href}
                    className="flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{categoria.emoji}</span>
                      <span className="text-gray-700 group-hover:text-gray-900">{categoria.name}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${categoria.color}`}>
                      {categoria.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Ações Rápidas */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                Ações
              </h3>
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-blue-600 rounded-lg hover:bg-blue-50 transition-colors group"
                >
                  <Home className="mr-3 w-4 h-4 text-blue-500" />
                  Dashboard Principal
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                {userProfile?.tipo_usuario === 'admin' && (
                  <Link
                    to="/professores/admin"
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-purple-600 rounded-lg hover:bg-purple-50 transition-colors group border border-purple-200"
                  >
                    <span className="mr-3 text-lg">🎓</span>
                    Painel Admin
                    <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors group"
                >
                  <LogOut className="mr-3 w-4 h-4 text-red-500" />
                  Sair da Conta
                </button>
              </div>
            </div>

            {/* User Info Card */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-bold">
                    {userProfile?.full_name?.charAt(0) || 'P'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userProfile?.full_name || 'Professor'}
                  </p>
                  <p className="text-xs text-gray-600 capitalize">
                    {userProfile?.tipo_usuario}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Action Button */}
      <Link
        to="/professores/novo"
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 hover:scale-105 z-40"
      >
        <Plus className="w-6 h-6" />
      </Link>

      {/* Floating Elements - EDUCACIONAIS */}
      <div className="fixed top-1/4 left-4 text-green-200 text-2xl animate-bounce opacity-20 pointer-events-none">
        📚
      </div>
      <div className="fixed top-1/3 right-8 text-green-200 text-xl animate-bounce opacity-20 pointer-events-none" style={{animationDelay: '1s'}}>
        ✨
      </div>
      <div className="fixed bottom-1/3 left-8 text-green-200 text-lg animate-bounce opacity-20 pointer-events-none" style={{animationDelay: '2s'}}>
        🎓
      </div>
      <div className="fixed bottom-1/4 right-4 text-green-200 text-xl animate-bounce opacity-20 pointer-events-none" style={{animationDelay: '0.5s'}}>
        💡
      </div>
    </div>
  );
};

export default ProfessoresLayout;