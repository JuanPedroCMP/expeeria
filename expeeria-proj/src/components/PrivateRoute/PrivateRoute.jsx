import { useAuth } from "../../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "../LoadingSpinner";

export function PrivateRoute({ children }) {
  const { user, loading, sessionChecked } = useAuth();
  const location = useLocation();

  // Mostra spinner de carregamento enquanto verifica a sessão
  if (loading || !sessionChecked) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh'
      }}>
        <LoadingSpinner />
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