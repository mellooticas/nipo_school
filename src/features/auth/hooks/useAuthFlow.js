// hooks/useAuthFlow.js - Hook para gerenciar fluxo completo de autenticação

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { getSmartRedirect } from '../../../shared/services/redirectService';

/**
 * Hook para gerenciar o fluxo completo de autenticação
 * Inclui: login, perfil incompleto, votação, onboarding
 */
export const useAuthFlow = () => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [flowState, setFlowState] = useState({
    status: 'loading', // 'loading', 'not_authenticated', 'needs_vote', 'incomplete_profile', 'ready'
    userType: null,
    needsOnboarding: false,
    canProceed: false,
    nextStep: null,
    completionPercentage: 0
  });

  // Analisar estado do usuário e determinar próximos passos
  useEffect(() => {
    const analyzeAuthFlow = () => {
      // Se ainda está carregando
      if (loading) {
        setFlowState(prev => ({
          ...prev,
          status: 'loading',
          canProceed: false
        }));
        return;
      }

      // Se não há usuário autenticado
      if (!user) {
        setFlowState({
          status: 'not_authenticated',
          userType: null,
          needsOnboarding: false,
          canProceed: false,
          nextStep: '/login',
          completionPercentage: 0
        });
        return;
      }

      // Se não há perfil (aguardar um pouco)
      if (!userProfile) {
        setFlowState(prev => ({
          ...prev,
          status: 'loading',
          canProceed: false,
          completionPercentage: 25
        }));
        return;
      }

      // Analisar perfil
      const userType = userProfile.tipo_usuario;
      const hasVoted = userProfile.has_voted;
      const profileComplete = isProfileComplete(userProfile);
      const isNewUser = isRecentUser(userProfile);

      let status = 'ready';
      let nextStep = '/dashboard';
      let completionPercentage = 100;
      let needsOnboarding = false;

      // Verificar se precisa votar
      if (!hasVoted) {
        status = 'needs_vote';
        nextStep = '/vote';
        completionPercentage = 50;
      }
      // Verificar se perfil está incompleto
      else if (!profileComplete) {
        status = 'incomplete_profile';
        nextStep = '/complete-profile';
        completionPercentage = 75;
      }
      // Verificar se é usuário novo (onboarding)
      else if (isNewUser) {
        needsOnboarding = true;
        completionPercentage = 90;
      }

      setFlowState({
        status,
        userType,
        needsOnboarding,
        canProceed: status === 'ready',
        nextStep,
        completionPercentage
      });
    };

    analyzeAuthFlow();
  }, [user, userProfile, loading]);

  // Verificar se perfil está completo
  const isProfileComplete = (profile) => {
    const requiredFields = ['full_name', 'dob', 'instrument', 'user_level'];
    return requiredFields.every(field => profile[field] && profile[field].trim() !== '');
  };

  // Verificar se é usuário recente (últimos 7 dias)
  const isRecentUser = (profile) => {
    if (!profile.created_at) return false;
    
    const createdDate = new Date(profile.created_at);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return createdDate > sevenDaysAgo;
  };

  // Função para continuar o fluxo
  const continueFlow = () => {
    if (flowState.nextStep) {
      navigate(flowState.nextStep, { replace: true });
    }
  };

  // Função para pular onboarding
  const skipOnboarding = () => {
    const targetDashboard = getSmartRedirect(userProfile, location.pathname, { force: true });
    if (targetDashboard.shouldRedirect) {
      navigate(targetDashboard.targetPath, { replace: true });
    }
  };

  // Função para forçar ir ao dashboard
  const goToDashboard = () => {
    navigate('/dashboard', { replace: true });
  };

  // Verificar se está na rota correta
  const isOnCorrectRoute = () => {
    if (flowState.status === 'ready') return true;
    return location.pathname === flowState.nextStep;
  };

  // Obter próximos passos como lista
  const getNextSteps = () => {
    const steps = [];
    
    if (flowState.status === 'not_authenticated') {
      steps.push({ 
        id: 'login', 
        title: 'Fazer Login', 
        description: 'Entre na sua conta',
        icon: '🔑',
        path: '/login'
      });
    }
    
    if (flowState.status === 'needs_vote') {
      steps.push({ 
        id: 'vote', 
        title: 'Votar no Logo', 
        description: 'Escolha seu logo favorito',
        icon: '🗳️',
        path: '/vote'
      });
    }
    
    if (flowState.status === 'incomplete_profile') {
      steps.push({ 
        id: 'complete-profile', 
        title: 'Completar Perfil', 
        description: 'Finalize suas informações',
        icon: '👤',
        path: '/complete-profile'
      });
    }
    
    if (flowState.needsOnboarding) {
      steps.push({ 
        id: 'onboarding', 
        title: 'Tutorial', 
        description: 'Conheça a plataforma',
        icon: '🎯',
        path: '/onboarding'
      });
    }

    return steps;
  };

  // Obter mensagem de status
  const getStatusMessage = () => {
    switch (flowState.status) {
      case 'loading':
        return 'Carregando seus dados...';
      case 'not_authenticated':
        return 'Faça login para continuar';
      case 'needs_vote':
        return 'Vote no logo antes de continuar';
      case 'incomplete_profile':
        return 'Complete seu perfil para continuar';
      case 'ready':
        return flowState.needsOnboarding 
          ? 'Bem-vindo! Quer fazer um tour?' 
          : 'Tudo pronto! Aproveite a plataforma';
      default:
        return 'Preparando sua experiência...';
    }
  };

  // Obter dados do usuário de forma segura
  const getUserData = () => ({
    email: user?.email || null,
    name: userProfile?.full_name || user?.email || 'Usuário',
    type: userProfile?.tipo_usuario || null,
    level: userProfile?.user_level || 'beginner',
    instrument: userProfile?.instrument || null,
    hasVoted: userProfile?.has_voted || false,
    avatar: userProfile?.avatar_url || null
  });

  return {
    // Estados
    flowState,
    userData: getUserData(),
    loading,
    
    // Verificações
    isAuthenticated: !!user,
    isProfileComplete: userProfile ? isProfileComplete(userProfile) : false,
    isOnCorrectRoute: isOnCorrectRoute(),
    
    // Ações
    continueFlow,
    skipOnboarding,
    goToDashboard,
    
    // Helpers
    getNextSteps,
    getStatusMessage
  };
};

