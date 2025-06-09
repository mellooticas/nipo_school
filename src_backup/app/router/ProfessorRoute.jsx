import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProfessoresLayout from './ProfessoresLayout';
import ProfessoresDashboard from './ProfessoresDashboard';
import ProfessoresConteudos from './ProfessoresConteudos';
import ProfessoresMinhaArea from './ProfessoresMinhaArea';
import ProfessoresEstatisticas from './ProfessoresEstatisticas';
import ConteudoDetalhes from './ConteudoDetalhes';
import FormConteudo from '../../components/professores/FormConteudo';

// Componente de proteção de rota para professores
const ProfessorRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Verificar se o usuário tem acesso à área dos professores
  const temAcesso = user && ['professor', 'pastor', 'admin'].includes(user.nivel_acesso);

  if (!temAcesso) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Componente principal de rotas dos professores
const ProfessoresRoutes = () => {
  return (
    <ProfessorRoute>
      <Routes>
        {/* Layout principal da área dos professores */}
        <Route path="/" element={<ProfessoresLayout />}>
          
          {/* Dashboard principal */}
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
          
          {/* Estatísticas detalhadas */}
          <Route path="estatisticas" element={<ProfessoresEstatisticas />} />
          
          {/* Rota para filtros de categoria */}
          <Route path="categoria/:categoriaId" element={<ProfessoresConteudos />} />
          
          {/* Rota para filtros de tipo */}
          <Route path="tipo/:tipo" element={<ProfessoresConteudos />} />
          
          {/* Fallback - redirecionar para dashboard */}
          <Route path="*" element={<Navigate to="/professores" replace />} />
        </Route>
      </Routes>
    </ProfessorRoute>
  );
};

export default ProfessoresRoutes;