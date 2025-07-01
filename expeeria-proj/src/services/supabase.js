import { createClient } from '@supabase/supabase-js';

let supabaseUrl, supabaseAnonKey;

// Verificação de ambiente
if (typeof import.meta !== 'undefined' && import.meta.env) {
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
} else {
  try {
    supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  } catch (error) {
    console.error('Erro ao carregar variáveis de ambiente:', error);
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠ ERRO: Variáveis de ambiente do Supabase não encontradas');
  console.error('Verifique se o arquivo .env.local contém VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
}

// Criação do cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce' // Adiciona PKCE para segurança
  },
  global: {
    headers: {
      'X-Client-Info': 'expeeria-webapp'
    }
  }
});

console.log('Cliente Supabase inicializado');

// Export default para compatibilidade com AuthContext
export default supabase;

// Export nomeado para compatibilidade com outros arquivos
export { supabase };