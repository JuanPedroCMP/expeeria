import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { isValidEmail, isStrongPassword, isValidUsername } from "../../utils/validation";
import styles from "./SignUp.module.css";

export function SignUp() {
  const { register, loading, error: authError, user, sessionChecked } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirecionar usuários já autenticados
  useEffect(() => {
    if (sessionChecked && user) {
      navigate("/", { replace: true });
    }
  }, [user, sessionChecked, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Gera username automaticamente a partir do nome
    if (name === "fullName" && !formData.username) {
      const suggestedUsername = value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "");
      
      setFormData(prev => ({
        ...prev,
        username: suggestedUsername
      }));
    }
  };

  const validateForm = () => {
    // Validar e-mail
    if (!formData.email) {
      setError("O e-mail é obrigatório");
      return false;
    }

    if (!isValidEmail(formData.email)) {
      setError("Formato de e-mail inválido. Verifique se digitou corretamente");
      return false;
    }

    // Validar nome completo
    if (!formData.fullName.trim()) {
      setError("O nome completo é obrigatório");
      return false;
    }

    // Validar nome de usuário
    if (!formData.username) {
      setError("O nome de usuário é obrigatório");
      return false;
    }

    if (!isValidUsername(formData.username)) {
      setError("O nome de usuário deve ter entre 3 e 20 caracteres e conter apenas letras, números, underline e hífen");
      return false;
    }

    // Validar senha
    if (!formData.password) {
      setError("A senha é obrigatória");
      return false;
    }

    // Validação básica de senha - mínimo 6 caracteres
    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return false;
    }

    // Recomendar senha forte mas não obrigar
    if (!isStrongPassword(formData.password)) {
      console.warn("Senha fraca. Recomendado: pelo menos 8 caracteres com letras maiúsculas, minúsculas e números");
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    try {
      // Certifica-se que o e-mail esteja sem espaços extras
      const email = formData.email.trim();
      
      await register({
        email,
        password: formData.password,
        username: formData.username,
        fullName: formData.fullName
      });
      
      navigate("/login", { state: { message: "Cadastro realizado com sucesso! Faça login para continuar." } });
    } catch (err) {
      console.error("Erro durante o cadastro:", err);
      setError(err.message || "Erro ao cadastrar. Por favor, tente novamente.");
    }
  };

  return (
    <div className={`${styles.signupContainer} auth-container slide-up fade-in`}>
      <div className="auth-card">
        <form onSubmit={handleSubmit} className={`${styles.authForm} form-enhanced`}>
          <h2 className="text-center mb-lg">Crie sua conta</h2>
          <p className="text-center text-secondary mb-lg">Faça parte da comunidade Expeeria</p>
          
          <div className={`${styles.formGroup} form-group floating-label`}>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className="input-enhanced"
              placeholder=" "
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <label htmlFor="fullName">Nome Completo</label>
          </div>
          
          <div className={`${styles.formGroup} form-group floating-label`}>
            <input
              id="username"
              name="username"
              type="text"
              className="input-enhanced"
              placeholder=" "
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <label htmlFor="username">Nome de Usuário</label>
            <small className="form-hint">Seu identificador único na plataforma</small>
          </div>
          
          <div className={`${styles.formGroup} form-group floating-label`}>
            <input
              id="email"
              name="email"
              type="email"
              className="input-enhanced"
              placeholder=" "
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              title="Digite um e-mail válido como exemplo@dominio.com ou nome@etec.sp.gov.br"
            />
            <label htmlFor="email">E-mail</label>
          </div>
          
          <div className={`${styles.formGroup} form-group floating-label`}>
            <input
              id="password"
              name="password"
              type="password"
              className="input-enhanced"
              placeholder=" "
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              disabled={loading}
            />
            <label htmlFor="password">Senha</label>
            <small className="form-hint">Mínimo de 6 caracteres</small>
          </div>
          
          <div className={`${styles.formGroup} form-group floating-label`}>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="input-enhanced"
              placeholder=" "
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <label htmlFor="confirmPassword">Confirmar Senha</label>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block btn-lg ripple-effect mt-lg"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" /> : "Criar minha conta"}
          </button>
          
          {(error || authError) && (
            <div className="alert alert-error mt-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error || authError}
            </div>
          )}
          
          <div className={`${styles.loginLink} text-center mt-lg`}>
            <p>Já tem uma conta?</p>
            <Link to="/login" className="btn btn-outline mt-sm ripple-effect">Fazer login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
