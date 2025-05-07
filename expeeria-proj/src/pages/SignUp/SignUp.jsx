import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../../components/LoadingSpinner";
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
    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return false;
    }

    if (formData.username.length < 3) {
      setError("O nome de usuário deve ter pelo menos 3 caracteres");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    try {
      await register({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        fullName: formData.fullName
      });
      
      navigate("/login", { state: { message: "Cadastro realizado com sucesso! Faça login para continuar." } });
    } catch (err) {
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
