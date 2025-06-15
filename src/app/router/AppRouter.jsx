import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';
import { hasRoutePermission } from '../../shared/services/redirectService';

// Import das páginas existentes
import Dashboard from '../../pages/Dashboard';
import Login from '../../features/auth/pages/Login';
import Register from '../../features/auth/pages/Register'; 
import VerifyEmail from '../../features/auth/pages/VerifyEmail';
import Vote from '../../features/auth/pages/Vote';

// Import das páginas dos alunos
import AlunoDashboardPage from '../../features/alunos/pages/AlunoDashboard';
import MeuInstrumento from '../../features/alunos/pages/MeuInstrumento'; // 🚀 NOVO

// Import das páginas dos professores - MÓDULO COMPLETO
import ProfessoresLayout from '../../features/professores/pages/ProfessoresLayout';
import ProfessoresDashboard from '../../features/professores/pages/ProfessoresDashboard';
import ProfessoresConteudos from '../../features/professores/pages/ProfessoresConteudos';
import ProfessoresMinhaArea from '../../features/professores/pages/ProfessoresMinhaArea';
import ProfessoresEstatisticas from '../../features/professores/pages/ProfessoresEstatisticas';
import ConteudoDetalhes from '../../features/professores/pages/ConteudoDetalhes';
import FormConteudo from '../../features/professores/components/FormConteudo';

// Import das páginas de instrumentos
import InstrumentosLayout from '../../features/instrumentos/pages/InstrumentosLayout';
import InstrumentosList from '../../features/instrumentos/pages/InstrumentosList';
import InstrumentoPagina from '../../features/instrumentos/pages/InstrumentoPagina';

// Import das páginas ADMINISTRATIVAS - ✅ ATUALIZADAS
import AdminDashboard from '../../features/admin/pages/AdminDashboard';
import AdminInstruments from '../../features/admin/pages/AdminInstruments';
import AdminInstrumentDetails from '../../features/admin/pages/AdminInstrumentDetails';
import Kanban from '../../features/admin/pages/Kanban';
import AulaDetail from '../../features/admin/pages/AulaDetail';
import AdminProfessores from '../../features/admin/pages/AdminProfessores';
import AdminAlunos from '../../features/admin/pages/AdminAlunos';
import AdminTeste from '../../features/admin/pages/AdminTeste';
import AdminRelatorios from '../../features/admin/pages/AdminRelatorios';
import AdminConfiguracoes from '../../features/admin/pages/AdminConfiguracoes';

// 🚀 IMPORTS DO SISTEMA QR CODE
import { QRCodeManager } from '../../features/admin/pages/QRCodeManager';
import { QRDisplay } from '../../features/admin/pages/QRDisplay';
import { QRScannerPage } from '../../features/alunos/pages/QRScannerPage';
import { QRScanner } from '../../features/alunos/components/QRScanner';

// ========================================
// COMPONENTES DE LOADING E PROTEÇÃO
// ========================================

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

