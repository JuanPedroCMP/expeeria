// Arquivo para testar a conexão com o Supabase
import supabase from './src/services/supabase.js';

async function testSupabaseConnection() {
  console.log('Testando conexão com o Supabase...');
  console.log('URL do Supabase:', supabase.supabaseUrl);
  
  try {
    // Teste 1: Verificar a conexão com a API do Supabase
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error);
      return false;
    }
    
    console.log('Conexão com o Supabase bem-sucedida!');
    console.log('Dados recebidos:', data);
    
    // Teste 2: Verificar se a autenticação está funcionando
    const authResponse = await supabase.auth.getSession();
    console.log('Status da autenticação:', authResponse);
    
    // Teste 3: Verificar tabelas disponíveis
    try {
      console.log('Verificando tabelas disponíveis...');
      const tablesResponse = await supabase.rpc('list_tables');
      console.log('Tabelas disponíveis:', tablesResponse);
    } catch (tableError) {
      console.log('Não foi possível listar tabelas:', tableError);
      
      // Tentar verificar algumas tabelas específicas que provavelmente existem
      console.log('Tentando verificar tabelas específicas...');
      
      const tables = ['profiles', 'posts', 'comments', 'likes', 'notifications'];
      for (const table of tables) {
        const { error: tableError } = await supabase.from(table).select('count').limit(1);
        console.log(`Tabela ${table}: ${tableError ? 'Erro - ' + tableError.message : 'Disponível'}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Exceção ao testar conexão com o Supabase:', error);
    console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
    return false;
  }
}

testSupabaseConnection().then(success => {
  if (success) {
    console.log('✅ Supabase está configurado corretamente.');
  } else {
    console.log('❌ Há problemas na configuração do Supabase.');
    console.log('Verifique:');
    console.log('1. Se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env estão corretas');
    console.log('2. Se o projeto no Supabase está ativo e as políticas de segurança estão configuradas');
    console.log('3. Se as tabelas necessárias foram criadas no banco de dados');
  }
});