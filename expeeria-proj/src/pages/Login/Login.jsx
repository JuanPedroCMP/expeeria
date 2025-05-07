import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import styles from "./Login.module.css";

export function Login() {
  const { login, loading, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  
  // Verificar se existe uma rota de redirecionamento
  const from = location.state?.from || "/";
  
  // Verificar se existe uma mensagem de sucesso
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Limpar a mensagem do estado para não exibi-la novamente após navegações
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    try {
      await login(email, password);
      // Redireciona para a página anterior ou para a home
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "E-mail ou senha inválidos.");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <h2>Entrar</h2>
        
        {successMessage && (
          <p className={styles.successMessage}>
            {successMessage}
          </p>
        )}
        
        <div className={styles.formGroup}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <div className={styles.forgotPassword}>
          <Link to="/recuperar-senha">Esqueceu sua senha?</Link>
        </div>
        
        <button 
          type="submit" 
          className={styles.loginButton}
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="sm" /> : "Entrar"}
        </button>
        
        {(error || authError) && (
          <p className={styles.errorMessage}>
            {error || authError}
          </p>
        )}
        
        <div className={styles.registerLink}>
          Não tem conta ainda? <Link to="/signup">Cadastre-se</Link>
        </div>
      </form>
    </div>
  );
}
