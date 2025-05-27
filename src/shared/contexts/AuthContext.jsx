import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Evita hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Função para buscar perfil
  const fetchUserProfile = async (userId) => {
    if (!userId) return null;
    
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
      
      setUserProfile(data);
      return data;
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
        // Verificar sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted) {
          if (session?.user) {
            setUser(session.user);
            await fetchUserProfile(session.user.id);
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
            
            console.log('Auth state changed:', event, session?.user?.email);
            
            if (session?.user) {
              setUser(session.user);
              
              // Se é um novo usuário (evento 'SIGNED_UP'), aguardar um pouco para o trigger criar o perfil
              if (event === 'SIGNED_UP') {
                console.log('Novo usuário detectado, aguardando criação do perfil...');
                // Aguardar 2 segundos para o trigger processar
                setTimeout(async () => {
                  await fetchUserProfile(session.user.id);
                }, 2000);
              } else {
                await fetchUserProfile(session.user.id);
              }
            } else {
              setUser(null);
              setUserProfile(null);
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

  // Métodos de autenticação
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log('Login bem-sucedido:', data.user.email);
      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      
      console.log('Iniciando signup com dados:', { email, userData });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName || '',
            dob: userData.dob || '',
            instrument: userData.instrument || '',
            user_level: 'beginner',
            theme_preference: 'light',
            notification_enabled: true,
            sound_enabled: true
          },
        },
      });
      
      if (error) throw error;
      
      console.log('Signup bem-sucedido:', {
        user: data.user?.email,
        metadata: data.user?.user_metadata
      });
      
      return data.user;
    } catch (error) {
      console.error('Erro no signup:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setUserProfile(null);
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const recordVote = async (logoId) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ voted_logo: logoId, has_voted: true })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setUserProfile(prev => ({ 
        ...prev, 
        voted_logo: logoId, 
        has_voted: true 
      }));
      
      return data;
    } catch (error) {
      console.error('Erro ao votar:', error);
      throw error;
    }
  };

  // Função para atualizar perfil manualmente (fallback)
  const updateProfile = async (profileData) => {
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
      
      setUserProfile(data);
      return data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  // Não renderizar no servidor para evitar hydration issues
  if (!mounted) {
    return null;
  }

  const value = {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};