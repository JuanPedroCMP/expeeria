import React, { useState, useRef, useEffect } from "react";
import style from "./MenuRecolhivel.module.css";
import { Link } from "react-router-dom";

const MenuRecolhivel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef();

  // Fecha ao clicar fora
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className={style.menuRecolhivel}>
      <button
        onClick={() => setIsOpen(true)}
        className={style.dropdownButton}
        aria-label="Abrir menu"
        style={{ padding: "8px 14px", fontSize: "1.3rem" }}
      >
        ☰
      </button>
      {isOpen && (
        <div>
          <div
            className={style.menuOverlay}
            onClick={closeMenu}
            aria-label="Fechar menu"
          />
          <nav
            className={`${style.menu} ${isOpen ? style.open : ""}`}
            ref={menuRef}
            aria-label="Menu lateral"
          >
            <div className={style.menuHeader}>
              <h4>Menu</h4>
              <button
                onClick={closeMenu}
                className={style.closeButton}
                aria-label="Fechar menu"
              >
                ✖
              </button>
            </div>
            <Link to="/" className={style.menuLink} onClick={closeMenu}>
              Página inicial
            </Link>
            <Link to="/explorar" className={style.menuLink} onClick={closeMenu}>
              Explorar posts
            </Link>
            <Link to="/criar_post" className={style.menuLink} onClick={closeMenu}>
              Criar Post
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
};

export { MenuRecolhivel };