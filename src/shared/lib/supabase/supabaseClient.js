import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; 

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Erro: Variáveis de ambiente Supabase não estão definidas.");
  console.log("📝 Crie um arquivo .env.local com:");
  console.log("VITE_SUPABASE_URL=sua_url_aqui");
  console.log("VITE_SUPABASE_ANON_KEY=sua_chave_aqui");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper para debug
export const logSupabaseConnection = () => {
  console.log('🔗 Supabase URL:', supabaseUrl ? '✅ Configurada' : '❌ Não encontrada');
  console.log('🔑 Supabase Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Não encontrada');
};