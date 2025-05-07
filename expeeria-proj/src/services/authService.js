import supabase from './supabase';

/**
 * Serviço de API para autenticação com Supabase
 */
export const authService = {
  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do usuário
   * @param {string} userData.email - Email do usuário
   * @param {string} userData.password - Senha do usuário
   * @param {string} userData.username - Nome de usuário
   * @param {string} userData.fullName - Nome completo do usuário
   * @returns {Promise} - Resultado da operação
   */
  async signUp(userData) {
    const { email, password, username, fullName } = userData;
    
    // Registrar o usuário no serviço de autenticação
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        }
      }
    });

    if (authError) throw authError;

    // Criar o perfil do usuário
    if (authData?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username,
          full_name: fullName,
          avatar_url: null,
          bio: '',
          created_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;
    }

    return authData;
  },

  /**
   * Autentica um usuário existente
   * @param {Object} credentials - Credenciais do usuário
   * @param {string} credentials.email - Email do usuário
   * @param {string} credentials.password - Senha do usuário
   * @returns {Promise} - Resultado da operação
   */
  async signIn(credentials) {
    const { email, password } = credentials;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Efetua logout do usuário
   * @returns {Promise} - Resultado da operação
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  },

  /**
   * Recupera a sessão atual
   * @returns {Promise} - Sessão atual
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  },

  /**
   * Recupera o usuário atual
   * @returns {Promise} - Usuário atual
   */
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data?.user;
  },

  /**
   * Envia email para recuperação de senha
   * @param {string} email - Email do usuário
   * @returns {Promise} - Resultado da operação
   */
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    return true;
  },

  /**
   * Atualiza a senha do usuário
   * @param {string} newPassword - Nova senha
   * @returns {Promise} - Resultado da operação
   */
  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
    return true;
  },
};