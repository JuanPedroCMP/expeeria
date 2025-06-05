import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { MenuRecolhivel } from "./MenuRecolhivel/MenuRecolhivel";
import { useAuth } from "../../hooks/useAuth";
import { Avatar } from "../Avatar/Avatar";
import styles from "./Navbar.module.css";

/**
 * Componente Navbar
 * Barra de navegação principal com suporte a login, avatar, menu lateral e responsividade.
 */
export const Navbar = () => {
  const { user, logout } = useAuth();                      // Dados do usuário logado
  const [showUserMenu, setShowUserMenu] = useState(false); // Menu dropdown de perfil
  const navigate = useNavigate();                          // Navegação programática

  // Função para logout com confirmação
  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair da conta?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <nav className={styles.navbar}>
      {/* Lado esquerdo: logo e menu lateral */}
      <div className={styles.navbarLeft}>
        <MenuRecolhivel />
        <Link to="/" className={styles.logo}>Expeeria</Link>
      </div>

      {/* Lado direito: links e menu de usuário */}
      <div className={styles.navbarRight}>
        <Link to="/apresentacao" className={styles.navLink}>
          Sobre Expeeria
        </Link>

        {user ? (
          <>
            {/* Botão criar post */}
            <Link to="/criar_post" className={styles.createPostBtn}>
              Novo Post
            </Link>

            {/* Área do usuário */}
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

              {/* Dropdown com ações do usuário */}
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
          // Botões de autenticação (se não estiver logado)
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
