import React, { useState } from "react";
import style from "./MenuRecolhivel.module.css";
import { Link } from "react-router-dom";

const MenuRecolhivel = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={style.menuRecolhivel}>
      <button onClick={toggleMenu} className={style.dropdownButton}>
        ☰
      </button>
      <div className={`${style.menu} ${isOpen ? style.open : ""}`}>
        <div className={style.menuHeader}>
          <h4>Menu</h4>
          <button onClick={toggleMenu} className={style.closeButton}>✖</button>
        </div>

        <Link to="/" className={style.menuLink}>Página inicial</Link>
        <Link to="/explorar" className={style.menuLink}>Explorar posts</Link>
        <Link to="/criar_post" className={style.menuLink}>Criar Post</Link>
      </div>
    </div>
  );
};

export { MenuRecolhivel };
