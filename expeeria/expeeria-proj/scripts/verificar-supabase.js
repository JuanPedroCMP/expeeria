// Script para verificar a conexu00e3o e acesso ao Supabase

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Carregar variáveis de ambiente do arquivo .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

let supabaseUrl;
let supabaseAnonKey;

if (fs.existsSync(envPath)) {
  console.log(`Carregando variáveis de ambiente de ${envPath}...`);
  
  // Ler e fazer parse manual do arquivo .env.local
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  const envValues = {};
  envLines.forEach(line => {
    if (!line || line.startsWith('#')) return;
    
    const [key, ...valueParts] = line.split('=');
    if (!key) return;
    
    let value = valueParts.join('=').trim();
    
    // Remover aspas se existirem
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith('\'') && value.endsWith('\''))){
      value = value.slice(1, -1);
    }
    
    envValues[key.trim()] = value;
  });
  
  supabaseUrl = envValues.VITE_SUPABASE_URL;
  supabaseAnonKey = envValues.VITE_SUPABASE_ANON_KEY;
} else {
  console.error(`Arquivo .env.local não encontrado em ${envPath}`);
  process.exit(1);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\u274C Variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas no arquivo .env.local');
  process.exit(1);
}

console.log(`URL do Supabase encontrada: ${supabaseUrl.substring(0, 20)}...`);
console.log(`Chave anônima do Supabase encontrada: ${supabaseAnonKey.substring(0, 5)}...`);

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Verifica se a conexu00e3o com o Supabase estu00e1 funcionando
async function verificarConexao() {
  console.log('Verificando conexu00e3o com o Supabase...');
  
  try {
    // 1. Teste de conexu00e3o bu00e1sica
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('\u274C Erro na conexu00e3o com o Supabase:', error.message);
      console.error('Detalhes do erro:', error);
      return false;
    }
    
    console.log('\u2705 Conexu00e3o com o Supabase estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('\u274C Erro inesperado ao testar conexu00e3o:', error.message);
    return false;
  }
}

// Verifica acesso u00e0s tabelas principais
async function verificarTabelas() {
  console.log('\nVerificando acesso u00e0s tabelas principais...');
  
  const tabelas = [
    'users',
    'posts',
    'comments',
    'post_likes',
    'comment_likes',
    'post_categories',
    'post_tags',
    'user_followers',
    'user_interests'
  ];
  
  const resultados = {};
  
  for (const tabela of tabelas) {
    try {
      const { data, error, count } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`\u274C Erro ao acessar tabela ${tabela}:`, error.message);
        resultados[tabela] = false;
      } else {
        console.log(`\u2705 Tabela ${tabela} acessu00edvel! (${count || 0} registros)`);
        resultados[tabela] = true;
      }
    } catch (error) {
      console.error(`\u274C Erro inesperado ao acessar tabela ${tabela}:`, error.message);
      resultados[tabela] = false;
    }
  }
  
  return resultados;
}

// Verificar estrutura do banco de dados
async function verificarEstrutura() {
  console.log('\nVerificando estrutura da tabela de usuu00e1rios...');
  
  try {
    // Verificar campos da tabela users
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single();
    
    if (userError) {
      console.error('\u274C Erro ao verificar estrutura da tabela users:', userError.message);
      return false;
    }
    
    if (user) {
      console.log('\u2705 Estrutura da tabela users verificada com sucesso!');
      console.log('Campos disponibilizados:', Object.keys(user).join(', '));
      return true;
    } else {
      console.warn('\u26A0 Nenhum usuu00e1rio encontrado para verificar estrutura.');
      return true;
    }
  } catch (error) {
    console.error('\u274C Erro inesperado ao verificar estrutura:', error.message);
    return false;
  }
}

// Verificar integridadade dos posts
async function verificarPosts() {
  console.log('\nVerificando estrutura da tabela de posts...');
  
  try {
    // Verificar campos da tabela posts
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select(`
        *,
        users!author_id (id, username, name),
        comments!post_id (count),
        post_likes!post_id (count),
        post_categories!post_id (category)
      `)
      .limit(1)
      .single();
    
    if (postError) {
      console.error('\u274C Erro ao verificar estrutura da tabela posts:', postError.message);
      return false;
    }
    
    if (post) {
      console.log('\u2705 Estrutura da tabela posts verificada com sucesso!');
      console.log('Campos principais:', Object.keys(post).filter(k => !['users', 'comments', 'post_likes', 'post_categories'].includes(k)).join(', '));
      console.log('Relau00e7u00f5es verificadas: users, comments, post_likes, post_categories');
      return true;
    } else {
      console.warn('\u26A0 Nenhum post encontrado para verificar estrutura.');
      return true;
    }
  } catch (error) {
    console.error('\u274C Erro inesperado ao verificar estrutura de posts:', error.message);
    return false;
  }
}

// Executar as verificau00e7u00f5es
async function executarVerificacoes() {
  console.log('======== INICIANDO VERIFICAU00c7U00d5ES DO SUPABASE ========');
  console.log(`Data e hora: ${new Date().toLocaleString()}\n`);
  
  // Verificar conexu00e3o
  const conexaoOk = await verificarConexao();
  if (!conexaoOk) {
    console.error('\nVerificau00e7u00f5es interrompidas devido a erro na conexu00e3o.\n');
    return false;
  }
  
  // Verificar acesso u00e0s tabelas
  const tabelasOk = await verificarTabelas();
  const todasTabelasOk = Object.values(tabelasOk).every(result => result);
  
  if (!todasTabelasOk) {
    console.warn('\nAlgumas tabelas apresentaram erros de acesso.\n');
  }
  
  // Verificar estrutura
  const estruturaOk = await verificarEstrutura();
  
  // Verificar posts
  const postsOk = await verificarPosts();
  
  console.log('\n======== RESUMO DAS VERIFICAU00c7U00d5ES ========');
  console.log(`Conexu00e3o: ${conexaoOk ? '\u2705 OK' : '\u274C Falha'}`);
  console.log(`Acesso a todas as tabelas: ${todasTabelasOk ? '\u2705 OK' : '\u274C Falha'}`);
  console.log(`Estrutura de usuu00e1rios: ${estruturaOk ? '\u2705 OK' : '\u274C Falha'}`);
  console.log(`Estrutura de posts: ${postsOk ? '\u2705 OK' : '\u274C Falha'}`);
  
  const sucessoTotal = conexaoOk && todasTabelasOk && estruturaOk && postsOk;
  console.log(`\nResultado geral: ${sucessoTotal ? '\u2705 SUCESSO' : '\u274C CORREU00c7U00d5ES NECESSARIAS'}`);
  
  return sucessoTotal;
}

// Para execução em Node.js
executarVerificacoes();
