import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { 
  BookOpen, 
  X, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

const ProfessorAccessBanner = () => {
  const { userProfile } = useAuth();
  const [showBanner, setShowBanner] = useState(false);

  // Verificar se deve mostrar o banner
  useEffect(() => {
    if (!userProfile) return;

    // Só mostrar para professor, pastor ou admin
    const isProfessorType = ['professor', 'pastor', 'admin'].includes(userProfile.tipo_usuario);
    
    // Verificar se já foi dispensado nesta sessão
    const dismissedKey = `professor_banner_dismissed_${userProfile.id}`;
    const wasDismissed = sessionStorage.getItem(dismissedKey);

    if (isProfessorType && !wasDismissed) {
      // Mostrar após um pequeno delay
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [userProfile]);

  const handleDismiss = () => {
    setShowBanner(false);
    const dismissedKey = `professor_banner_dismissed_${userProfile.id}`;
    sessionStorage.setItem(dismissedKey, 'true');
  };

  const getRoleInfo = () => {
    switch (userProfile?.tipo_usuario) {
      case 'admin':
        return {
          title: 'Área de Administração',
          icon: '🛡️',
          color: 'from-red-500 to-red-600',
          bgColor: 'bg-red-50 border-red-200'
        };
      case 'pastor':
        return {
          title: 'Área Pastoral',
          icon: '⛪',
          color: 'from-purple-500 to-purple-600',
          bgColor: 'bg-purple-50 border-purple-200'
        };
      default:
        return {
          title: 'Área dos Professores',
          icon: '👨‍🏫',
          color: 'from-green-500 to-green-600',
          bgColor: 'bg-green-50 border-green-200'
        };
    }
  };

  if (!showBanner || !userProfile || !['professor', 'pastor', 'admin'].includes(userProfile.tipo_usuario)) {
    return null;
  }

  const roleInfo = getRoleInfo();

  return (
    <div className={`${roleInfo.bgColor} border rounded-xl p-4 mb-6 relative animate-in slide-in-from-top-2 duration-500`}>
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center">
        <div className="flex-shrink-0 mr-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-lg">{roleInfo.icon}</span>
          </div>
        </div>

        <div className="flex-1 mr-4">
          <div className="flex items-center mb-1">
            <Sparkles className="w-4 h-4 text-yellow-500 mr-2" />
            <h3 className="font-semibold text-gray-900 text-sm">
              {roleInfo.title} Disponível
            </h3>
          </div>
          <p className="text-gray-600 text-sm">
            Crie conteúdos, gerencie materiais e acompanhe estatísticas
          </p>
        </div>

        <Link
          to="/professores"
          className={`bg-gradient-to-r ${roleInfo.color} text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center group flex-shrink-0`}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Acessar
          <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default ProfessorAccessBanner;