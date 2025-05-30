import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';

const InstrumentosLayout = () => {
  const { userProfile } = useAuth();
  const location = useLocation();

  // Breadcrumb baseado na rota atual
  const getBreadcrumb = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { label: 'Home', path: '/dashboard' },
      { label: 'Instrumentos', path: '/instrumentos' }
    ];

    if (paths.length > 1) {
      // Se estiver em página específica do instrumento
      if (paths[1] && paths[1] !== 'instrumentos') {
        breadcrumbs.push({ 
          label: 'Instrumento', 
          path: `/instrumentos/${paths[1]}` 
        });
      }
    }

    return breadcrumbs;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Breadcrumb */}
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                {getBreadcrumb().map((item, index) => (
                  <li key={item.path}>
                    <div className="flex items-center">
                      {index > 0 && (
                        <svg
                          className="h-5 w-5 text-gray-400 mr-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                        </svg>
                      )}
                      <Link
                        to={item.path}
                        className={`text-sm font-medium ${
                          index === getBreadcrumb().length - 1
                            ? 'text-gray-500 cursor-default'
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </div>
                  </li>
                ))}
              </ol>
            </nav>

            {/* Ações do usuário */}
            <div className="flex items-center space-x-4">
              {userProfile?.tipo_usuario === 'aluno' && (
                <Link
                  to="/instrumentos"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  🎵 Todos os Instrumentos
                </Link>
              )}
              
              {userProfile?.tipo_usuario === 'professor' && (
                <Link
                  to="/professores"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  👨‍🏫 Área do Professor
                </Link>
              )}

              {userProfile?.tipo_usuario === 'admin' && (
                <Link
                  to="/admin"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ⚙️ Administração
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default InstrumentosLayout;