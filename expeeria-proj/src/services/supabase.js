import { createClient } from '@supabase/supabase-js';

// Configuração para obter variáveis de ambiente independente do ambiente (Vite ou Node.js)
let supabaseUrl, supabaseAnonKey;

// Verificação se estamos em ambiente Vite/browser ou Node.js
if (typeof import.meta !== 'undefined' && import.meta.env) {
  // Ambiente Vite/browser
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Registro para depuração durante o desenvolvimento
  if (import.meta.env.DEV) {
    console.log('Configuração do Supabase (DEV):', {
      url: supabaseUrl ? 'Definida' : 'Não definida',
      key: supabaseAnonKey ? 'Definida' : 'Não definida'
    });
  }
} else {
  // Ambiente Node.js - usando variáveis de ambiente do sistema
  try {
    // Verificar as variáveis de ambiente do Node.js
    supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  } catch (error) {
    console.error('Erro ao carregar variáveis de ambiente:', error);
  }
}

// Validação das variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ ERRO CRÍTICO: Variáveis de ambiente do Supabase não encontradas');
  console.error('Por favor, verifique se o arquivo .env.local contém VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
  
  // Em ambiente de desenvolvimento, fornecer instruções úteis
  if (typeof window !== 'undefined') {
    // Em ambiente browser
    alert('Configuração do Supabase incompleta. Verifique o console para mais informações.');
  }
}

// Criação do cliente Supabase com configurações adicionais para evitar problemas de CORS
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Configurações para contornar problemas de CORS
    detectSessionInUrl: false,
    flowType: 'implicit',
  },
  // Configurações globais para fetch
  global: {
    fetch: (...args) => fetch(...args)
  }
});

// Adicionar as URLs para facilitar o debug
supabase.supabaseUrl = supabaseUrl;
supabase.supabaseAnonKey = supabaseAnonKey;

export default supabase;