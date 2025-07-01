export function resetSiteData() {
  try {
    console.log('🔄 Limpando dados do site...');

    // Limpa localStorage
    localStorage.clear();

    // Limpa sessionStorage
    sessionStorage.clear();

    // Limpa cookies (opcional)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    console.log('✅ Dados do site limpos com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao limpar dados do site:', error);
  }
}
