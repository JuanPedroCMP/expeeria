import { MenuRecolhivel } from "./MenuRecolhivel/MenuRecolhivel";
import style from "./Navbar.module.css";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <>
      <nav className={style.Navbar}>
        <MenuRecolhivel />
        <h6>Expeeria</h6>
        <div>
          {user ? (
            <Link to="/perfil" className={style.profileBtn}>
              Meu Perfil
            </Link>
          ) : (
            <Link to="/login" className={style.loginBtn}>
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export { Navbar };