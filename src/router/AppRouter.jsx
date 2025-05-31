import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../shared/contexts/AuthContext';

// Import das páginas existentes
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ConfirmEmail from '../pages/ConfirmEmail';
import Vote from '../pages/Vote';

// 🎯 Import das páginas dos professores - MÓDULO COMPLETO
import ProfessoresLayout from '../pages/professores/ProfessoresLayout';
import ProfessoresDashboard from '../pages/professores/ProfessoresDashboard';
import ProfessoresConteudos from '../pages/professores/ProfessoresConteudos';
import ProfessoresMinhaArea from '../pages/professores/ProfessoresMinhaArea';
import ProfessoresEstatisticas from '../pages/professores/ProfessoresEstatisticas';
import ProfessoresAdminPanel from '../pages/professores/ProfessoresAdminPanel';
import ConteudoDetalhes from '../pages/professores/ConteudoDetalhes';
import FormConteudo from '../components/professores/FormConteudo';

// 🎵 Import das páginas de instrumentos - NOVO MÓDULO
import InstrumentosLayout from '../pages/instrumentos/InstrumentosLayout';
import InstrumentosList from '../pages/instrumentos/InstrumentosList';
import InstrumentoPagina from '../pages/instrumentos/InstrumentoPagina';

// 📋 Import das páginas do Kanban Admin - NOVO MÓDULO
import Kanban from '../pages/professores/admin/Kanban';
import AulaDetail from '../pages/professores/admin/aulas/AulaDetail';

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

// 🎯 Componente de Proteção para Professores - ATUALIZADO
const ProfessorRoute = ({ children }) => {
  const { user, userProfile, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar se é professor, pastor ou admin
  if (!userProfile || !['professor', 'pastor', 'admin'].includes(userProfile.tipo_usuario)) {
    return <Navigate to="/dashboard" replace />;
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

      {/* ==========================================
          🎵 ÁREA DOS INSTRUMENTOS - NOVO MÓDULO
          ========================================== */}
      <Route 
        path="/instrumentos" 
        element={
          <ProtectedRoute>
            <InstrumentosLayout />
          </ProtectedRoute>
        }
      >
        {/* Lista de todos os instrumentos */}
        <Route index element={<InstrumentosList />} />
        
        {/* Página específica do instrumento */}
        <Route path=":instrumentoId" element={<InstrumentoPagina />} />
        
        {/* Filtros por categoria (futuro) */}
        <Route path="categoria/:categoria" element={<InstrumentosList />} />
      </Route>

      {/* ==========================================
          🎯 ÁREA DOS PROFESSORES - MÓDULO COMPLETO
          ========================================== */}
      <Route 
        path="/professores" 
        element={
          <ProfessorRoute>
            <ProfessoresLayout />
          </ProfessorRoute>
        }
      >
        {/* Dashboard dos professores */}
        <Route index element={<ProfessoresDashboard />} />
        
        {/* Lista de todos os conteúdos */}
        <Route path="conteudos" element={<ProfessoresConteudos />} />
        
        {/* Visualizar conteúdo específico */}
        <Route path="conteudos/:id" element={<ConteudoDetalhes />} />
        
        {/* Criar novo conteúdo */}
        <Route path="novo" element={<FormConteudo />} />
        
        {/* Editar conteúdo específico */}
        <Route path="editar/:id" element={<FormConteudo />} />
        
        {/* Área pessoal do professor */}
        <Route path="minha-area" element={<ProfessoresMinhaArea />} />
        
        {/* Painel Administrativo (apenas para admins) */}
        <Route path="admin" element={<ProfessoresAdminPanel />} />
        
        {/* 📋 KANBAN ADMIN - ROTAS INTEGRADAS */}
        <Route path="admin/kanban" element={<Kanban />} />
        <Route path="admin/aulas/:id" element={<AulaDetail />} />
        
        {/* Estatísticas e analytics */}
        <Route path="estatisticas" element={<ProfessoresEstatisticas />} />
        
        {/* Filtros por categoria */}
        <Route path="categoria/:categoriaId" element={<ProfessoresConteudos />} />
        
        {/* Filtros por tipo */}
        <Route path="tipo/:tipo" element={<ProfessoresConteudos />} />
      </Route>

      {/* Outras rotas protegidas existentes */}
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