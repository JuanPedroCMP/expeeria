import style from "./Card.module.css";

const Card = (props) => {
  const { TituloCard, SubTitulo, Descrisao } = props;
  return (
    <div className={style.Card}>
        {/* <HeadInfoUsuario /> */}
        <h3 className=""> {TituloCard} </h3>
        <h6 className=""> {SubTitulo} </h6>
        <p className=""> {Descrisao}</p>
    </div>
  );
};

export { Card };
