import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Home, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../../shared/contexts/AuthContext';

const QuickSwitch = () => {
  const { userProfile } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Só mostrar para professores/admins
  if (!userProfile || !['professor', 'pastor', 'admin'].includes(userProfile.tipo_usuario)) {
    return null;
  }

  const currentArea = location.pathname.startsWith('/professores') ? 'professores' : 'dashboard';

  const areas = [
    {
      id: 'dashboard',
      name: 'Dashboard Principal',
      path: '/dashboard',
      icon: Home,
      description: 'Área do aluno',
      color: 'text-blue-600'
    },
    {
      id: 'professores',
      name: 'Área dos Professores',
      path: '/professores',
      icon: BookOpen,
      description: 'Gerenciar conteúdos',
      color: 'text-green-600'
    }
  ];

  const currentAreaData = areas.find(area => area.id === currentArea);
  const CurrentIcon = currentAreaData?.icon || Home;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <CurrentIcon className={`w-4 h-4 ${currentAreaData?.color || 'text-gray-600'}`} />
        <span className="text-sm font-medium text-gray-700">
          {currentAreaData?.name || 'Dashboard'}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                Alternar Área
              </div>
              
              {areas.map((area) => {
                const Icon = area.icon;
                const isCurrent = area.id === currentArea;
                
                return (
                  <Link
                    key={area.id}
                    to={area.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isCurrent
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${area.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{area.name}</div>
                      <div className="text-xs text-gray-500">{area.description}</div>
                    </div>
                    {isCurrent && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuickSwitch;