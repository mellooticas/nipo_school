import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../shared/contexts/AuthContext';

// Import das páginas
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ConfirmEmail from '../pages/ConfirmEmail';
import Vote from '../pages/Vote';

// Componente de Loading
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
        <span className="text-white text-2xl">🎵</span>
      </div>
      <p className="text-gray-600">Carregando Nipo School...</p>
    </div>
  </div>
);

// Componente de Proteção de Rota
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Componente de Rota Pública (redireciona se logado)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppRouter = () => {
  return (
    <Routes>
      {/* Rota raiz - redireciona baseado no auth */}
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />
      
      {/* Rotas públicas (só acessíveis se não logado) */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      
      {/* Rotas protegidas (só acessíveis se logado) */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/vote" 
        element={
          <ProtectedRoute>
            <Vote />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/confirmacao" 
        element={
          <PublicRoute>
            <ConfirmEmail />
          </PublicRoute>
        }
      />

      
      {/* Futuras rotas protegidas */}
      <Route 
        path="/modulos" 
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">📚 Módulos</h1>
                <p className="text-gray-600">Em desenvolvimento...</p>
              </div>
            </div>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/conquistas" 
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">🏆 Conquistas</h1>
                <p className="text-gray-600">Em desenvolvimento...</p>
              </div>
            </div>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/devocional" 
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">📖 Devocional</h1>
                <p className="text-gray-600">Em desenvolvimento...</p>
              </div>
            </div>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/perfil" 
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">👤 Perfil</h1>
                <p className="text-gray-600">Em desenvolvimento...</p>
              </div>
            </div>
          </ProtectedRoute>
        } 
      />
      
      {/* Rota 404 */}
      <Route 
        path="*" 
        element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-gray-600 mb-4">Página não encontrada</p>
              <button 
                onClick={() => window.history.back()}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Voltar
              </button>
            </div>
          </div>
        } 
      />
    </Routes>
  );
};

export default AppRouter;

