import React from "react";
import { usePost } from "../../hooks/usePost";
import { useAuth } from "../../hooks/useAuth";
import { LikeButton } from "../LikeButton/LikeButton";
import { LazyImage } from "../LazyImage/LazyImage";
import { ShareButton } from "../ShareButton/ShareButton";
import styles from "./Card.module.css";

const Card = (props) => {
  const { likePost, unlikePost, hasLikedPost } = usePost();
  const { user } = useAuth();
  
  if (!props) return null;

  const { 
    TituloCard, 
    SubTitulo, 
    Descricao, 
    likes = 0, 
    id, 
    imageUrl, 
    author,
    createdAt,
    onClick,
    title,
    caption,
    content,
    like_count,
    likeCount,
    image_url,
    created_at,
    author_name,
    category,
    categoria,
    tags
  } = props;
  
  const normalizedTitle = TituloCard || title || '';
  const normalizedSubtitle = SubTitulo || '';
  const normalizedDescription = Descricao || caption || (content?.substring(0, 120) + (content?.length > 120 ? '...' : '')) || '';
  const normalizedLikes = parseInt(likes || likeCount || like_count || 0, 10);
  const normalizedImageUrl = imageUrl || image_url || '';
  const normalizedAuthor = author || author_name || '';
  const normalizedCreatedAt = createdAt || created_at || '';
  const normalizedCategory = category || categoria || '';
  const normalizedTags = tags || [];
  
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
  
  const formattedDate = normalizedCreatedAt ? new Date(normalizedCreatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) : '';
  
  return (
    <div className={styles.card} onClick={handleCardClick}>
      {normalizedImageUrl && (
        <div className={styles.imageContainer}>
          <LazyImage
            src={normalizedImageUrl}
            alt={normalizedTitle}
            className={styles.cardImage}
            placeholderColor="rgba(15, 23, 42, 0.6)"
          />
        </div>
      )}
      
      <div className={styles.cardContent}>
        {normalizedCategory && (
          <div className={styles.cardCategory}>{normalizedCategory}</div>
        )}
        <h3 className={styles.cardTitle}>{normalizedTitle}</h3>
        {normalizedSubtitle && <div className={styles.cardSubtitle}>{normalizedSubtitle}</div>}
        <p className={styles.cardDescription}>{normalizedDescription}</p>
        
        {normalizedTags && normalizedTags.length > 0 && (
          <div className={styles.cardTags}>
            {normalizedTags.map((tag, index) => (
              <span key={index} className={styles.cardTag}>{tag}</span>
            ))}
          </div>
        )}
        
        {normalizedAuthor && (
          <div className={styles.cardAuthor}>
            <span>Por {normalizedAuthor}</span>
            {formattedDate && <span> • {formattedDate}</span>}
          </div>
        )}
        
        <div className={styles.cardFooter}>
          <div className={styles.cardStats}>
            <LikeButton 
              count={normalizedLikes}
              isLiked={isLiked}
              onLike={handleLike}
              onUnlike={handleUnlike}
              disabled={!user}
              size="md"
            />
            
            {/* {!hideShareButton && (
              <ShareButton 
                url={window.location.origin + `/post/${id}`}
                title={normalizedTitle}
                description={normalizedDescription}
                size="sm"
                className={styles.shareButton}
              />
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Card };