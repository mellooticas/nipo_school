import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../shared/contexts/AuthContext';
import { 
  BookOpen, 
  X, 
  ChevronRight,
  Sparkles,
  Users,
  Video,
  FileText
} from 'lucide-react';

const ProfessorAccessModal = () => {
  const { userProfile } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [hasShownBefore, setHasShownBefore] = useState(false);

  // Verificar se deve mostrar o modal
  useEffect(() => {
    if (!userProfile) return;

    // Só mostrar para professor, pastor ou admin
    const isProfessorType = ['professor', 'pastor', 'admin'].includes(userProfile.tipo_usuario);
    
    // Verificar se já foi mostrado nesta sessão
    const shownKey = `professor_modal_shown_${userProfile.id}`;
    const wasShownToday = localStorage.getItem(shownKey);
    const today = new Date().toDateString();

    if (isProfessorType && (!wasShownToday || wasShownToday !== today) && !hasShownBefore) {
      // Mostrar após um pequeno delay para boa UX
      const timer = setTimeout(() => {
        setShowModal(true);
        setHasShownBefore(true);
        localStorage.setItem(shownKey, today);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [userProfile, hasShownBefore]);

  const handleClose = () => {
    setShowModal(false);
  };

  const getRoleInfo = () => {
    switch (userProfile?.tipo_usuario) {
      case 'admin':
        return {
          title: 'Área de Administração',
          subtitle: 'Gerencie toda a plataforma',
          icon: '🛡️',
          color: 'from-red-500 to-red-600'
        };
      case 'pastor':
        return {
          title: 'Área Pastoral',
          subtitle: 'Supervisione a comunidade',
          icon: '⛪',
          color: 'from-purple-500 to-purple-600'
        };
      default:
        return {
          title: 'Área dos Professores',
          subtitle: 'Crie e gerencie conteúdos',
          icon: '👨‍🏫',
          color: 'from-green-500 to-green-600'
        };
    }
  };

  if (!showModal || !userProfile || !['professor', 'pastor', 'admin'].includes(userProfile.tipo_usuario)) {
    return null;
  }

  const roleInfo = getRoleInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in-50 slide-in-from-bottom-8 duration-300">
        {/* Header com gradiente */}
        <div className={`bg-gradient-to-r ${roleInfo.color} p-6 text-white relative`}>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl">{roleInfo.icon}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">{roleInfo.title}</h2>
              <p className="text-white text-opacity-90 text-sm">{roleInfo.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Olá, {userProfile.full_name}! 👋
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Como {userProfile.tipo_usuario}, você tem acesso a ferramentas especiais para 
              criar conteúdos, gerenciar materiais e acompanhar o progresso dos alunos.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-700">
              <Video className="w-4 h-4 text-blue-500 mr-3" />
              <span>Criar vídeos educativos</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <FileText className="w-4 h-4 text-green-500 mr-3" />
              <span>Compartilhar materiais didáticos</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <Users className="w-4 h-4 text-purple-500 mr-3" />
              <span>Acompanhar estatísticas</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <Sparkles className="w-4 h-4 text-yellow-500 mr-3" />
              <span>Publicar sacadas pedagógicas</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-3">
            <Link
              to="/professores"
              onClick={handleClose}
              className={`bg-gradient-to-r ${roleInfo.color} text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center group`}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Acessar {roleInfo.title}
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <button
              onClick={handleClose}
              className="text-gray-600 hover:text-gray-800 transition-colors py-2 text-sm"
            >
              Continuar no Dashboard Principal
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            💡 Esta mensagem aparece apenas uma vez por dia
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfessorAccessModal;