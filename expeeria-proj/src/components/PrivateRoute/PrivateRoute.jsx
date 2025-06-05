import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../LoadingSpinner';

/**
 * Componente para proteger rotas privadas
 * Redireciona o usuário para login se não estiver autenticado
 * Mostra fallback com spinner durante a verificação de sessão
 */
export function PrivateRoute({ children }) {
  const location = useLocation();
  const { user, loading, sessionChecked } = useAuth();

  const [showFallback, setShowFallback] = useState(false);
  const [authTimeout, setAuthTimeout] = useState(false);

  // ⏱️ Timeout de segurança: se verificação da sessão demorar mais de 3s
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading && !sessionChecked) {
        console.warn('[PrivateRoute] Timeout de autenticação atingido');
        setAuthTimeout(true);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [loading, sessionChecked]);

  // ⏳ Delay para exibir spinner apenas após 300ms de loading
  useEffect(() => {
    if (loading) {
      const fallbackTimer = setTimeout(() => setShowFallback(true), 300);
      return () => clearTimeout(fallbackTimer);
    }
    setShowFallback(false);
  }, [loading]);

  // 🔁 Redireciona para login se sessão falhou ou timeout foi acionado
  if ((sessionChecked && !user) || authTimeout) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message: authTimeout
            ? "Falha na verificação da sessão. Por favor, faça login novamente."
            : undefined
        }}
        replace
      />
    );
  }

  // ⌛ Fallback de carregamento durante autenticação
  if ((loading || !sessionChecked) && showFallback && !authTimeout) {
    return (
      <div className="auth-container fade-in">
        <div
          className="auth-card"
          style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}
        >
          <h3 className="mb-lg">Verificando autenticação...</h3>
          <div className="flex justify-center mb-lg">
            <LoadingSpinner size="lg" />
          </div>
          <p className="text-secondary">Aguarde enquanto verificamos sua sessão.</p>
        </div>
      </div>
    );
  }

  // 🔒 Usuário autenticado: renderiza conteúdo protegido
  return children;
}
