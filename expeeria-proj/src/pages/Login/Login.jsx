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
    <div className={`${styles.loginContainer} auth-container slide-up fade-in`}>
      <div className="auth-card">
        <form onSubmit={handleSubmit} className={`${styles.authForm} form-enhanced`}>
          <h2 className="text-center mb-lg">Boas-vindas à Expeeria</h2>
          
          {successMessage && (
            <div className="alert alert-success mb-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {successMessage}
            </div>
          )}
          
          <div className={`${styles.formGroup} form-group floating-label`}>
            <input
              id="email"
              type="email"
              className="input-enhanced"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <label htmlFor="email">E-mail</label>
          </div>
          
          <div className={`${styles.formGroup} form-group floating-label`}>
            <input
              id="password"
              type="password"
              className="input-enhanced"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <label htmlFor="password">Senha</label>
          </div>
          
          <div className={`${styles.forgotPassword} text-right mb-md`}>
            <Link to="/recuperar-senha" className="link-enhanced">Esqueceu sua senha?</Link>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block btn-lg ripple-effect"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" /> : "Entrar"}
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
          
          <div className={`${styles.registerLink} text-center mt-lg`}>
            <p>Não tem conta ainda?</p>
            <Link to="/signup" className="btn btn-outline mt-sm ripple-effect">Criar conta</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
