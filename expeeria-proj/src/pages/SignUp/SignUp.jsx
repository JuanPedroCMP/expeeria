import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { isValidEmail, isStrongPassword, isValidUsername } from "../../utils/validation";
import styles from "./SignUp.module.css";

export function SignUp() {
  const { register, loading, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
    <div className={styles.signupContainer}>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <h2>Criar Conta</h2>
        
        <div className={styles.formGroup}>
          <label htmlFor="fullName">Nome Completo</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="username">Nome de Usuário</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Seu identificador único"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="exemplo@dominio.com"
            pattern="[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*"
            title="Digite um e-mail válido como exemplo@dominio.com ou nome@etec.sp.gov.br"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            disabled={loading}
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">Confirmar Senha</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className={styles.signupButton}
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="sm" /> : "Cadastrar"}
        </button>
        
        {(error || authError) && (
          <p className={styles.errorMessage}>
            {error || authError}
          </p>
        )}
        
        <div className={styles.loginLink}>
          Já tem uma conta? <Link to="/login">Entrar</Link>
        </div>
      </form>
    </div>
  );
}
