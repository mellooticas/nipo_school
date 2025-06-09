// types/auth.ts - Interfaces de autenticação e usuário

import { User } from '@supabase/supabase-js';

// Tipos de usuário disponíveis
export type UserType = 'admin' | 'professor' | 'aluno';

// Levels de usuário
export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

// Temas disponíveis
export type ThemePreference = 'light' | 'dark';

// ✅ Interface do Profile COMPLETA (baseado na estrutura real da tabela profiles)
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  dob?: string;
  instrument?: string;
  voted_logo?: string;
  has_voted: boolean;
  avatar_url?: string;
  church_name?: string;              // ← ADICIONADO
  user_level: UserLevel;
  total_points?: number;             // ← ADICIONADO
  bio?: string;                      // ← ADICIONADO
  phone?: string;                    // ← ADICIONADO
  city?: string;                     // ← ADICIONADO
  state?: string;                    // ← ADICIONADO
  joined_at?: string;                // ← ADICIONADO
  last_active?: string;
  current_streak?: number;           // ← ADICIONADO
  best_streak?: number;              // ← ADICIONADO
  lessons_completed?: number;        // ← ADICIONADO
  modules_completed?: number;        // ← ADICIONADO
  theme_preference: ThemePreference;
  notification_enabled: boolean;
  sound_enabled: boolean;
  tipo_usuario: UserType;
  nome?: string;                     // ← ADICIONADO
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
  church_name?: string;
  bio?: string;
  phone?: string;
  city?: string;
  state?: string;
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
  church_name?: string;
  bio?: string;
  phone?: string;
  city?: string;
  state?: string;
  total_points?: number;
  current_streak?: number;
  best_streak?: number;
  lessons_completed?: number;
  modules_completed?: number;
  nome?: string;
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