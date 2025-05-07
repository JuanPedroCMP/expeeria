import { usePosts } from "../../contexts/PostContext";
import { useAuth } from "../../contexts/AuthContext";
import { LikeButton } from "../LikeButton/LikeButton";
import styles from "./Card.module.css";

/**
 * Componente Card para exibir posts no feed
 * Versão melhorada com componentização do botão de curtida
 */
const Card = (props) => {
  const { TituloCard, SubTitulo, Descrisao, likes, id, imageUrl } = props;
  const { likePost, unlikePost, hasLikedPost } = usePosts();
  const { user } = useAuth();
  
  const isLiked = hasLikedPost && hasLikedPost(id);
  
  const handleLike = (e) => {
    e.preventDefault();
    likePost(id);
  };
  
  const handleUnlike = (e) => {
    e.preventDefault();
    unlikePost(id);
  };

  return (
    <div className={styles.card}>
      {imageUrl && (
        <div className={styles.imageContainer}>
          <img src={imageUrl} alt={TituloCard} className={styles.cardImage} />
        </div>
      )}
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{TituloCard}</h3>
        <h6 className={styles.cardSubtitle}>{SubTitulo}</h6>
        <p className={styles.cardDescription}>{Descrisao}</p>
        <div className={styles.cardFooter}>
          <LikeButton 
            count={likes || 0}
            isLiked={isLiked}
            onLike={handleLike}
            onUnlike={handleUnlike}
            disabled={!user}
            size="md"
          />
        </div>
      </div>
    </div>
  );
};

export { Card };