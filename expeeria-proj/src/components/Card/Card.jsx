import { usePosts } from "../../contexts/PostContext";
import style from "./Card.module.css";
import { useAuth } from "../../contexts/AuthContext";

const Card = (props) => {
  const { TituloCard, SubTitulo, Descrisao, likes, id } = props;
  const { likePost } = usePosts();
  const { user } = useAuth();

  const handleLike = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Você precisa estar logado para curtir!");
      return;
    }
    likePost(id);
  };

  return (
    <div className={style.Card}>
      <h3>{TituloCard}</h3>
      <h6>{SubTitulo}</h6>
      <p>{Descrisao}</p>
      <div className={style.FixoFooter}>
        <button
          className={style.likeBtn}
          onClick={handleLike}
          disabled={!user}
        >
          ❤️ {likes || 0}
        </button>
      </div>
    </div>
  );
};

export { Card };