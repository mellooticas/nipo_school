// hooks/useSmartRedirect.ts - Hook para redirecionamento inteligente
import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useRef } from 'react';
import { getSmartRedirect } from '../services/redirectService';

// ✅ TIPOS LOCAIS (para evitar problemas de import)
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  tipo_usuario: 'aluno' | 'professor' | 'admin' | 'pastor';
  has_voted: boolean;
  joined_at: string;
  [key: string]: any;
}

interface RedirectOptions {
  force?: boolean;
  replace?: boolean;
}

interface UseSmartRedirectReturn {
  performRedirect: (profile: UserProfile | null, options?: RedirectOptions) => boolean;
  isRedirecting: boolean;
}

export const useSmartRedirect = (): UseSmartRedirectReturn => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRedirectingRef = useRef<boolean>(false);

  const performRedirect = useCallback((
    profile: UserProfile | null, 
    options: RedirectOptions = {}
  ): boolean => {
    // Evitar múltiplos redirects simultâneos
    if (isRedirectingRef.current && !options.force) {
      console.log('🎯 SKIP_HOOK: Already redirecting via hook');
      return false;
    }

    if (!profile) {
      console.log('🎯 SKIP_HOOK: No profile provided');
      return false;
    }

    const redirectResult = getSmartRedirect(profile, location.pathname, options);
    
    console.log('🎯 HOOK_ANALYSIS:', {
      profile: profile.tipo_usuario,
      currentPath: location.pathname,
      result: redirectResult
    });

    if (redirectResult.shouldRedirect) {
      isRedirectingRef.current = true;
      
      try {
        console.log('🎯 HOOK_EXECUTING:', {
          from: location.pathname,
          to: redirectResult.targetPath,
          reason: redirectResult.reason
        });

        navigate(redirectResult.targetPath, { 
          replace: options.replace !== false 
        });
        
        return true;
      } catch (error) {
        console.error('❌ Erro no redirecionamento via hook:', error);
        return false;
      } finally {
        // Reset flag após delay
        setTimeout(() => {
          isRedirectingRef.current = false;
        }, 1000);
      }
    }

    return false;
  }, [navigate, location.pathname]);

  return {
    performRedirect,
    isRedirecting: isRedirectingRef.current 
  };
};