// Componente de Proteção de Rota Básica
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// 🎯 Componente de Proteção por Permissão - UNIVERSAL
const PermissionRoute = ({ children, requiredRoute = null }) => {
  const { user, userProfile, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se não especificou rota específica, apenas verificar auth
  if (!requiredRoute) return children;

  // Verificar permissão específica
  if (!hasRoutePermission(userProfile, requiredRoute)) {
    // Redirecionar para dashboard apropriado baseado no tipo de usuário
    const redirectMap = {
      admin: '/dashboard',
      professor: '/professores', 
      pastor: '/professores',
      aluno: '/dashboard'
    };
    
    const targetPath = redirectMap[userProfile?.tipo_usuario] || '/dashboard';
    
    console.log('🚫 Acesso negado:', {
      user: userProfile?.tipo_usuario,
      requestedRoute: requiredRoute,
      redirectingTo: targetPath
    });
    
    return <Navigate to={targetPath} replace />;
  }
  
  return children;
};

// 🔴 Componente específico para Admin
const AdminRoute = ({ children }) => {
  const { userProfile } = useAuth();
  
  return (
    <PermissionRoute requiredRoute="/admin">
      <div className="admin-wrapper">
        {/* Cabeçalho indicando área admin */}
        <div className="bg-red-600 text-white px-4 py-2 text-sm font-medium">
          🔴 ÁREA ADMINISTRATIVA - {userProfile?.full_name}
        </div>
        {children}
      </div>
    </PermissionRoute>
  );
};

// 🟡 Componente específico para Educadores (Professor/Pastor/Admin)
const EducatorRoute = ({ children }) => {
  return (
    <PermissionRoute requiredRoute="/professores">
      {children}
    </PermissionRoute>
  );
};

// Componente de Rota Pública (redireciona se logado)
const PublicRoute = ({ children }) => {
  const { user, userProfile, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  
  if (user && userProfile) {
    // Redirecionar para dashboard específico do tipo de usuário
    const dashboardMap = {
      admin: '/dashboard',
      professor: '/professores',
      pastor: '/professores', 
      aluno: '/dashboard'
    };
    
    const targetDashboard = dashboardMap[userProfile.tipo_usuario] || '/dashboard';
    return <Navigate to={targetDashboard} replace />;
  }
  
  return children;
};

// ========================================
// COMPONENTE PRINCIPAL DO ROTEADOR
// ========================================

const AppRouter = () => {
  return (
    <Routes>
      {/* ==========================================
          🌐 ROTA RAIZ - REDIRECIONAMENTO INTELIGENTE
          ========================================== */}
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />
      
      {/* ==========================================
          🔓 ROTAS PÚBLICAS (só acessíveis se não logado)
          ========================================== */}
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
      
      {/* ✅ NOVA ROTA PARA VERIFICAÇÃO DE EMAIL */}
      <Route 
        path="/verify-email" 
        element={
          <PublicRoute>
            <VerifyEmail />
          </PublicRoute>
        }
      />

      {/* ✅ ROTA ANTIGA PARA COMPATIBILIDADE */}
      <Route 
        path="/confirmacao" 
        element={<Navigate to="/verify-email" replace />}
      />
      
      <Route 
        path="/confirm-email" 
        element={<Navigate to="/verify-email" replace />}
      />

      {/* ==========================================
          🔒 ROTAS PROTEGIDAS BÁSICAS
          ========================================== */}
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

      {/* ==========================================
          🚀 SISTEMA QR CODE - NOVAS ROTAS
          ========================================== */}
      
      {/* 🔴 ADMIN: Gerenciar QR Codes */}
      <Route 
        path="/admin/qr-manager" 
        element={
          <AdminRoute>
            <QRCodeManager />
          </AdminRoute>
        } 
      />

      {/* 🔴 ADMIN: Exibição QR para Projetor (tela cheia) */}
      <Route 
        path="/admin/qr-display/:aulaId" 
        element={
          <AdminRoute>
            <QRDisplay />
          </AdminRoute>
        } 
      />

      {/* 📱 ALUNOS: Scanner QR Code (página completa) */}
      <Route 
        path="/scanner" 
        element={
          <ProtectedRoute>
            <QRScannerPage />
          </ProtectedRoute>
        } 
      />

      {/* 📱 SCANNER PÚBLICO (sem autenticação para testes) */}
      <Route 
        path="/scanner-publico" 
        element={
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-md mx-auto">
              <QRScanner />
            </div>
          </div>
        } 
      />

      {/* 📱 SCANNER RÁPIDO (modal/popup) */}
      <Route 
        path="/scanner-rapido" 
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
              <QRScanner onClose={() => window.history.back()} />
            </div>
          </ProtectedRoute>
        } 
      />

      {/* ==========================================
          🔴 ÁREA ADMINISTRATIVA - APENAS ADMIN ✅ ATUALIZADA
          ========================================== */}
      
      {/* Dashboard Principal Admin */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />

      {/* Página de Teste - DEBUG DO BANCO */}
      <Route 
        path="/admin/teste" 
        element={
          <AdminRoute>
            <AdminTeste />
          </AdminRoute>
        } 
      />

      {/* Kanban Admin */}
      <Route 
        path="/admin/kanban" 
        element={
          <AdminRoute>
            <Kanban />
          </AdminRoute>
        } 
      />

      {/* ==========================================
          🔴 GESTÃO DE AULAS - ADMIN
          ========================================== */}
      
      {/* Lista de Aulas */}
      <Route 
        path="/admin/aulas" 
        element={
          <AdminRoute>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">📚 Gerenciar Aulas</h1>
                <p className="text-gray-600">Lista de todas as aulas - Em desenvolvimento...</p>
              </div>
            </div>
          </AdminRoute>
        } 
      />

      {/* Detalhes da Aula */}
      <Route 
        path="/admin/aulas/:id" 
        element={
          <AdminRoute>
            <AulaDetail />
          </AdminRoute>
        } 
      />

      {/* Editar Aula */}
      <Route 
        path="/admin/aulas/editar/:id" 
        element={
          <AdminRoute>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">✏️ Editar Aula</h1>
                <p className="text-gray-600">Formulário de edição - Em desenvolvimento...</p>
              </div>
            </div>
          </AdminRoute>
        } 
      />

      {/* ==========================================
          🔴 GESTÃO DE PROFESSORES - ADMIN ✅ ATUALIZADA
          ========================================== */}
      
      {/* Lista de Professores */}
      <Route 
        path="/admin/professores" 
        element={
          <AdminRoute>
            <AdminProfessores />
          </AdminRoute>
        } 
      />

      {/* Detalhes do Professor */}
      <Route 
        path="/admin/professores/:id" 
        element={
          <AdminRoute>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">👨‍🏫 Detalhes do Professor</h1>
                <p className="text-gray-600">Em desenvolvimento...</p>
              </div>
            </div>
          </AdminRoute>
        } 
      />

      {/* ==========================================
          🔴 GESTÃO DE ALUNOS - ADMIN ✅ NOVA SEÇÃO
          ========================================== */}
      
      {/* Lista de Alunos */}
      <Route 
        path="/admin/alunos" 
        element={
          <AdminRoute>
            <AdminAlunos />
          </AdminRoute>
        } 
      />

      {/* Detalhes do Aluno */}
      <Route 
        path="/admin/alunos/:id" 
        element={
          <AdminRoute>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">👨‍🎓 Detalhes do Aluno</h1>
                <p className="text-gray-600">Em desenvolvimento...</p>
              </div>
            </div>
          </AdminRoute>
        } 
      />

      {/* ==========================================
          🔴 GESTÃO DE INSTRUMENTOS - ADMIN
          ========================================== */}
      
      {/* Lista de Instrumentos Admin */}
      <Route 
        path="/admin/instruments" 
        element={
          <AdminRoute>
            <AdminInstruments />
          </AdminRoute>
        } 
      />

      {/* Detalhes do Instrumento Admin */}
      <Route 
        path="/admin/instruments/:instrumentoId" 
        element={
          <AdminRoute>
            <AdminInstrumentDetails />
          </AdminRoute>
        } 
      />

      {/* ==========================================
          🔴 OUTRAS ÁREAS ADMIN ✅ ATUALIZADAS
          ========================================== */}
      
      {/* Relatórios */}
      <Route 
        path="/admin/relatorios" 
        element={
          <AdminRoute>
            <AdminRelatorios />
          </AdminRoute>
        } 
      />

      {/* Configurações */}
      <Route 
        path="/admin/configuracoes" 
        element={
          <AdminRoute>
            <AdminConfiguracoes />
          </AdminRoute>
        } 
      />

      {/* ==========================================
          🔵 ÁREA DOS ALUNOS - TODOS PODEM ACESSAR ✅ ATUALIZADA
          ========================================== */}
      
      {/* Dashboard Principal dos Alunos */}
      <Route 
        path="/alunos" 
        element={
          <ProtectedRoute>
            <AlunoDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route 
        path="/alunos/dashboard" 
        element={
          <ProtectedRoute>
            <AlunoDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* 🚀 NOVA: Página do Instrumento do Aluno */}
      <Route 
        path="/alunos/meu-instrumento" 
        element={
          <ProtectedRoute>
            <MeuInstrumento />
          </ProtectedRoute>
        }
      />

      {/* 🚀 FUTURAS PÁGINAS DE ALUNOS */}
      <Route 
        path="/alunos/progresso" 
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">📈 Meu Progresso</h1>
                <p className="text-gray-600">Acompanhe sua evolução - Em desenvolvimento...</p>
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      <Route 
        path="/alunos/aulas" 
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">📚 Minhas Aulas</h1>
                <p className="text-gray-600">Próximas aulas e histórico - Em desenvolvimento...</p>
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      <Route 
        path="/alunos/conquistas" 
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">🏆 Minhas Conquistas</h1>
                <p className="text-gray-600">Badges e realizações - Em desenvolvimento...</p>
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      <Route 
        path="/alunos/scanner" 
        element={
          <ProtectedRoute>
            <QRScannerPage />
          </ProtectedRoute>
        }
      />

      {/* ==========================================
          🎵 ÁREA DOS INSTRUMENTOS - TODOS PODEM ACESSAR
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
        
        {/* Filtros por categoria */}
        <Route path="categoria/:categoria" element={<InstrumentosList />} />
      </Route>

      {/* ==========================================
          🟡 ÁREA DOS PROFESSORES - PROFESSORES/PASTORS/ADMIN
          ========================================== */}
      <Route 
        path="/professores" 
        element={
          <EducatorRoute>
            <ProfessoresLayout />
          </EducatorRoute>
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
        
        {/* Estatísticas e analytics */}
        <Route path="estatisticas" element={<ProfessoresEstatisticas />} />
        
        {/* Filtros por categoria */}
        <Route path="categoria/:categoriaId" element={<ProfessoresConteudos />} />
        
        {/* Filtros por tipo */}
        <Route path="tipo/:tipo" element={<ProfessoresConteudos />} />
      </Route>

      {/* ==========================================
          📚 OUTRAS ROTAS PROTEGIDAS - TODOS PODEM ACESSAR
          ========================================== */}
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
      
      {/* ==========================================
          🚫 ROTA 404 - PÁGINA NÃO ENCONTRADA
          ========================================== */}
      <Route 
        path="*" 
        element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">😵</div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-gray-600 mb-4">Página não encontrada</p>
              <div className="space-x-4">
                <button 
                  onClick={() => window.history.back()}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ← Voltar
                </button>
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  🏠 Dashboard
                </button>
              </div>
            </div>
          </div>
        }  
      /> 
    </Routes>
  );
};

export default AppRouter;