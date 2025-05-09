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
   * @returns {Promise<Object>} - Objeto contendo dados do usuário e sessão
   */
  async signUp(userData) {
    if (!userData) {
      throw new Error("Dados do usuário não fornecidos");
    }
    
    const { email, password, username, fullName } = userData;
    
    try {
      console.log('Iniciando cadastro de usuário:', { email, username });
      
      // Validar email antes de enviar para o Supabase
      if (!this.isValidEmail(email)) {
        throw new Error("Endereço de email inválido");
      }
      
      // Validar senha
      if (!password || password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
      }
      
      // Verificar se o username já existe antes de tentar criar
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .maybeSingle();
        
      if (existingUser) {
        throw new Error("Este nome de usuário já está em uso. Escolha outro.");
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

      console.log('Usuário criado com sucesso, ID:', authData.user.id);

      // Criar o perfil do usuário na tabela users
      try {
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

        console.log('Criando perfil de usuário...');
        
        const { data: insertedProfile, error: profileError } = await supabase
          .from('users')
          .insert(userData)
          .select()
          .single();

        if (profileError) {
          console.error("Erro ao criar perfil:", profileError);
          
          if (profileError.code === '23505') { // Código de erro para chave duplicada
            throw new Error("Este email ou nome de usuário já está em uso.");
          }
          
          if (profileError.code) {
            // Se for um problema na inserção do perfil, é um erro crítico que deve interromper o fluxo
            throw new Error(`Erro ao criar perfil: ${profileError.message || 'Erro desconhecido'}`);
          }
        }
        
        console.log('Perfil criado com sucesso!');
        
        // Retornar os dados completos (incluindo o perfil)
        return {
          user: {
            ...authData.user,
            ...insertedProfile
          },
          session: authData.session
        };
      } catch (profileErr) {
        console.error("Exceção ao criar perfil:", profileErr);
        // Se for um erro específico que definimos acima, devemos propagá-lo
        if (profileErr.message && profileErr.message.includes('já está em uso')) {
          throw profileErr;
        }
        
        // Para outros erros, pelo menos retornamos o usuário básico
        return {
          user: authData.user,
          session: authData.session
        };
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
    try {
      if (!credentials) {
        throw new Error("Credenciais não fornecidas");
      }
      
      const { email, password } = credentials;
      
      // Validar email antes de enviar para o Supabase
      if (!this.isValidEmail(email)) {
        throw new Error("Endereço de email inválido");
      }
      
      // Validar senha
      if (!password) {
        throw new Error("Senha obrigatória");
      }
      
      console.log("Tentando login com:", { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log("Login bem-sucedido, verificando perfil do usuário");
      
      // Devemos garantir que temos um perfil completo do usuário
      if (data && data.user) {
        try {
          // Buscar o perfil completo do usuário
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (profileError) {
            console.warn("Erro ao buscar perfil do usuário, usando dados básicos:", profileError);
            
            // Mesmo sem perfil completo, retornamos o usuário básico
            return {
              user: data.user,
              session: data.session
            };
          }
          
          if (!userProfile) {
            console.warn("Perfil do usuário não encontrado. Criando perfil básico...");
            
            // Se o perfil não existir, podemos tentar criá-lo
            const defaultProfile = {
              id: data.user.id,
              email: data.user.email,
              username: data.user.email.split('@')[0], // Username básico
              name: data.user.email.split('@')[0], // Nome básico 
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              status: 'active',
              role: 'user'
            };
            
            // Criar um perfil básico
            const { data: newProfile, error: insertError } = await supabase
              .from('users')
              .insert(defaultProfile)
              .select()
              .single();
            
            if (insertError) {
              console.error("Falha ao criar perfil básico:", insertError);
              // Continuar com o usuário básico
            } else {
              console.log("Perfil básico criado com sucesso");
              return {
                user: { ...data.user, ...newProfile },
                session: data.session
              };
            }
          } else {
            console.log("Perfil do usuário encontrado");
            // Mesclar dados de autenticação com perfil do usuário
            return {
              user: { ...data.user, ...userProfile },
              session: data.session
            };
          }
        } catch (profileError) {
          console.error("Erro ao processar perfil:", profileError);
        }
      }
      
      // Formatação padrão de retorno
      return {
        user: data.user,
        session: data.session
      };
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      
      // Tratar erros específicos para mensagens mais amigáveis
      if (error.message) {
        if (this.safeIncludes(error.message, "Invalid login") || 
            this.safeIncludes(error.message, "Invalid email") || 
            this.safeIncludes(error.message, "Invalid password")) {
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