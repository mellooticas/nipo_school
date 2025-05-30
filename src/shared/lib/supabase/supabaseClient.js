import { createClient } from '@supabase/supabase-js';

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

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
  console.log('📡 Cliente Supabase criado com sucesso');
};

// Teste manual de conectividade (só quando chamado explicitamente)
export const testarConexaoManual = async () => {
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

// Teste específico das tabelas (manual)
export const verificarTabelasManual = async () => {
  console.log('🔍 Verificando tabelas...');
  
  const tabelas = ['alunos', 'professores', 'professores_conteudos', 'profiles'];
  const resultados = {};
  
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
        resultados[tabela] = { existe: true, count };
      }
    } catch (err) {
      console.error(`❌ Erro ao verificar ${tabela}:`, err);
      resultados[tabela] = { existe: false, erro: err.message };
    }
  }
  
  return resultados;
};

// REMOVER auto-execução para evitar loop
// Apenas log simples
if (import.meta.env.DEV) {
  console.log('🔗 Supabase Client inicializado');
  logSupabaseConnection();
}

// Função global para debug manual (não automático)
if (typeof window !== 'undefined') {
  window.testarSupabase = testarConexaoManual;
  window.verificarTabelas = verificarTabelasManual;
}