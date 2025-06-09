import React, { createContext, useState, useEffect, useContext, useRef, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/supabaseClient';
import { getSmartRedirect } from '../services/redirectService';
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
  
  // Controle de redirecionamento
  const isRedirecting = useRef<boolean>(false);
  const profileCache = useRef<{ profile: UserProfile | null; timestamp: number }>({
    profile: null,
    timestamp: 0
  });

  // Evita hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirecionamento inteligente
  const redirectByVote = (profile: UserProfile | null, force: boolean = false): void => {
    if (isRedirecting.current && !force) {
      return;
    }

    if (!profile) {
      return;
    }

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

  // Busca perfil do usuário com cache inteligente
  const fetchUserProfile = async (userId: string, useCache: boolean = true): Promise<UserProfile | null> => {
    if (!userId) return null;

    // Cache - evitar requests frequentes
    const now = Date.now();
    const CACHE_DURATION = 30000; // 30 segundos

    if (useCache && profileCache.current.profile && (now - profileCache.current.timestamp) < CACHE_DURATION) {
      return profileCache.current.profile;
    }

    try {
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
        const profile = data as UserProfile;
        
        // Atualizar cache e estado
        profileCache.current = {
          profile,
          timestamp: now
        };
        
        setUserProfile(profile);
        return profile;
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

            if (session?.user) {
              setUser(session.user);

              if (event === 'SIGNED_UP') {
                // Aguardar criação do perfil no database
                setTimeout(async () => {
                  const profile = await fetchUserProfile(session.user.id, false);
                  redirectByVote(profile, true);
                }, 1500);
                
              } else if (event === 'SIGNED_IN') {
                const profile = await fetchUserProfile(session.user.id, false);
                redirectByVote(profile, true);
                
              } else if (event === 'INITIAL_SESSION') {
                // Para sessão inicial, não redirecionar automaticamente
                await fetchUserProfile(session.user.id, false);
              }

            } else {
              setUser(null);
              setUserProfile(null);
              // Reset cache
              profileCache.current = { profile: null, timestamp: 0 };
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
  }, [mounted]);

  // Login
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Signup - VERSÃO CORRIGIDA
  const signup = async (email: string, password: string, userData: SignupData = {}): Promise<User> => {
    try {
      setLoading(true);

      console.log('🚀 Iniciando signup com dados:', { email, userData });

      // 1. Criar usuário no Supabase Auth (SEM metadata complexo inicialmente)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            // Apenas dados básicos que sabemos que funcionam
            full_name: userData.fullName || '',
            tipo_usuario: userData.tipo_usuario || 'aluno'
          },
        },
      });

      if (error) {
        console.error('❌ Erro no auth.signUp:', error);
        throw error;
      }
      
      if (!data.user) {
        throw new Error('User creation failed - no user returned');
      }

      console.log('✅ Usuário criado no Auth:', data.user.id);

      // 2. Aguardar um pouco para o trigger processar
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Verificar se o perfil foi criado pelo trigger
      let profile = null;
      let attempts = 0;
      const maxAttempts = 5;

      while (!profile && attempts < maxAttempts) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!profileError && profileData) {
          profile = profileData;
          console.log('✅ Perfil encontrado via trigger');
          break;
        }

        attempts++;
        console.log(`⏳ Tentativa ${attempts}/${maxAttempts} - aguardando perfil...`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // 4. Se o perfil não foi criado pelo trigger, criar manualmente
      if (!profile) {
        console.log('⚠️ Perfil não criado por trigger, criando manualmente...');
        
        try {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: userData.fullName || '',
              dob: userData.dob || null,
              instrument: userData.instrument || '',
              tipo_usuario: userData.tipo_usuario || 'aluno',
              nome: userData.fullName || '',
              user_level: userData.user_level || 'beginner',
              theme_preference: userData.theme_preference || 'light',
              notification_enabled: userData.notification_enabled ?? true,
              sound_enabled: userData.sound_enabled ?? true,
              has_voted: false,
              total_points: 0,
              current_streak: 0,
              best_streak: 0,
              lessons_completed: 0,
              modules_completed: 0,
              joined_at: new Date().toISOString(),
              last_active: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) {
            console.error('❌ Erro ao criar perfil manualmente:', createError);
            
            // Se o perfil já existe (erro 23505), buscar ele
            if (createError.code === '23505') {
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
              
              profile = existingProfile;
              console.log('✅ Perfil já existia, usando existente');
            } else {
              throw createError;
            }
          } else {
            profile = newProfile;
            console.log('✅ Perfil criado manualmente');
          }
        } catch (manualError) {
          console.error('❌ Falha na criação manual do perfil:', manualError);
          // Não falhar o signup por causa do perfil
          console.log('⚠️ Continuando sem perfil - usuário pode criar depois');
        }
      }

      // 5. Atualizar cache se perfil foi criado
      if (profile) {
        profileCache.current = {
          profile: profile as UserProfile,
          timestamp: Date.now()
        };
        setUserProfile(profile as UserProfile);
      }

      console.log('🎉 Signup concluído com sucesso');
      return data.user;

    } catch (error) {
      console.error('💥 Erro geral no signup:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setUserProfile(null);
      
      // Reset cache
      profileCache.current = { profile: null, timestamp: 0 };
      
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Registrar voto
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
      
      // Atualizar cache e estado
      profileCache.current = {
        profile: updatedProfile,
        timestamp: Date.now()
      };
      
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Erro ao votar:', error);
      throw error;
    }
  };

  // Atualizar perfil
  const updateProfile = async (profileData: ProfileUpdateData): Promise<UserProfile> => {
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
      
      // Atualizar cache e estado
      profileCache.current = {
        profile: updatedProfile,
        timestamp: Date.now()
      };
      
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  // Evitar renderização durante hydration
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