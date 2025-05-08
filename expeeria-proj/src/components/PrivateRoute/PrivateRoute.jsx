import { useAuth } from "../../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "../LoadingSpinner";

export function PrivateRoute({ children }) {
  const { user, loading, sessionChecked } = useAuth();
  const location = useLocation();

  // Mostra spinner de carregamento enquanto verifica a sessão
  if (loading || !sessionChecked) {
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