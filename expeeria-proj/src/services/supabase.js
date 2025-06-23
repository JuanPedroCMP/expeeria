/* eslint-disable no-undef */
import { createClient } from '@supabase/supabase-js';

// Configuração para obter variáveis de ambiente
let supabaseUrl, supabaseAnonKey;

// Verificação de ambiente
if (typeof import.meta !== 'undefined' && import.meta.env) {
  // Ambiente Vite/browser
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
} else {
  // Ambiente Node.js
  try {
    supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  } catch (error) {
    console.error('Erro ao carregar variáveis de ambiente:', error);
  }
}

// Validação das variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ ERRO: Variáveis de ambiente do Supabase não encontradas');
  console.error('Verifique se o arquivo .env.local contém VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
}

// Criação do cliente Supabase com configurações otimizadas
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sb-auth-token',
    detectSessionInUrl: false,
    flowType: 'implicit',
  },
  global: {
    headers: {
      'X-Client-Info': 'expeeria-webapp'
    }
  }
});

console.log('Cliente Supabase inicializado');

export default supabase;