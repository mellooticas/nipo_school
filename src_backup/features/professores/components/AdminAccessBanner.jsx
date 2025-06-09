import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';

const AdminAccessBanner = () => {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Conteúdo Principal */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-1">
                Painel Administrativo Disponível
              </h3>
              <p className="text-purple-100 text-sm">
                Como administrador, você tem acesso ao painel completo de controle da escola com estatísticas detalhadas de alunos, professores e conteúdos.
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/professores/admin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-700 rounded-lg font-semibold hover:bg-purple-50 transition-colors shadow-sm"
            >
              <span>📊</span>
              Acessar Painel Admin
            </Link>
            
            <div className="hidden md:block w-px h-8 bg-white/30"></div>
            
            <div className="text-right text-sm text-purple-100">
              <div className="font-medium">Controle Total</div>
              <div className="text-xs">Relatórios • Estatísticas • Gestão</div>
            </div>
          </div>
        </div>

        {/* Indicadores Rápidos */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-lg font-bold">👨‍🎓</div>
              <div className="text-xs text-purple-100">Alunos</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-lg font-bold">👩‍🏫</div>
              <div className="text-xs text-purple-100">Professores</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-lg font-bold">📚</div>
              <div className="text-xs text-purple-100">Conteúdos</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-lg font-bold">📊</div>
              <div className="text-xs text-purple-100">Relatórios</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAccessBanner;