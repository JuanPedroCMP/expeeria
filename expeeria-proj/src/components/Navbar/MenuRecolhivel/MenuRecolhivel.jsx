import React, { useState } from "react";
import style from "./MenuRecolhivel.module.css";

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
        <a href="#home" className={style.menuLink}>Home</a>
        <a href="#issues" className={style.menuLink}>Issues</a>
        <a href="#pull-requests" className={style.menuLink}>Pull Requests</a>
        <a href="#projects" className={style.menuLink}>Projects</a>
        <a href="#marketplace" className={style.menuLink}>Marketplace</a>
      </div>
    </div>
  );
};

export { MenuRecolhivel };
