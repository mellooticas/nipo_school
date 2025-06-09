import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; 

// Verificação das variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Erro: Variáveis de ambiente Supabase não estão definidas.");
  console.log("📝 Crie um arquivo .env.local com:");
  console.log("VITE_SUPABASE_URL=sua_url_aqui");
  console.log("VITE_SUPABASE_ANON_KEY=sua_chave_aqui");
  throw new Error("Configuração do Supabase incompleta");
}

// Criar cliente Supabase COM TYPES AUTOMÁTICOS 🚀
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

// Helper para debug simples (SEM requests automáticos)
export const logSupabaseConnection = () => {
  console.log('🔗 Supabase URL:', supabaseUrl ? '✅ Configurada' : '❌ Não encontrada');
  console.log('🔑 Supabase Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Não encontrada');
  console.log('📡 Cliente Supabase criado com superpoderes TypeScript! 🚀');
};

// Teste manual de conectividade COM TYPES
export const testarConexaoManual = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testando conexão manual...');
    
    // Teste simples - contar registros
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erro de conectividade:', error.message);
      return false;
    }
    
    console.log('✅ Conexão funcionando! Total profiles:', count);
    return true;
  } catch (err) {
    console.error('❌ Erro ao testar conexão:', err);
    return false;
  }
};

// Teste específico das tabelas COM TYPES
export const verificarTabelasManual = async () => {
  console.log('🔍 Verificando tabelas...');
  
  const tabelas = ['alunos', 'professores', 'professores_conteudos', 'profiles'] as const;
  const resultados: Record<string, { existe: boolean; count?: number; erro?: string }> = {};
  
  for (const tabela of tabelas) {
    try {
      const { data, error, count } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`❌ Erro na tabela ${tabela}:`, error.message);
        resultados[tabela] = { existe: false, erro: error.message };
      } else {
        console.log(`✅ Tabela ${tabela}: ${count} registros`);
        resultados[tabela] = { existe: true, count: count || 0 };
      }
    } catch (err: any) {
      console.error(`❌ Erro ao verificar ${tabela}:`, err);
      resultados[tabela] = { existe: false, erro: err.message };
    }
  }
  
  return resultados;
};

// Exportar types para uso fácil em outros arquivos
export type {
  Database,
  Tables,
  Inserts,
  Updates,
  Profile,
  Aluno,
  Professor,
  ProfessorConteudo,
  Module,
  Lesson,
  UserProgress,
  Achievement,
  UserAchievement,
  DevotionalContent,
  UserDevotionalProgress
} from '@/types/supabase';

// REMOVER auto-execução para evitar loop
// Apenas log simples
if (import.meta.env.DEV) {
  console.log('🔗 Supabase Client inicializado com TypeScript');
  logSupabaseConnection();
}

// Função global para debug manual (não automático)
if (typeof window !== 'undefined') {
  (window as any).testarSupabase = testarConexaoManual;
  (window as any).verificarTabelas = verificarTabelasManual;
}

// 🎯 EXEMPLO DE USO COM TYPES:
/*

// ✅ AGORA VOCÊ TEM AUTO-COMPLETE COMPLETO:

import { supabase, type Profile } from '@/shared/lib/supabase/supabaseClient';

// Buscar perfil com types automáticos
const { data: profile } = await supabase
  .from('profiles')  // ← Auto-complete de tabelas
  .select('full_name, email, total_points')  // ← Auto-complete de colunas
  .eq('id', userId)
  .single();

// profile agora tem tipo Profile automático! 🚀
console.log(profile?.full_name); // ← Type-safe

// Inserir dados com validação de tipos
const newProfile: Profile = {
  id: userId,
  full_name: "João Silva",
  email: "joao@email.com",
  total_points: 100,
  // ← VSCode vai sugerir todas as outras propriedades
};

*/