import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
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
  
  // Refs para evitar loops
  const hasRedirected = useRef(false);
  const isRedirecting = useRef(false);
  const lastProfileFetch = useRef(0);

  // Evita hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirecionamento CONTROLADO (sem loops)
  const redirectByVote = (profile, force = false) => {
    // Evitar múltiplos redirects simultâneos
    if (isRedirecting.current && !force) {
      console.log('Redirecionamento já em andamento, ignorando...');
      return;
    }

    console.log('Redirecionando com perfil:', profile);
    console.log('has_voted?', profile?.has_voted);
    console.log('tipo_usuario:', profile?.tipo_usuario);
    console.log('current path:', location.pathname);

    if (!profile) return;

    isRedirecting.current = true;

    // Se o usuário ainda não votou, sempre vai para votação
    if (profile.has_voted !== true) {
      if (location.pathname !== '/vote') {
        console.log('Redirecionando para vote');
        navigate('/vote', { replace: true });
      }
      isRedirecting.current = false;
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
      '/vote',
      '/instrumentos'
    ];

    // Se já está em uma rota específica, não redirecionar
    const isInSpecificRoute = specificRoutes.some(route => 
      currentPath.startsWith(route)
    );

    if (isInSpecificRoute) {
      console.log('Usuário já está em rota específica, mantendo posição');
      isRedirecting.current = false;
      return;
    }

    // Se não está em rota específica E não redirecionou ainda, ir para dashboard
    if (!hasRedirected.current) {
      console.log('Redirecionando para dashboard');
      navigate('/dashboard', { replace: true });
      hasRedirected.current = true;
    }

    isRedirecting.current = false;
  };

  // Função para buscar perfil com CACHE
  const fetchUserProfile = async (userId, useCache = true) => {
    if (!userId) return null;

    // Cache simples - evitar requests muito frequentes
    const now = Date.now();
    if (useCache && (now - lastProfileFetch.current) < 5000) {
      console.log('Profile cache ainda válido, não buscando novamente');
      return userProfile;
    }

    try {
      console.log('Buscando perfil do usuário:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      lastProfileFetch.current = now;
      setUserProfile(data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      setUserProfile(null);
      return null;
    }
  };

  // Inicialização da autenticação - SEM DEPENDÊNCIA DE location.pathname
  useEffect(() => {
    if (!mounted) return;

    let isMounted = true;

    const initAuth = async () => {
      try {
        console.log('🔄 Inicializando autenticação...');
        
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

            console.log('Auth state changed:', event, session?.user?.email);

            if (session?.user) {
              setUser(session.user);

              if (event === 'SIGNED_UP') {
                console.log('Novo usuário detectado, aguardando criação do perfil...');
                setTimeout(async () => {
                  const profile = await fetchUserProfile(session.user.id, false);
                  redirectByVote(profile, true);
                }, 2000);
              } else if (event === 'SIGNED_IN') {
                const profile = await fetchUserProfile(session.user.id, false);
                redirectByVote(profile, true);
              } else if (event === 'INITIAL_SESSION') {
                // Para INITIAL_SESSION, não redirecionar automaticamente
                await fetchUserProfile(session.user.id, false);
                console.log('Sessão inicial carregada, mantendo posição atual');
              }

            } else {
              setUser(null);
              setUserProfile(null);
              hasRedirected.current = false; // Reset redirect flag
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
  }, [mounted]); // REMOVIDO location.pathname da dependência

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
      hasRedirected.current = false; // Reset para permitir redirect após login
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
            tipo_usuario: userData.tipo_usuario || 'aluno',
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

      hasRedirected.current = false; // Reset para permitir redirect após signup
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
      hasRedirected.current = false; // Reset redirect flag
      lastProfileFetch.current = 0; // Reset cache
      
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

      lastProfileFetch.current = 0; // Invalidar cache
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
      lastProfileFetch.current = 0; // Invalidar cache
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