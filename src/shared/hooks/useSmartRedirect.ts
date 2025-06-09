// hooks/useSmartRedirect.ts - Hook para redirecionamento inteligente

import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useRef } from 'react';
import { getSmartRedirect, logRedirect } from '../services/redirectService';
import { UserProfile, RedirectOptions } from '../../types/auth';

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
      logRedirect('SKIP_HOOK', { reason: 'Already redirecting via hook' });
      return false;
    }

    if (!profile) {
      logRedirect('SKIP_HOOK', { reason: 'No profile provided' });
      return false;
    }

    const redirectResult = getSmartRedirect(profile, location.pathname, options);
    
    logRedirect('HOOK_ANALYSIS', {
      profile: profile.tipo_usuario,
      currentPath: location.pathname,
      result: redirectResult
    });

    if (redirectResult.shouldRedirect) {
      isRedirectingRef.current = true;
      
      try {
        logRedirect('HOOK_EXECUTING', {
          from: location.pathname,
          to: redirectResult.targetPath,
          reason: redirectResult.reason
        });

        navigate(redirectResult.targetPath, { 
          replace: options.replace !== false 
        });
        
        return true;
      } catch (error) {
        console.error('Erro no redirecionamento via hook:', error);
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