import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../LoadingSpinner';

// Componente para rota protegida - versão aprimorada para maior confiabilidade
export function PrivateRoute({ children }) {
  const location = useLocation();
  const { user, loading, sessionChecked } = useAuth();
  const [showFallback, setShowFallback] = useState(false);
  const [authTimeout, setAuthTimeout] = useState(false);
  
  // Timeout de segurança para não deixar usuário preso em tela de loading
  useEffect(() => {
    // Se demorar mais de 3 segundos para verificar a sessão, considera um timeout
    const securityTimer = setTimeout(() => {
      if (loading && !sessionChecked) {
        console.warn('Timeout de autenticação acionado no PrivateRoute');
        setAuthTimeout(true);
      }
    }, 3000);
    
    return () => clearTimeout(securityTimer);
  }, [loading, sessionChecked]);
  
  // Redireciona para login se:
  // 1. A sessão foi verificada e não há usuário, ou
  // 2. Ocorreu um timeout de autenticação
  if ((sessionChecked && !user) || authTimeout) {
    console.log('Redirecionando para login: sessionChecked=', sessionChecked, 'user=', !!user, 'authTimeout=', authTimeout);
    return <Navigate to="/login" state={{ from: location, message: authTimeout ? "Falha na verificação da sessão. Por favor, faça login novamente." : undefined }} replace />;
  }
  
  // Efeito para mostrar o fallback após 300ms se ainda estiver carregando
  useEffect(() => {
    // Só mostra o fallback se estiver carregando para evitar flash
    if (loading) {
      const timer = setTimeout(() => setShowFallback(true), 300);
      return () => clearTimeout(timer);
    }
    
    setShowFallback(false);
  }, [loading]);
  
  // Se ainda está carregando e passou tempo suficiente, mostra o spinner
  if ((loading || !sessionChecked) && showFallback && !authTimeout) {
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