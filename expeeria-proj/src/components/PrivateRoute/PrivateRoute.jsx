import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../LoadingSpinner';

// Componente para rota protegida - versão corrigida
export function PrivateRoute({ children }) {
  const location = useLocation();
  const { user, loading, sessionChecked } = useAuth();
  const [showSpinner, setShowSpinner] = useState(false);
  
  // Timeout para mostrar spinner após um delay
  useEffect(() => {
    if (loading && !sessionChecked) {
      const timer = setTimeout(() => setShowSpinner(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowSpinner(false);
    }
  }, [loading, sessionChecked]);

  // Se a sessão foi verificada e não há usuário, redireciona para login
  if (sessionChecked && !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Se ainda está verificando a sessão e passou tempo suficiente, mostra spinner
  if (!sessionChecked && showSpinner) {
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

  // Se não há usuário autenticado após verificação, redireciona
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Renderiza o conteúdo protegido
  return children;
}