/**
 * Hook específico para verificar acesso a rotas
 */
export const useRouteAccess = (requiredRole = null, requiredPermissions = []) => {
  const { userData, isAuthenticated, isProfileComplete } = useAuthFlow();
  
  const hasAccess = () => {
    // Verificar autenticação
    if (!isAuthenticated) return false;
    
    // Verificar perfil completo
    if (!isProfileComplete) return false;
    
    // Verificar role específico
    if (requiredRole && userData.type !== requiredRole) {
      // Exceção: admin pode acessar área de professor
      if (!(requiredRole === 'professor' && userData.type === 'admin')) {
        return false;
      }
    }
    
    // Verificar permissões específicas (para implementar no futuro)
    if (requiredPermissions.length > 0) {
      // TODO: implementar sistema de permissões
      return true;
    }
    
    return true;
  };

  const getAccessDeniedReason = () => {
    if (!isAuthenticated) return 'Você precisa fazer login';
    if (!isProfileComplete) return 'Complete seu perfil primeiro';
    if (requiredRole && userData.type !== requiredRole) {
      return `Esta área é exclusiva para ${requiredRole}s`;
    }
    return 'Acesso negado';
  };

  return {
    hasAccess: hasAccess(),
    accessDeniedReason: getAccessDeniedReason(),
    userData,
    isAuthenticated,
    isProfileComplete
  };
};

/**
 * Hook para onboarding
 */
export const useOnboarding = () => {
  const [onboardingState, setOnboardingState] = useState({
    currentStep: 0,
    totalSteps: 4,
    isActive: false,
    hasCompleted: false
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao Nipo School! 🎵',
      description: 'Sua jornada musical começa aqui',
      target: '#dashboard',
      content: 'Esta é sua área principal onde você pode acessar todos os recursos da plataforma.'
    },
    {
      id: 'navigation',
      title: 'Navegação 🧭',
      description: 'Conheça o menu principal',
      target: '#navigation',
      content: 'Use o menu para navegar entre instrumentos, módulos e sua área pessoal.'
    },
    {
      id: 'instruments',
      title: 'Instrumentos 🎸',
      description: 'Explore os instrumentos disponíveis',
      target: '#instruments',
      content: 'Clique aqui para ver todos os instrumentos e começar suas aulas.'
    },
    {
      id: 'profile',
      title: 'Seu Perfil 👤',
      description: 'Acompanhe seu progresso',
      target: '#profile',
      content: 'Aqui você pode ver seu progresso, conquistas e editar suas informações.'
    }
  ];

  const startOnboarding = () => {
    setOnboardingState(prev => ({
      ...prev,
      isActive: true,
      currentStep: 0
    }));
  };

  const nextStep = () => {
    setOnboardingState(prev => ({
      ...prev,
      currentStep: prev.currentStep + 1
    }));
  };

  const prevStep = () => {
    setOnboardingState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1)
    }));
  };

  const completeOnboarding = () => {
    setOnboardingState(prev => ({
      ...prev,
      isActive: false,
      hasCompleted: true
    }));
  };

  const skipOnboarding = () => {
    setOnboardingState(prev => ({
      ...prev,
      isActive: false
    }));
  };

  return {
    onboardingState,
    steps,
    currentStep: steps[onboardingState.currentStep],
    startOnboarding,
    nextStep,
    prevStep,
    completeOnboarding,
    skipOnboarding
  };
};