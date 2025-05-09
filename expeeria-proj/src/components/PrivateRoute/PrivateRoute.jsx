import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "../LoadingSpinner";

export function PrivateRoute({ children }) {
  // Obter dados de autenticação
  const { user, loading, sessionChecked } = useAuth();
  const location = useLocation();
  
  // Anti-bloqueio: usar um timeout para evitar a tela de carregamento interminável
  const [timeoutReached, setTimeoutReached] = useState(false);
  
  // Configurar timeout de segurança (3 segundos)
  useEffect(() => {
    // Se estiver carregando, iniciar timeout
    if (loading) {
      const timer = setTimeout(() => {
        console.log('Timeout de segurança do PrivateRoute acionado!');
        setTimeoutReached(true);
      }, 3000);
      
      // Limpar timeout se o carregamento terminar
      return () => clearTimeout(timer);
    }
  }, [loading]);
  
  // Verificação para possível bloqueio
  const possibleBlockage = loading && !sessionChecked && !timeoutReached;
  
  // Log para depuração
  console.log('PrivateRoute - Estado atual:', { 
    temUsuario: !!user, 
    loading, 
    sessionChecked, 
    timeoutReached, 
    possibleBlockage
  });
  
  // Mostra spinner de carregamento somente por um tempo limitado
  if (possibleBlockage) {
    return (
      <div className="auth-container fade-in">
        <div className="auth-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
          <h3 className="mb-lg">Verificando autenticação...</h3>
          <div className="flex justify-center mb-lg">
            <LoadingSpinner size="lg" />
          </div>
          <p className="text-secondary">Aguarde enquanto verificamos sua sessão.</p>
        </div>
      </div>
    );
  }

  // Redireciona para login se não houver usuário autenticado
  // Preserva a rota original no state para redirecionamento após login
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Renderiza o conteúdo protegido
  return children;
}