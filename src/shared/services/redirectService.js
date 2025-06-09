// services/redirectService.js - Com hierarquia completa de permissões

/**
 * Rotas específicas que não devem sofrer redirect automático
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
 * Dashboard padrão por tipo de usuário 
 */
const DASHBOARD_ROUTES = {
  admin: '/admin',               // ✅ Admin vai para dashboard completo pronto
  professor: '/professores',     // ✅ Professor vai para área de professores
  pastor: '/professores',        // ✅ Pastor usa área de professor  
  aluno: '/alunos'            // ✅ Aluno vai para dashboard padrão (temporário)
};

/**
 * Rotas públicas (sem autenticação necessária)
 */
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/signup',
  '/about',
  '/contact'
];

/**
 * ✅ NOVA: Hierarquia de permissões por tipo de usuário
 */
const ROUTE_PERMISSIONS = {
  admin: {
    allowed: ['*'], // Admin tem acesso a TUDO
    dashboard: '/admin'
  },
  professor: {
    allowed: [
      '/professores',
      '/alunos',          // Pode ver progresso dos alunos
      '/instrumentos',    // Acesso educacional
      '/modulos',         // Pode criar/ver módulos
      '/dashboard',       // Acesso geral
      '/conquistas',      // Pode ver conquistas dos alunos
      '/devocional',      // Conteúdo educacional
      '/perfil'           // Próprio perfil
    ],
    forbidden: ['/admin'], // Não pode acessar área admin
    dashboard: '/professores'
  },
  pastor: {
    allowed: [
      '/professores',     // Mesmo acesso que professor
      '/alunos',
      '/instrumentos',
      '/modulos',
      '/dashboard',
      '/conquistas',
      '/devocional',
      '/perfil'
    ],
    forbidden: ['/admin'],
    dashboard: '/professores'
  },
 aluno: {
  allowed: [
    '/alunos',          // Área própria (quando existir)
    '/instrumentos',    // Aprender instrumentos
    '/modulos',         // Fazer módulos
    '/dashboard',       // Dashboard geral
    '/conquistas',      // Próprias conquistas
    '/devocional',      // Conteúdo devocional
    '/perfil'           // Próprio perfil
  ],
  forbidden: ['/admin', '/professores'], // Não pode acessar áreas administrativas
  dashboard: '/alunos'    // ✅ CORRIGIDO: Dashboard específico para alunos
}
};

/**
 * Determina se o usuário deve ser redirecionado e para onde
 */
export const getSmartRedirect = (profile, currentPath, options = {}) => {
  const { force = false } = options;

  if (!profile) {
    return {
      shouldRedirect: false,
      targetPath: currentPath,
      reason: 'No profile available'
    };
  }

  // ✅ REGRA 1: Verificar permissão de acesso PRIMEIRO
  if (!hasRoutePermission(profile, currentPath)) {
    const userDashboard = DASHBOARD_ROUTES[profile.tipo_usuario] || '/dashboard';
    return {
      shouldRedirect: true,
      targetPath: userDashboard,
      reason: `Access denied to ${currentPath}. Redirecting to user dashboard.`
    };
  }

  // ✅ REGRA 2: Votação TEMPORÁRIA (apenas para novos usuários nas primeiras 24h)
  const shouldVoteFirst = checkIfShouldVoteFirst(profile, currentPath);
  if (shouldVoteFirst) {
    return {
      shouldRedirect: true,
      targetPath: '/vote',
      reason: 'New user needs to vote first (temporary rule)'
    };
  }

  // ✅ REGRA 3: Redirect forçado para dashboard específico
  if (force) {
    const targetDashboard = DASHBOARD_ROUTES[profile.tipo_usuario] || '/dashboard';
    return {
      shouldRedirect: true,
      targetPath: targetDashboard,
      reason: 'Forced redirect to user dashboard'
    };
  }

  // ✅ REGRA 4: Redirect de rotas públicas após login
  if (PUBLIC_ROUTES.includes(currentPath)) {
    const targetDashboard = DASHBOARD_ROUTES[profile.tipo_usuario] || '/dashboard';
    return {
      shouldRedirect: true,
      targetPath: targetDashboard,
      reason: 'Redirect from public route to dashboard'
    };
  }

  // ✅ REGRA 5: Manter posição em rotas específicas
  const isInSpecificRoute = SPECIFIC_ROUTES.some(route => 
    currentPath.startsWith(route)
  );

  if (isInSpecificRoute) {
    return {
      shouldRedirect: false,
      targetPath: currentPath,
      reason: 'User is in specific route'
    };
  }

  // ✅ REGRA 6: Upgrade de dashboard genérico para específico
  if (currentPath === '/dashboard') {
    const specificDashboard = DASHBOARD_ROUTES[profile.tipo_usuario];
    if (specificDashboard && specificDashboard !== '/dashboard') {
      return {
        shouldRedirect: true,
        targetPath: specificDashboard,
        reason: `Upgrade ${profile.tipo_usuario} to specific dashboard`
      };
    }
  }

  // DEFAULT: Manter posição atual
  return {
    shouldRedirect: false,
    targetPath: currentPath,
    reason: 'No redirect needed'
  };
};

