import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Evita hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirecionamento baseado no voto e tipo de usuário
  const redirectByVote = (profile) => {
    console.log('Redirecionando com perfil:', profile);
    console.log('has_voted?', profile?.has_voted);
    console.log('tipo_usuario:', profile?.tipo_usuario);
    console.log('current path:', location.pathname);

    if (!profile) return;

    // Se o usuário ainda não votou, sempre vai para votação
    if (profile.has_voted !== true) {
      // MAS só se não estiver já na página de vote ou em outras páginas específicas
      if (location.pathname !== '/vote') {
        navigate('/vote');
      }
      return;
    }

    // Se já votou, verificar se está tentando acessar uma área específica
    const currentPath = location.pathname;
    
    // Rotas que não devemos redirecionar automaticamente
    const specificRoutes = [
      '/professores',
      '/modulos', 
      '/conquistas',
      '/devocional',
      '/perfil',
      '/vote',        // Permitir acesso ao vote mesmo se já votou
      '/instrumentos' // Permitir acesso aos instrumentos
    ];

    // Se já está em uma rota específica, não redirecionar
    const isInSpecificRoute = specificRoutes.some(route => 
      currentPath.startsWith(route)
    );

    if (isInSpecificRoute) {
      console.log('Usuário já está em rota específica, mantendo posição');
      return;
    }

    // Se não está em rota específica, redirecionar para dashboard padrão
    navigate('/dashboard');
  };

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
        const { data: { session } } = await supabase.auth.getSession();

        if (isMounted) {
          if (session?.user) {
            setUser(session.user);
            const profile = await fetchUserProfile(session.user.id);
            
            // Só redirecionar se não estiver em página específica
            if (!location.pathname.startsWith('/professores') && 
                !location.pathname.startsWith('/instrumentos') &&
                !location.pathname.startsWith('/vote')) {
              redirectByVote(profile);
            }
          } else {
            setUser(null);
            setUserProfile(null);
          }
          setLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMounted) return;

            console.log('Auth state changed:', event, session?.user?.email);

            if (session?.user) {
              setUser(session.user);

              if (event === 'SIGNED_UP') {
                console.log('Novo usuário detectado, aguardando criação do perfil...');
                setTimeout(async () => {
                  const profile = await fetchUserProfile(session.user.id);
                  redirectByVote(profile);
                }, 2000);
              } else {
                const profile = await fetchUserProfile(session.user.id);
                
                // Só redirecionar se não for evento de refresh/reload em página específica
                if (event === 'INITIAL_SESSION' && (
                    location.pathname.startsWith('/professores') ||
                    location.pathname.startsWith('/instrumentos') ||
                    location.pathname.startsWith('/vote')
                  )) {
                  console.log('Sessão inicial em área específica, não redirecionando');
                } else {
                  redirectByVote(profile);
                }
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
  }, [mounted, location.pathname]);

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
            tipo_usuario: userData.tipo_usuario || 'aluno', // Adicionar tipo_usuario
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