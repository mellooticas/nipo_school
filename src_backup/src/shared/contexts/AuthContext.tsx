import React, { createContext, useState, useEffect, useContext, useRef, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/supabaseClient';
import { getSmartRedirect, logRedirect } from '../../services/redirectService';
import { 
  AuthContextType, 
  UserProfile, 
  SignupData, 
  ProfileUpdateData 
} from '../../types/auth';

// Context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // States
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);
  
  // Refs para controle de fluxo
  const hasRedirected = useRef<boolean>(false);
  const isRedirecting = useRef<boolean>(false);
  const lastProfileFetch = useRef<number>(0);

  // Evita hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirecionamento INTELIGENTE usando o novo service
  const redirectByVote = (profile: UserProfile | null, force: boolean = false): void => {
    // Evitar múltiplos redirects simultâneos
    if (isRedirecting.current && !force) {
      logRedirect('SKIP', { reason: 'Already redirecting', profile: profile?.tipo_usuario });
      return;
    }

    if (!profile) {
      logRedirect('SKIP', { reason: 'No profile' });
      return;
    }

    isRedirecting.current = true;

    try {
      const redirectResult = getSmartRedirect(profile, location.pathname, { force });
      
      logRedirect('ANALYSIS', {
        profile: profile.tipo_usuario,
        hasVoted: profile.has_voted,
        currentPath: location.pathname,
        result: redirectResult
      });

      if (redirectResult.shouldRedirect) {
        logRedirect('EXECUTING', {
          from: location.pathname,
          to: redirectResult.targetPath,
          reason: redirectResult.reason
        });

        navigate(redirectResult.targetPath, { replace: true });
        
        if (!force) {
          hasRedirected.current = true;
        }
      }
    } catch (error) {
      console.error('Erro no redirecionamento:', error);
    } finally {
      // Reset flag após delay
      setTimeout(() => {
        isRedirecting.current = false;
      }, 1000);
    }
  };

  // Função para buscar perfil com CACHE otimizado
  const fetchUserProfile = async (userId: string, useCache: boolean = true): Promise<UserProfile | null> => {
    if (!userId) return null;

    // Cache inteligente - evitar requests muito frequentes
    const now = Date.now();
    const CACHE_DURATION = 5000; // 5 segundos

    if (useCache && userProfile && (now - lastProfileFetch.current) < CACHE_DURATION) {
      logRedirect('CACHE_HIT', { userId, profile: userProfile.tipo_usuario });
      return userProfile;
    }

    try {
      logRedirect('FETCH_PROFILE', { userId });
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      if (data) {
        lastProfileFetch.current = now;
        setUserProfile(data as UserProfile);
        logRedirect('PROFILE_LOADED', { 
          userId, 
          userType: data.tipo_usuario,
          hasVoted: data.has_voted 
        });
        return data as UserProfile;
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      setUserProfile(null);
      return null;
    }
  };

  // Inicialização da autenticação
  useEffect(() => {
    if (!mounted) return;

    let isMounted = true;

    const initAuth = async () => {
      try {
        logRedirect('INIT_AUTH', { currentPath: location.pathname });
        
        const { data: { session } } = await supabase.auth.getSession();

        if (isMounted) {
          if (session?.user) {
            setUser(session.user);
            const profile = await fetchUserProfile(session.user.id, false);
            
            // Só redirecionar na inicialização se necessário
            if (location.pathname === '/' || location.pathname === '/login') {
              redirectByVote(profile, true);
            }
          } else {
            setUser(null);
            setUserProfile(null);
          }
          setLoading(false);
        }

        // Listener para mudanças de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMounted) return;

            logRedirect('AUTH_CHANGE', { 
              event, 
              email: session?.user?.email,
              currentPath: location.pathname 
            });

            if (session?.user) {
              setUser(session.user);

              if (event === 'SIGNED_UP') {
                logRedirect('NEW_USER', { userId: session.user.id });
                // Aguardar criação do perfil no database
                setTimeout(async () => {
                  const profile = await fetchUserProfile(session.user.id, false);
                  redirectByVote(profile, true);
                }, 2000);
                
              } else if (event === 'SIGNED_IN') {
                const profile = await fetchUserProfile(session.user.id, false);
                redirectByVote(profile, true);
                
              } else if (event === 'INITIAL_SESSION') {
                // Para sessão inicial, não redirecionar automaticamente
                await fetchUserProfile(session.user.id, false);
                logRedirect('INITIAL_SESSION', { maintain: true });
              }

            } else {
              setUser(null);
              setUserProfile(null);
              hasRedirected.current = false; // Reset redirect flag
              logRedirect('SIGNED_OUT', {});
            }

            setLoading(false);
          }
        );

        return () => {
          subscription.unsubscribe();
        };

      } catch (error) {
        console.error('Erro na inicialização:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const cleanup = initAuth();
    return () => {
      isMounted = false;
      cleanup.then(fn => fn?.());
    };
  }, [mounted]); // Dependência otimizada

  // Métodos de autenticação
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      logRedirect('LOGIN_ATTEMPT', { email });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      logRedirect('LOGIN_SUCCESS', { email });
      hasRedirected.current = false; // Reset para permitir redirect após login
      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, userData: SignupData = {}): Promise<User> => {
    try {
      setLoading(true);
      logRedirect('SIGNUP_ATTEMPT', { email, userType: userData.tipo_usuario });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName || '',
            dob: userData.dob || '',
            instrument: userData.instrument || '',
            tipo_usuario: userData.tipo_usuario || 'aluno',
            user_level: userData.user_level || 'beginner',
            theme_preference: userData.theme_preference || 'light',
            notification_enabled: userData.notification_enabled ?? true,
            sound_enabled: userData.sound_enabled ?? true
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('User creation failed');

      logRedirect('SIGNUP_SUCCESS', { 
        email, 
        userType: userData.tipo_usuario,
        metadata: data.user.user_metadata 
      });

      hasRedirected.current = false; // Reset para permitir redirect após signup
      return data.user;
    } catch (error) {
      console.error('Erro no signup:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      logRedirect('LOGOUT_ATTEMPT', {});

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setUserProfile(null);
      hasRedirected.current = false; // Reset redirect flag
      lastProfileFetch.current = 0; // Reset cache
      
      logRedirect('LOGOUT_SUCCESS', {});
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const recordVote = async (logoId: string): Promise<UserProfile> => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      logRedirect('VOTE_ATTEMPT', { userId: user.id, logoId });

      const { data, error } = await supabase
        .from('profiles')
        .update({ voted_logo: logoId, has_voted: true })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedProfile = data as UserProfile;
      setUserProfile(updatedProfile);
      lastProfileFetch.current = 0; // Invalidar cache

      logRedirect('VOTE_SUCCESS', { userId: user.id, logoId });
      return updatedProfile;
    } catch (error) {
      console.error('Erro ao votar:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData: ProfileUpdateData): Promise<UserProfile> => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      logRedirect('UPDATE_PROFILE', { userId: user.id, data: profileData });

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          ...profileData,
          last_active: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const updatedProfile = data as UserProfile;
      setUserProfile(updatedProfile);
      lastProfileFetch.current = 0; // Invalidar cache

      logRedirect('UPDATE_SUCCESS', { userId: user.id });
      return updatedProfile;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  // Evitar renderização durante hidration
  if (!mounted) {
    return null;
  }

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    login,
    signup,
    logout,
    recordVote,
    fetchUserProfile,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider'); 
  }
  return context;
};