import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { MenuRecolhivel } from "./MenuRecolhivel/MenuRecolhivel";
import { SearchBar } from "./SearchBar";
import { useAuth } from "../../hooks/useAuth";
import { Avatar } from "../Avatar/Avatar";
import { ThemeToggle } from "../ThemeToggle";
import styles from "./Navbar.module.css";

/**
 * Componente de Navbar melhorado com componentização e melhor organização
 */
export const Navbar = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair da conta?')) {
      logout();
      navigate('/login');
    }
  };
  
  const handleSearch = (query) => {
    // Redireciona para a página inicial com o termo de pesquisa
    navigate(`/?search=${encodeURIComponent(query)}`);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLeft}>
        <MenuRecolhivel />
        <Link to="/" className={styles.logo}>
          Expeeria
        </Link>
      </div>

      <div className={styles.navbarRight}>
        <Link to="/apresentacao" className={styles.navLink}>
          Sobre Expeeria
        </Link>
        {user ? (
          <>
            <Link to="/criar_post" className={styles.createPostBtn}>
              Novo Post
            </Link>
            
            <div className={styles.userContainer}>
              <div 
                className={styles.userProfile} 
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <Avatar 
                  src={user.avatar_url} 
                  username={user.username}
                  size="sm"
                  clickable
                />
                <span className={styles.username}>{user.username}</span>
              </div>
              
              {showUserMenu && (
                <div className={styles.userMenu}>
                  <Link to="/perfil" className={styles.menuItem}>
                    Meu Perfil
                  </Link>
                  <Link to="/explorar" className={styles.menuItem}>
                    Explorar
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className={styles.menuItem}
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={styles.authButtons}>
            <Link to="/login" className={styles.loginBtn}>
              Entrar
            </Link>
            <Link to="/signup" className={styles.signupBtn}>
              Cadastrar
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};