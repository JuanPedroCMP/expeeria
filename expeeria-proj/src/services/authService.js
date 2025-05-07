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
    
    try {
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
    } catch (error) {
      console.error("Erro no registro:", error);
      
      // Traduzir mensagens de erro comuns para português
      if (error.message.includes("duplicate key value")) {
        throw new Error("Este email ou nome de usuário já está em uso");
      } else if (error.message.includes("password")) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
      }
      
      throw error;
    }
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
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro no login:", error);
      
      // Traduzir mensagens de erro comuns para português
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Email ou senha incorretos");
      } else if (error.message.includes("Email not confirmed")) {
        throw new Error("Email não confirmado. Verifique sua caixa de entrada");
      }
      
      throw error;
    }
  },

  /**
   * Efetua logout do usuário
   * @returns {Promise} - Resultado da operação
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      throw error;
    }
  },

  /**
   * Recupera a sessão atual
   * @returns {Promise} - Sessão atual
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao obter sessão:", error);
      throw error;
    }
  },

  /**
   * Verifica se há uma sessão ativa e válida
   * @returns {Promise<boolean>} - Se existe uma sessão válida
   */
  async hasValidSession() {
    try {
      const { data } = await this.getSession();
      return !!(data?.session?.access_token && new Date(data.session.expires_at * 1000) > new Date());
    } catch (error) {
      console.error("Erro ao verificar sessão:", error);
      return false;
    }
  },

  /**
   * Recupera o usuário atual
   * @returns {Promise} - Usuário atual
   */
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data?.user;
    } catch (error) {
      console.error("Erro ao obter usuário atual:", error);
      throw error;
    }
  },

  /**
   * Envia email para recuperação de senha
   * @param {string} email - Email do usuário
   * @returns {Promise} - Resultado da operação
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erro ao solicitar redefinição de senha:", error);
      
      // Em caso de erro, não informamos se o email existe ou não por segurança
      return true;
    }
  },

  /**
   * Atualiza a senha do usuário
   * @param {string} newPassword - Nova senha
   * @returns {Promise} - Resultado da operação
   */
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      
      if (error.message.includes("weak")) {
        throw new Error("A senha é muito fraca. Use pelo menos 6 caracteres com letras e números");
      }
      
      throw error;
    }
  },
};