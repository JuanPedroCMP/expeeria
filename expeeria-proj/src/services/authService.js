import supabase from './supabase';

/**
 * Serviço de API para autenticação com Supabase
 */
export const authService = {
  /**
   * Verifica se um email é válido
   * @param {string} email - Email a ser validado
   * @returns {boolean} - Se o email é válido
   */
  isValidEmail(email) {
    if (!email) return false;
    
    // Limpar espaços extras
    email = email.trim();
    
    // Regex melhorada para validação de email que suporta subdomínios múltiplos (.sp.gov, .co.uk, etc)
    // e caracteres internacionais nos domínios
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    // Verifica o formato e se tem pelo menos um ponto após o @
    if (!emailRegex.test(email)) return false;
    
    // Verificações adicionais
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    
    // Verificar parte local
    const localPart = parts[0];
    if (localPart.length === 0 || localPart.length > 64) return false;
    
    // Verificar domínio
    const domainPart = parts[1];
    if (domainPart.length === 0 || domainPart.length > 255 || !domainPart.includes('.')) return false;
    
    // Verificar se o TLD tem pelo menos 2 caracteres
    const tld = domainPart.split('.').pop();
    if (tld.length < 2) return false;
    
    return true;
  },

  /**
   * Função segura para verificar se uma string contém um texto
   * @param {string|undefined} text - Texto a ser verificado
   * @param {string} searchString - String a ser procurada
   * @returns {boolean} - Se a string contém o texto
   */
  safeIncludes(text, searchString) {
    return typeof text === 'string' && text.includes(searchString);
  },

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
    if (!userData) {
      throw new Error("Dados do usuário não fornecidos");
    }
    
    const { email, password, username, fullName } = userData;
    
    try {
      // Validar email antes de enviar para o Supabase
      if (!this.isValidEmail(email)) {
        throw new Error("Endereço de email inválido");
      }
      
      // Validar senha
      if (!password || password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
      }
      
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

      // Verificar se os dados do usuário foram retornados
      if (!authData?.user?.id) {
        throw new Error("Erro ao criar usuário: dados incompletos retornados");
      }

      console.log('Tentando criar perfil de usuário com ID:', authData.user.id);

      try {
        // Criar o perfil do usuário na tabela users
        const userData = {
          id: authData.user.id,
          email,
          password: '#hash_gerenciado_pelo_supabase_auth',  // O Supabase Auth gerencia as senhas
          username,
          name: fullName,
          bio: '',
          avatar: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role: 'user',
          status: 'active',
          metadata: JSON.stringify({
            lastLogin: new Date().toISOString(),
            loginCount: 1,
            preferences: {}
          })
        };

        console.log('Dados a serem inseridos:', userData);
        
        const { data: insertedProfile, error: profileError } = await supabase
          .from('users')
          .insert(userData)
          .select()
          .single();

        if (profileError) {
          console.error("Erro ao criar perfil:", profileError);
          console.error("Código do erro:", profileError.code);
          console.error("Mensagem do erro:", profileError.message);
          console.error("Detalhes:", profileError.details);
          // Não impede o fluxo principal, pois o usuário já foi criado
        } else {
          console.log('Perfil criado com sucesso:', insertedProfile);
        }
      } catch (profileErr) {
        console.error("Exceção ao criar perfil:", profileErr);
        // Não impede o fluxo principal, pois o usuário já foi criado
      }

      return authData;
    } catch (error) {
      console.error("Erro no registro:", error);
      
      // Traduzir mensagens de erro comuns para português
      if (error && error.message) {
        if (this.safeIncludes(error.message, "duplicate key value")) {
          throw new Error("Este email ou nome de usuário já está em uso");
        } else if (this.safeIncludes(error.message, "password")) {
          throw new Error("A senha deve ter pelo menos 6 caracteres");
        } else if (this.safeIncludes(error.message, "email") || this.safeIncludes(error.message, "Email")) {
          throw new Error("Endereço de email inválido. Verifique se está correto");
        } else if (this.safeIncludes(error.message, "User already registered")) {
          throw new Error("Este email já está registrado. Tente fazer login ou recuperar sua senha");
        } else {
          throw new Error(error.message);
        }
      }
      
      throw new Error("Erro ao cadastrar usuário. Tente novamente mais tarde.");
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
    if (!credentials) {
      throw new Error("Credenciais não fornecidas");
    }
    
    const { email, password } = credentials;
    
    try {
      // Validar email antes de enviar para o Supabase
      if (!this.isValidEmail(email)) {
        throw new Error("Endereço de email inválido");
      }

      if (!password) {
        throw new Error("A senha é obrigatória");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro no login:", error);
      
      // Traduzir mensagens de erro comuns para português
      if (error && error.message) {
        if (this.safeIncludes(error.message, "Invalid login credentials")) {
          throw new Error("Email ou senha incorretos");
        } else if (this.safeIncludes(error.message, "Email not confirmed")) {
          throw new Error("Email não confirmado. Verifique sua caixa de entrada");
        } else if (this.safeIncludes(error.message, "email") || this.safeIncludes(error.message, "Email")) {
          throw new Error("Endereço de email inválido");
        } else {
          throw new Error(error.message);
        }
      }
      
      throw new Error("Erro ao fazer login. Tente novamente mais tarde.");
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
      throw error && error.message 
        ? new Error(error.message)
        : new Error("Erro ao fazer logout. Tente novamente mais tarde.");
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
      throw error && error.message 
        ? new Error(error.message)
        : new Error("Erro ao obter sessão. Tente novamente mais tarde.");
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
      throw error && error.message 
        ? new Error(error.message)
        : new Error("Erro ao obter usuário atual. Tente novamente mais tarde.");
    }
  },

  /**
   * Envia email para recuperação de senha
   * @param {string} email - Email do usuário
   * @returns {Promise} - Resultado da operação
   */
  async resetPassword(email) {
    try {
      if (!this.isValidEmail(email)) {
        throw new Error("Endereço de email inválido");
      }
      
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
      if (!newPassword) {
        throw new Error("A nova senha é obrigatória");
      }
      
      if (newPassword.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
      }
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      
      if (error && error.message && this.safeIncludes(error.message, "weak")) {
        throw new Error("A senha é muito fraca. Use pelo menos 6 caracteres com letras e números");
      }
      
      throw error && error.message 
        ? new Error(error.message)
        : new Error("Erro ao atualizar senha. Tente novamente mais tarde.");
    }
  },
};