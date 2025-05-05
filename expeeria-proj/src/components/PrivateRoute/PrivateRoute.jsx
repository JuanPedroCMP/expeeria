import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}