/**
 * ✅ FUNÇÃO: Verifica se usuário deve votar primeiro (regra temporária)
 */
const checkIfShouldVoteFirst = (profile, currentPath) => {
  // Se já está na página de voto, não redirecionar
  if (currentPath === '/vote') return false;
  
  // Se já votou, não precisa votar
  if (profile.has_voted === true) return false;
  
  // ✅ REGRA TEMPORÁRIA: Apenas usuários criados nos últimos 7 dias devem votar
  const accountCreated = new Date(profile.joined_at || profile.created_at);
  const now = new Date();
  const daysSinceCreation = (now - accountCreated) / (1000 * 60 * 60 * 24);
  
  // Se conta foi criada há mais de 7 dias, não forçar votação
  if (daysSinceCreation > 7) return false;
  
  // ✅ EXCEÇÕES: Não forçar votação em certas rotas
  const voteExceptions = ['/perfil', '/logout'];
  if (voteExceptions.some(route => currentPath.startsWith(route))) {
    return false;
  }
  
  return true; // Deve votar primeiro
};

/**
 * Hook para redirecionamento inteligente
 */
export const useSmartRedirect = (navigate, currentPath) => {
  let isRedirecting = false;

  const performRedirect = (profile, options = {}) => {
    if (isRedirecting && !options.force) {
      return false;
    }

    const redirectResult = getSmartRedirect(profile, currentPath, options);

    if (redirectResult.shouldRedirect) {
      isRedirecting = true;
      
      console.log('🎯 Redirecionando:', {
        from: currentPath,
        to: redirectResult.targetPath,
        reason: redirectResult.reason,
        userType: profile?.tipo_usuario,
        permissions: ROUTE_PERMISSIONS[profile?.tipo_usuario]
      });
      
      navigate(redirectResult.targetPath, { 
        replace: options.replace !== false 
      });

      // Reset flag
      setTimeout(() => {
        isRedirecting = false;
      }, 1000);
      
      return true;
    }

    return false;
  };

  return { performRedirect };
};

/**
 * Verifica se uma rota requer autenticação
 */
export const requiresAuth = (path) => {
  return !PUBLIC_ROUTES.includes(path) && !path.startsWith('/public');
};

/**
 * ✅ FUNÇÃO PRINCIPAL: Verifica permissão de acesso à rota
 */
export const hasRoutePermission = (profile, path) => {
  if (!profile || !profile.tipo_usuario) return false;

  // Rotas públicas sempre permitidas
  if (PUBLIC_ROUTES.includes(path)) return true;

  const userType = profile.tipo_usuario;
  const permissions = ROUTE_PERMISSIONS[userType];
  
  if (!permissions) return false;

  // ✅ ADMIN tem acesso a TUDO
  if (userType === 'admin') return true;

  // ✅ Verificar rotas proibidas
  if (permissions.forbidden && permissions.forbidden.some(forbidden => path.startsWith(forbidden))) {
    return false;
  }

  // ✅ Verificar rotas permitidas
  if (permissions.allowed) {
    // Se tem '*', pode tudo
    if (permissions.allowed.includes('*')) return true;
    
    // Verificar se path está na lista de permitidos
    return permissions.allowed.some(allowed => path.startsWith(allowed));
  }

  return false;
};

/**
 * Obtém dashboard padrão para tipo de usuário
 */
export const getDefaultDashboard = (userType) => {
  return DASHBOARD_ROUTES[userType] || '/dashboard';
};

/**
 * ✅ NOVA: Função helper para verificar se é admin
 */
export const isAdmin = (profile) => {
  return profile?.tipo_usuario === 'admin';
};

/**
 * ✅ NOVA: Função helper para verificar se é professor/pastor 
 */
export const isEducator = (profile) => {
  return ['professor', 'pastor'].includes(profile?.tipo_usuario);
};

/**
 * ✅ NOVA: Obter permissões do usuário
 */
export const getUserPermissions = (userType) => {
  return ROUTE_PERMISSIONS[userType] || ROUTE_PERMISSIONS.aluno;
};