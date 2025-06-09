// src/shared/contexts/AuthContext.tsx - VERSÃO SIMPLIFICADA

import React, { createContext, useState, useEffect, useContext, useRef, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/supabaseClient';
import { getSmartRedirect } from '../services/redirectService';

// ============================================================================
// TIPOS
// ============================================================================

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

  // ============================================================================
  // REDIRECIONAMENTO
  // ============================================================================

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

  // ============================================================================
  // BUSCAR PERFIL - VERSÃO SIMPLIFICADA
  // ============================================================================

  const fetchUserProfile = async (userId: string, useCache: boolean = true): Promise<UserProfile | null> => {
    if (!userId) return null;

    const now = Date.now();
    const CACHE_DURATION = 30000;

    if (useCache && profileCache.current.profile && (now - profileCache.current.timestamp) < CACHE_DURATION) {
      console.log('📦 Usando perfil do cache');
      return profileCache.current.profile;
    }

    try {
      console.log('🔍 Buscando perfil via service_role para userId:', userId);
      
      // USAR SERVICE_ROLE PARA CONTORNAR RLS
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar perfil via SELECT normal:', error);
        
        // FALLBACK: Tentar via RPC get_user_profile
        console.log('🔄 Tentando via RPC get_user_profile...');
        
        const { data: rpcResult, error: rpcError } = await supabase.rpc('get_user_profile', {
          user_id: userId
        });

        if (rpcError || !rpcResult?.success) {
          console.error('❌ RPC também falhou:', rpcError);
          return null;
        }

        const profile = rpcResult.profile as UserProfile;
        
        profileCache.current = {
          profile,
          timestamp: now
        };
        
        setUserProfile(profile);
        console.log('✅ Perfil carregado via RPC:', profile.email);
        return profile;
      }

      if (!profileData) {
        console.error('❌ Perfil não encontrado');
        return null;
      }

      const profile = profileData as UserProfile;
      
      profileCache.current = {
        profile,
        timestamp: now
      };
      
      setUserProfile(profile);
      console.log('✅ Perfil carregado via SELECT:', profile.email, profile.tipo_usuario);
      return profile;

    } catch (error) {
      console.error('💥 Erro crítico ao buscar perfil:', error);
      setUserProfile(null);
      return null;
    }
  };

  // ============================================================================
  // INICIALIZAÇÃO
  // ============================================================================

  useEffect(() => {
    if (!mounted) return;

    let isMounted = true;

    const initAuth = async () => {
      try {
        console.log('🚀 Inicializando autenticação simplificada...');
        
        const { data: { session } } = await supabase.auth.getSession();

        if (isMounted) {
          if (session?.user) {
            console.log('👤 Sessão encontrada:', session.user.id);
            setUser(session.user);
            
            // Buscar perfil com retry
            let profile = null;
            let attempts = 0;
            const maxAttempts = 3;
            
            while (!profile && attempts < maxAttempts) {
              attempts++;
              console.log(`🔄 Tentativa ${attempts}/${maxAttempts} de buscar perfil`);
              
              profile = await fetchUserProfile(session.user.id, false);
              
              if (!profile && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
            
            if (profile) {
              console.log('✅ Perfil carregado na inicialização:', profile.tipo_usuario);
            } else {
              console.log('⚠️ Não foi possível carregar perfil na inicialização');
            }
            
            if (location.pathname === '/' || location.pathname === '/login') {
              redirectByVote(profile, true);
            }
          } else {
            console.log('❌ Nenhuma sessão encontrada');
            setUser(null);
            setUserProfile(null);
          }
          setLoading(false);
        }

        // Procure na linha 249 do AuthContext.tsx por algo como:
// if (event === 'SIGNED_UP') {

// E substitua toda a seção do onAuthStateChange por esta versão corrigida:

// Substitua a seção do onAuthStateChange no AuthContext.tsx
// (geralmente por volta da linha 190-250)

// Listener para mudanças de auth
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    if (!isMounted) return;

    console.log('🔄 Auth state change:', event, session?.user?.id);

    if (session?.user) {
      setUser(session.user);

      // ✅ CORREÇÃO: Usar comparação de string simples
      if (event === 'SIGNED_UP') {
        console.log('👶 Novo usuário cadastrado');
        setTimeout(async () => {
          const profile = await fetchUserProfile(session.user.id, false);
          redirectByVote(profile, true);
        }, 2000);
        
      } else if (event === 'SIGNED_IN') {
        console.log('🔑 Usuário fez login');
        const profile = await fetchUserProfile(session.user.id, false);
        redirectByVote(profile, true);
        
      } else if (event === 'INITIAL_SESSION') {
        console.log('📋 Sessão inicial');
        await fetchUserProfile(session.user.id, false); 
      }

    } else {
      console.log('👋 Usuário deslogado');
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
        console.error('💥 Erro na inicialização:', error);
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
  }, [mounted]);

  // ============================================================================
  // LOGIN
  // ============================================================================

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('🔑 Tentando fazer login...', { email });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        throw error;
      }

      console.log('✅ Login realizado com sucesso');
      return data;
    } catch (error) {
      console.error('💥 Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // SIGNUP - VERSÃO SIMPLIFICADA
  // ============================================================================

  const signup = async (email: string, password: string, userData: SignupData): Promise<User> => {
    try {
      setLoading(true);
      
      console.log('🚀 Iniciando signup simplificado:', { email, userData });
      
      // Validações
      if (!userData.fullName?.trim() || userData.fullName.trim().length < 2) {
        throw new Error('Nome completo é obrigatório (mínimo 2 caracteres)');
      }
      if (!userData.dob) throw new Error('Data de nascimento é obrigatória');
      if (!userData.instrument) throw new Error('Instrumento é obrigatório');
      if (!userData.tipo_usuario || !['aluno', 'professor', 'admin', 'pastor'].includes(userData.tipo_usuario)) {
        throw new Error('Tipo de usuário inválido');
      }

      // ETAPA 1: Criar usuário via Supabase Auth
      console.log('📧 Criando usuário via Supabase Auth...');
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
        // SEM metadados para evitar complicações
      });

      if (authError) {
        console.error('❌ Erro no Supabase Auth:', authError);
        throw new Error(`Erro na autenticação: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado');
      }

      console.log('✅ Usuário criado via Supabase Auth:', authData.user.id);

      // ETAPA 2: Criar perfil via RPC (que contorna RLS)
      console.log('👤 Criando perfil via RPC...');
      
      const { data: rpcResult, error: rpcError } = await supabase.rpc('simple_create_profile', {
        profile_id: authData.user.id,
        user_email: email,
        user_full_name: userData.fullName.trim(),
        user_dob: userData.dob,
        user_instrument: userData.instrument,
        user_tipo_usuario: userData.tipo_usuario
      });

      if (rpcError) {
        console.error('❌ Erro no RPC:', rpcError);
        throw new Error(`Erro ao criar perfil: ${rpcError.message}`);
      }

      if (!rpcResult || !rpcResult.success) {
        console.error('❌ RPC falhou:', rpcResult?.error);
        throw new Error(rpcResult?.error || 'Erro ao criar perfil');
      }

      console.log('✅ Perfil criado via RPC');

      // ETAPA 3: Login automático
      console.log('🔐 Fazendo login automático...');
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) {
        console.error('❌ Erro no login automático:', loginError);
        throw new Error(`Usuário criado, mas erro no login: ${loginError.message}`);
      }

      if (!loginData.user) {
        throw new Error('Usuário criado, mas não foi possível fazer login');
      }

      console.log('✅ Login automático realizado');

      // ETAPA 4: Carregar perfil
      const profile = rpcResult.profile as UserProfile;
      if (profile) {
        profileCache.current = {
          profile,
          timestamp: Date.now()
        };
        setUserProfile(profile);
        console.log('✅ Perfil carregado:', profile.tipo_usuario);
      }

      console.log('🎉 Signup simplificado completo!');
      return loginData.user;

    } catch (error) {
      console.error('💥 Erro geral no signup:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('já está cadastrado') || error.message.includes('already registered')) {
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

  // ============================================================================
  // OUTRAS FUNÇÕES
  // ============================================================================

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('👋 Fazendo logout...');

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setUserProfile(null);
      profileCache.current = { profile: null, timestamp: 0 };
      
      console.log('✅ Logout realizado');
      
    } catch (error) {
      console.error('💥 Erro no logout:', error);
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
      
      profileCache.current = {
        profile: updatedProfile,
        timestamp: Date.now()
      };
      
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('💥 Erro ao votar:', error);
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
      
      profileCache.current = {
        profile: updatedProfile,
        timestamp: Date.now()
      };
      
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('💥 Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider'); 
  }
  return context;
};