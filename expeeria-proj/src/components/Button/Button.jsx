import { Link } from "react-router-dom";
import style from "./Button.module.css"
import { TIPO_BOTAO } from "./constantes";

const Button = (props) => {
  const { destino, texto, tipo = TIPO_BOTAO.PRIMARIO, ...outrasProps } = props;
  return (  
      
        <span>
          <Link to={ destino }><button tipo={tipo} className={style.Button} {...outrasProps}>{ texto }</button></Link>
        </span>
      
  );
};

export { Button };
