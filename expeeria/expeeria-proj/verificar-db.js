console.log('Verificando banco de dados Expeeria...\n');

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Variáveis de ambiente não encontradas! Verifique seu arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarBD() {
  console.log('🔍 Consultando tabelas...');
  try {
    // Verificar tabela posts
    const { data: posts, error: postsError } = await supabase.from('posts').select('count');
    if (postsError) throw new Error(`Erro na tabela posts: ${postsError.message}`);
    console.log(`✅ Tabela posts: ${posts[0].count || 0} registros`);

    // Verificar tabela profiles
    const { data: profiles, error: profilesError } = await supabase.from('profiles').select('count');
    if (profilesError) throw new Error(`Erro na tabela profiles: ${profilesError.message}`);
    console.log(`✅ Tabela profiles: ${profiles[0].count || 0} registros`);

    // Verificar tabela comments
    const { data: comments, error: commentsError } = await supabase.from('comments').select('count');
    if (commentsError) throw new Error(`Erro na tabela comments: ${commentsError.message}`);
    console.log(`✅ Tabela comments: ${comments[0].count || 0} registros`);

    // Verificar tabela likes
    const { data: likes, error: likesError } = await supabase.from('likes').select('count');
    if (likesError) throw new Error(`Erro na tabela likes: ${likesError.message}`);
    console.log(`✅ Tabela likes: ${likes[0].count || 0} registros`);

    console.log('\n✅ Conexão com o banco de dados funcionando corretamente!');
  } catch (error) {
    console.error('\n❌ Erro ao verificar banco de dados:', error.message);
  }
}

verificarBD();