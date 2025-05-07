import { createClient } from '@supabase/supabase-js';

// Configuração para obter variáveis de ambiente independente do ambiente (Vite ou Node.js)
let supabaseUrl, supabaseAnonKey;

// Verificação se estamos em ambiente Node.js ou browser
if (typeof import.meta !== 'undefined' && import.meta.env) {
  // Ambiente Vite/browser
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
} else {
  // Ambiente Node.js - usando dotenv diretamente
  try {
    // Para execução direta via Node.js, definimos URLs fixas para teste
    supabaseUrl = 'https://bqjsyidyxnhungvniyij.supabase.co';
    supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxanN5aWR5eG5odW5ndm5peWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MzI5MDcsImV4cCI6MjA2MjIwODkwN30.dU4qcCV1D7zEI26Sxi2Hu8PKdJADpxf3l-tlXrqrWLw';
  } catch (error) {
    console.error('Erro ao carregar variáveis de ambiente:', error);
  }
}

// Validação das variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variáveis de ambiente do Supabase não encontradas');
}

// Criação do cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Adicionar as URLs para facilitar o debug
supabase.supabaseUrl = supabaseUrl;
supabase.supabaseAnonKey = supabaseAnonKey;

export default supabase;