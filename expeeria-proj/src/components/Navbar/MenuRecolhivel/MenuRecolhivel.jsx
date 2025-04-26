import React, { useState, useRef, useEffect } from "react";
import style from "./MenuRecolhivel.module.css";

const MenuRecolhivel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
  
    const toggleDropdown = () => {
      setIsOpen(!isOpen);
    };
  
    const closeDropdown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
  
    useEffect(() => {
      document.addEventListener("click", closeDropdown);
      return () => {
        document.removeEventListener("click", closeDropdown);
      };
    }, []);
  
    return (
      <div className={style.MenuRecolhivel} ref={dropdownRef}>
        <button onClick={toggleDropdown} className="dropdown-button">
          Menu
        </button>
        {isOpen && (
          <div>
            <a href="#opcao1">Opção 1</a>
            <a href="#opcao2">Opção 2</a>
            <a href="#opcao3">Opção 3</a>
          </div>
        )}
      </div>
    );
};

export { MenuRecolhivel };
