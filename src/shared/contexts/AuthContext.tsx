import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  ReactNode
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/supabaseClient';
import { getSmartRedirect } from '../services/redirectService';

// ========================================
// TIPOS
// ========================================
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  nome: string;
  dob: string | null;
  instrument: string;
  tipo_usuario: 'aluno' | 'professor' | 'admin' | 'pastor';
  user_level: string;
  total_points: number;
  current_streak: number;
  best_streak: number;
  lessons_completed: number;
  modules_completed: number;
  theme_preference: string;
  notification_enabled: boolean;
  sound_enabled: boolean;
  has_voted: boolean;
  voted_logo: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  church_name: string | null;
  joined_at: string;
  last_active: string;
}

interface SignupData {
  fullName: string;
  dob: string;
  instrument: string;
  tipo_usuario: 'aluno' | 'professor' | 'admin' | 'pastor';
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, userData: SignupData) => Promise<User>;
  logout: () => Promise<void>;
  recordVote: (logoId: string) => Promise<UserProfile>;
  fetchUserProfile: (userId: string, useCache?: boolean) => Promise<UserProfile | null>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextType | null>(null);

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

  // Controle
  const isRedirecting = useRef<boolean>(false);
  const profileCache = useRef<{ profile: UserProfile | null; timestamp: number }>({
    profile: null,
    timestamp: 0
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // ========================================
  // REDIRECIONAMENTO
  // ========================================
  const redirectByVote = (profile: UserProfile | null, force: boolean = false): void => {
    if (isRedirecting.current && !force) return;
    if (!profile) return;
    isRedirecting.current = true;
    try {
      const redirectResult = getSmartRedirect(profile, location.pathname, { force });
      if (redirectResult.shouldRedirect) {
        navigate(redirectResult.targetPath, { replace: true });
      }
    } catch (error) {
      console.error('Erro no redirecionamento:', error);
    } finally {
      setTimeout(() => {
        isRedirecting.current = false;
      }, 500);
    }
  };

  // ========================================
  // BUSCAR PERFIL
  // ========================================
  const fetchUserProfile = async (
    userId: string,
    useCache: boolean = true
  ): Promise<UserProfile | null> => {
    if (!userId) return null;
    const now = Date.now();
    const CACHE_DURATION = 30000;
    if (
      useCache &&
      profileCache.current.profile &&
      now - profileCache.current.timestamp < CACHE_DURATION
    ) {
      console.log('📦 Usando perfil do cache');
      return profileCache.current.profile;
    }
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        // Fallback via RPC
        const { data: rpcResult, error: rpcError } = await supabase.rpc('get_user_profile', {
          user_id: userId
        });
        if (rpcError || !rpcResult?.success) return null;
        const profile = rpcResult.profile as UserProfile;
        profileCache.current = { profile, timestamp: now };
        setUserProfile(profile);
        return profile;
      }
      if (!profileData) return null;
      const profile = profileData as UserProfile;
      profileCache.current = { profile, timestamp: now };
      setUserProfile(profile);
      return profile;
    } catch (error) {
      setUserProfile(null);
      return null;
    }
  };

  // ========================================
  // INICIALIZAÇÃO
  // ========================================
  useEffect(() => {
    if (!mounted) return;
    let isMounted = true;
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          if (session?.user) {
            setUser(session.user);
            // Buscar perfil com retry
            let profile = null;
            let attempts = 0;
            const maxAttempts = 3;
            while (!profile && attempts < maxAttempts) {
              attempts++;
              profile = await fetchUserProfile(session.user.id, false);
              if (!profile && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
            if (location.pathname === '/' || location.pathname === '/login') {
              redirectByVote(profile, true);
            }
          } else {
            setUser(null);
            setUserProfile(null);
          }
          setLoading(false);
        }

        // ========================================
        // LISTENER DE MUDANÇA DE AUTH
        // ========================================
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, session: Session | null) => {
            if (!isMounted) return;
            
            if (session?.user) {
              setUser(session.user);
              
              // Usando if/else ao invés de switch para evitar problemas de tipo
              if (event === 'SIGNED_UP') {
                setTimeout(async () => {
                  const profile = await fetchUserProfile(session.user.id, false);
                  redirectByVote(profile, true);
                }, 2000);
              } else if (event === 'SIGNED_IN') {
                const profile = await fetchUserProfile(session.user.id, false);
                redirectByVote(profile, true);
              } else if (event === 'INITIAL_SESSION') {
                await fetchUserProfile(session.user.id, false);
              }
              // Para outros eventos (TOKEN_REFRESHED, USER_UPDATED, etc), não fazemos nada específico
              
            } else {
              setUser(null);
              setUserProfile(null);
              profileCache.current = { profile: null, timestamp: 0 };
            }
            setLoading(false);
          }
        );
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        if (isMounted) setLoading(false);
      }
    };
    const cleanup = initAuth();
    return () => {
      isMounted = false;
      cleanup.then(fn => fn?.());
    };
  }, [mounted]);

  // ========================================
  // LOGIN
  // ========================================
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // SIGNUP
  // ========================================
  const signup = async (
    email: string,
    password: string,
    userData: SignupData
  ): Promise<User> => {
    try {
      setLoading(true);
      if (!userData.fullName?.trim() || userData.fullName.trim().length < 2) {
        throw new Error('Nome completo é obrigatório (mínimo 2 caracteres)');
      }
      if (!userData.dob) throw new Error('Data de nascimento é obrigatória');
      if (!userData.instrument) throw new Error('Instrumento é obrigatório');
      if (
        !userData.tipo_usuario ||
        !['aluno', 'professor', 'admin', 'pastor'].includes(userData.tipo_usuario)
      ) {
        throw new Error('Tipo de usuário inválido');
      }

      // ETAPA 1: Criar usuário via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });
      if (authError) throw new Error(`Erro na autenticação: ${authError.message}`);
      if (!authData.user) throw new Error('Usuário não foi criado');

      // ETAPA 2: Criar perfil via RPC (que contorna RLS)
      const { data: rpcResult, error: rpcError } = await supabase.rpc('simple_create_profile', {
        profile_id: authData.user.id,
        user_email: email,
        user_full_name: userData.fullName.trim(),
        user_dob: userData.dob,
        user_instrument: userData.instrument,
        user_tipo_usuario: userData.tipo_usuario
      });
      if (rpcError) throw new Error(`Erro ao criar perfil: ${rpcError.message}`);
      if (!rpcResult || !rpcResult.success) throw new Error(rpcResult?.error || 'Erro ao criar perfil');

      // ETAPA 3: Login automático
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (loginError) throw new Error(`Usuário criado, mas erro no login: ${loginError.message}`);
      if (!loginData.user) throw new Error('Usuário criado, mas não foi possível fazer login');

      // ETAPA 4: Carregar perfil
      const profile = rpcResult.profile as UserProfile;
      if (profile) {
        profileCache.current = {
          profile,
          timestamp: Date.now()
        };
        setUserProfile(profile);
      }
      return loginData.user;
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('já está cadastrado') ||
          error.message.includes('already registered')
        ) {
          throw new Error('Este email já está cadastrado. Tente fazer login.');
        } else {
          throw error;
        }
      } else {
        throw new Error('Erro inesperado durante o cadastro');
      }
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // OUTRAS FUNÇÕES
  // ========================================
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setUserProfile(null);
      profileCache.current = { profile: null, timestamp: 0 };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const recordVote = async (logoId: string): Promise<UserProfile> => {
    if (!user) throw new Error('Usuário não autenticado');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ voted_logo: logoId, has_voted: true })
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      const updatedProfile = data as UserProfile;
      profileCache.current = { profile: updatedProfile, timestamp: Date.now() };
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    if (!user) throw new Error('Usuário não autenticado');
    try {
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
      profileCache.current = { profile: updatedProfile, timestamp: Date.now() };
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      throw error;
    }
  };

  // ========================================
  // RENDER
  // ========================================
  if (!mounted) return null;

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};