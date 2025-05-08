import { usePost } from "../../hooks/usePost";
import { useAuth } from "../../hooks/useAuth";
import { LikeButton } from "../LikeButton/LikeButton";
import styles from "./Card.module.css";

/**
 * Componente Card para exibir posts no feed
 * Versão melhorada com visual aprimorado e animações
 */
const Card = (props) => {
  const { 
    TituloCard, 
    SubTitulo, 
    Descricao, 
    likes, 
    comments = 0,
    id, 
    imageUrl, 
    author,
    createdAt,
    onClick
  } = props;
  
  const { likePost, unlikePost, hasLikedPost } = usePost();
  const { user } = useAuth();
  
  const isLiked = hasLikedPost && hasLikedPost(id);
  
  const handleLike = (e) => {
    e.stopPropagation();
    if (user) {
      likePost(id);
    }
  };
  
  const handleUnlike = (e) => {
    e.stopPropagation();
    unlikePost(id);
  };
  
  const handleCardClick = () => {
    if (onClick) {
      onClick(id);
    }
  };
  
  // Formatar data se disponível
  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) : '';

  return (
    <div className={`${styles.card} card post-card slide-up`} onClick={handleCardClick}>
      {imageUrl && (
        <div className={styles.imageContainer}>
          <img src={imageUrl} alt={TituloCard} className={`${styles.cardImage} post-image`} />
        </div>
      )}
      <div className={`${styles.cardContent} post-content`}>
        <h3 className={`${styles.cardTitle} post-title`}>{TituloCard}</h3>
        {SubTitulo && <div className="badge badge-primary mb-sm">{SubTitulo}</div>}
        <p className={`${styles.cardDescription} post-caption`}>{Descricao}</p>
        
        {author && (
          <div className="post-author mt-sm mb-sm">
            <small className="text-secondary">Por {author}</small>
            {formattedDate && <small className="text-terciario">{' • '}{formattedDate}</small>}
          </div>
        )}
        
        <div className={`${styles.cardFooter} post-footer`}>
          <div className="post-stats">
            <LikeButton 
              count={likes || 0}
              isLiked={isLiked}
              onLike={handleLike}
              onUnlike={handleUnlike}
              disabled={!user}
              size="md"
            />
            
            <span title="Comentários">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              {comments}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Card };