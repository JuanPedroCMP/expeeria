import { Navbar } from "../../components/Navbar/Navbar";
import { Outlet } from "react-router-dom";
import style from "./LayoutPadrao.module.css";
import { ThemeToggle } from "../../components/ThemeToggle";


const LayoutPadrao = () => {
  return (
    <>
      <Navbar />
      <div className={style.LayoutPadrao}>
        <Outlet />
      </div>  
    </>
  );
};

export { LayoutPadrao };
