// types/auth.ts - Interfaces de autenticação e usuário

import { User } from '@supabase/supabase-js';

// Tipos de usuário disponíveis
export type UserType = 'admin' | 'professor' | 'aluno';

// Levels de usuário
export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

// Temas disponíveis
export type ThemePreference = 'light' | 'dark';

// Interface do Profile (baseado na tabela profiles do Supabase)
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  dob?: string;
  instrument?: string;
  tipo_usuario: UserType;
  user_level: UserLevel;
  theme_preference: ThemePreference;
  notification_enabled: boolean;
  sound_enabled: boolean;
  has_voted: boolean;
  voted_logo?: string;
  avatar_url?: string;
  created_at?: string;
  last_active?: string;
}

// Dados para signup
export interface SignupData {
  fullName?: string;
  dob?: string;
  instrument?: string;
  tipo_usuario?: UserType;
  user_level?: UserLevel;
  theme_preference?: ThemePreference;
  notification_enabled?: boolean;
  sound_enabled?: boolean;
}

// Dados para atualização de perfil
export interface ProfileUpdateData {
  full_name?: string;
  dob?: string;
  instrument?: string;
  tipo_usuario?: UserType;
  user_level?: UserLevel;
  theme_preference?: ThemePreference;
  notification_enabled?: boolean;
  sound_enabled?: boolean;
  avatar_url?: string;
}

// Context do Auth
export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, userData?: SignupData) => Promise<User>;
  logout: () => Promise<void>;
  recordVote: (logoId: string) => Promise<UserProfile>;
  fetchUserProfile: (userId: string, useCache?: boolean) => Promise<UserProfile | null>;
  updateProfile: (profileData: ProfileUpdateData) => Promise<UserProfile>;
}

// Dados de redirecionamento
export interface RedirectData {
  hasVoted: boolean;
  userType: UserType;
  currentPath: string;
  isSpecificRoute: boolean;
}

// Opções de redirecionamento
export interface RedirectOptions {
  force?: boolean;
  replace?: boolean;
}

// Resultado de redirecionamento
export interface RedirectResult {
  shouldRedirect: boolean;
  targetPath: string;
  reason: string;
}