import { Navbar } from "../../components/Navbar/Navbar";
import { Outlet } from "react-router-dom";
import style from "./LayoutPadrao.module.css";
import { PostProvider } from "../../contexts/PostContext";
import { ThemeToggle } from "../../components/ThemeToggle";


const LayoutPadrao = () => {
  return (
    <PostProvider>
      <Navbar />
      <div className={style.LayoutPadrao}>
        <Outlet />
      </div>  
    </PostProvider>
  );
};

export { LayoutPadrao };
