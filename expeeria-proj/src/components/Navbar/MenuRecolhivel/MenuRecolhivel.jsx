import React, { useState, useRef, useEffect } from "react";
import style from "./MenuRecolhivel.module.css";
import { Link } from "react-router-dom";

/**
 * Componente MenuRecolhivel
 * Um menu lateral que se expande ao clicar no ícone ☰
 * Fecha automaticamente ao clicar fora ou pressionar ESC
 */
const MenuRecolhivel = () => {
  const [isOpen, setIsOpen] = useState(false);     // Estado do menu (aberto/fechado)
  const menuRef = useRef();                        // Referência ao container do menu

  // Efeito para controlar eventos externos e scroll do body
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden'; // Impede scroll da página

    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false); // Fecha ao clicar fora do menu
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") setIsOpen(false); // Fecha com ESC
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = ''; // Libera scroll
    };
  }, [isOpen]);

  // Função utilitária para fechar menu
  const closeMenu = () => setIsOpen(false);

  return (
    <div className={style.menuRecolhivel}>
      {/* Botão que abre o menu */}
      <button
        onClick={() => setIsOpen(true)}
        className={style.dropdownButton}
        aria-label="Abrir menu"
      >
        ☰
      </button>

      {isOpen && (
        <div>
          {/* Camada escura atrás do menu */}
          <div
            className={style.menuOverlay}
            onClick={closeMenu}
            aria-label="Fechar menu"
          />

          {/* Container do menu lateral */}
          <nav
            className={`${style.menu} ${style.open}`}
            ref={menuRef}
            aria-label="Menu lateral"
          >
            <div className={style.menuHeader}>
              <h4>Expeeria</h4>
              <button
                onClick={closeMenu}
                className={style.closeButton}
                aria-label="Fechar menu"
              >
                ⨉
              </button>
            </div>

            <div className={style.menuCategory}>Navegação</div>

            <Link to="/" className={style.menuLink} onClick={closeMenu}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Página inicial</span>
            </Link>

            <Link to="/explorar" className={style.menuLink} onClick={closeMenu}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span>Explorar posts</span>
            </Link>

            <Link to="/criar_post" className={style.menuLink} onClick={closeMenu}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span>Criar Post</span>
            </Link>

            <div className={style.menuCategory}>Recursos</div>

            <Link to="/perfil" className={style.menuLink} onClick={closeMenu}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Meu Perfil</span>
            </Link>

            <a
              href="https://github.com/JuanPedroCMP/expeeria/blob/main/README.md"
              className={style.menuLink}
              onClick={closeMenu}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>Documentação</span>
            </a>
          </nav>
        </div>
      )}
    </div>
  );
};

export { MenuRecolhivel };
