import { MenuRecolhivel } from "./MenuRecolhivel/MenuRecolhivel";
import style from "./Navbar.module.css";

const Navbar = () => {
  return (
    <>
      <nav className={style.Navbar}>
        <MenuRecolhivel />
        <h6>Expeeria</h6>
      </nav>
    </>
  );
};

export { Navbar };
