import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
            
            if (session?.user) {
              setUser(session.user);
              await fetchUserProfile(session.user.id);
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
  }, []);

  // Métodos de autenticação
  const login = async (email, password) => {
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

  const signup = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            dob: userData.dob,
            instrument: userData.instrument,
          },
        },
      });
      
      if (error) throw error;
      
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

  const value = {
    user,
    userProfile,
    loading,
    login,
    signup,
    logout,
    recordVote,
    fetchUserProfile,
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