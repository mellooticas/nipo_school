// services/redirectService.js - Lógica de redirecionamento inteligente

/**
 * Rotas que são consideradas "específicas" e não devem sofrer redirect automático
 */
const SPECIFIC_ROUTES = [
  '/professores',
  '/admin', 
  '/alunos',
  '/modulos', 
  '/conquistas',
  '/devocional',
  '/perfil',
  '/vote',
  '/instrumentos'
];

/**
 * Rotas de dashboard por tipo de usuário
 */
const DASHBOARD_ROUTES = {
  admin: '/admin/dashboard',
  professor: '/professores/dashboard', 
  aluno: '/alunos/dashboard'
};

/**
 * Rotas que permitem acesso livre (sem autenticação)
 */
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/about',
  '/contact'
];

/**
 * Determina se o usuário deve ser redirecionado e para onde
 * @param {Object} profile - Perfil do usuário
 * @param {string} currentPath - Caminho atual
 * @param {Object} options - Opções de redirecionamento
 * @returns {Object} Resultado do redirecionamento
 */
export const getSmartRedirect = (profile, currentPath, options = {}) => {
  const { force = false } = options;

  // Se não há perfil, não redirecionar
  if (!profile) {
    return {
      shouldRedirect: false,
      targetPath: currentPath,
      reason: 'No profile available'
    };
  }

  console.log('🧭 Smart Redirect Analysis:', {
    hasVoted: profile.has_voted,
    userType: profile.tipo_usuario,
    currentPath,
    force
  });

  // REGRA 1: Se não votou, sempre ir para votação
  if (profile.has_voted !== true) {
    if (currentPath !== '/vote') {
      return {
        shouldRedirect: true,
        targetPath: '/vote',
        reason: 'User needs to vote first'
      };
    }
    return {
      shouldRedirect: false,
      targetPath: currentPath,
      reason: 'Already on vote page'
    };
  }

  // REGRA 2: Se está forçando redirect, ir para dashboard específico
  if (force) {
    const targetDashboard = DASHBOARD_ROUTES[profile.tipo_usuario] || '/dashboard';
    return {
      shouldRedirect: true,
      targetPath: targetDashboard,
      reason: 'Forced redirect to user dashboard'
    };
  }

  // REGRA 3: Se está em rota pública após login, ir para dashboard
  if (PUBLIC_ROUTES.includes(currentPath)) {
    const targetDashboard = DASHBOARD_ROUTES[profile.tipo_usuario] || '/dashboard';
    return {
      shouldRedirect: true,
      targetPath: targetDashboard,
      reason: 'Redirect from public route to dashboard'
    };
  }

  // REGRA 4: Se está em rota específica, manter posição
  const isInSpecificRoute = SPECIFIC_ROUTES.some(route => 
    currentPath.startsWith(route)
  );

  if (isInSpecificRoute) {
    return {
      shouldRedirect: false,
      targetPath: currentPath,
      reason: 'User is in specific route, maintaining position'
    };
  }

  // REGRA 5: Se está em dashboard genérico, ir para dashboard específico
  if (currentPath === '/dashboard') {
    const targetDashboard = DASHBOARD_ROUTES[profile.tipo_usuario];
    if (targetDashboard && targetDashboard !== '/dashboard') {
      return {
        shouldRedirect: true,
        targetPath: targetDashboard,
        reason: 'Upgrade from generic to specific dashboard'
      };
    }
  }

  // REGRA 6: Default - manter posição atual
  return {
    shouldRedirect: false,
    targetPath: currentPath,
    reason: 'No redirect needed, maintaining current position'
  };
};

/**
 * Hook para usar redirecionamento inteligente
 * @param {Function} navigate - Função de navegação do React Router
 * @param {string} currentPath - Caminho atual
 */
export const useSmartRedirect = (navigate, currentPath) => {
  let isRedirecting = false;

  const performRedirect = (profile, options = {}) => {
    // Evitar múltiplos redirects simultâneos
    if (isRedirecting && !options.force) {
      console.log('🚫 Redirect already in progress, ignoring...');
      return false;
    }

    const redirectResult = getSmartRedirect(profile, currentPath, options);
    
    console.log('🎯 Redirect Result:', redirectResult);

    if (redirectResult.shouldRedirect) {
      isRedirecting = true;
      
      try {
        navigate(redirectResult.targetPath, { 
          replace: options.replace !== false 
        });
        return true;
      } finally {
        // Reset flag após um pequeno delay
        setTimeout(() => {
          isRedirecting = false;
        }, 1000);
      }
    }

    return false;
  };

  return { performRedirect };
};

/**
 * Verifica se uma rota requer autenticação
 * @param {string} path - Caminho da rota
 * @returns {boolean}
 */
export const requiresAuth = (path) => {
  return !PUBLIC_ROUTES.includes(path) && 
         !path.startsWith('/public');
};

/**
 * Verifica se um usuário tem permissão para acessar uma rota
 * @param {Object} profile - Perfil do usuário
 * @param {string} path - Caminho da rota
 * @returns {boolean}
 */
export const hasRoutePermission = (profile, path) => {
  if (!profile) return false;

  // Rotas públicas - todos podem acessar
  if (PUBLIC_ROUTES.includes(path)) return true;

  // Rotas de admin - só admins
  if (path.startsWith('/admin')) {
    return profile.tipo_usuario === 'admin';
  }

  // Rotas de professor - só professores e admins
  if (path.startsWith('/professores')) {
    return ['professor', 'admin'].includes(profile.tipo_usuario);
  }

  // Rotas de aluno - todos os tipos podem acessar
  if (path.startsWith('/alunos')) {
    return true; // Todos podem ver conteúdo de aluno
  }

  // Outras rotas gerais - todos autenticados podem acessar
  return true;
};

/**
 * Obtem o dashboard padrão para um tipo de usuário
 * @param {string} userType - Tipo do usuário
 * @returns {string}
 */
export const getDefaultDashboard = (userType) => {
  return DASHBOARD_ROUTES[userType] || '/dashboard';
};

/**
 * Logs de debug para desenvolvimento
 * @param {string} action - Ação realizada
 * @param {Object} data - Dados do log
 */
export const logRedirect = (action, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🧭 [REDIRECT] ${action}:`, data);
  }
};