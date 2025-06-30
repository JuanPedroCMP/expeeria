import React, { useState } from "react";
import { usePost } from "../../hooks/usePost";
import { useAuth } from "../../hooks/useAuth";
import { LikeButton } from "../LikeButton/LikeButton";
import { LazyImage } from "../LazyImage/LazyImage";
import { ShareButton } from "../ShareButton/ShareButton";
import styles from "./Card.module.css";

/**
 * Componente Card para exibir posts no feed
 * Versão melhorada com visual aprimorado e animações
 */
const Card = (props) => {
  // Verify props to prevent errors
  if (!props) return null;

  const { 
    TituloCard, 
    SubTitulo, 
    Descricao, 
    likes = 0, 
    comments = 0,
    id, 
    imageUrl, 
    author,
    createdAt,
    onClick,
    // Compatibilidade com diferentes formatos de dados
    title,
    caption,
    content,
    like_count,
    likeCount,
    comment_count,
    commentCount,
    image_url,
    created_at,
    author_name,
    // Suporte a propriedades adicionais
    category,
    categoria,
    tags,
    // Nova propriedade para controlar visibilidade do botão compartilhar
    hideShareButton = false
  } = props;
  
  // Normalizando os dados para garantir compatibilidade com diferentes formatos
  const normalizedTitle = TituloCard || title || '';
  const normalizedSubtitle = SubTitulo || '';
  const normalizedDescription = Descricao || caption || (content?.substring(0, 120) + (content?.length > 120 ? '...' : '')) || '';
  const normalizedLikes = parseInt(likes || likeCount || like_count || 0, 10);
  const normalizedComments = parseInt(comments || commentCount || comment_count || 0, 10);
  const normalizedImageUrl = imageUrl || image_url || '';
  const normalizedAuthor = author || author_name || '';
  const normalizedCreatedAt = createdAt || created_at || '';
  const normalizedCategory = category || categoria || '';
  const normalizedTags = tags || []; // Suporte para tags
  
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
  const formattedDate = normalizedCreatedAt ? new Date(normalizedCreatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) : '';

  const [imageError, setImageError] = useState(false);

  // Handler para erros de carregamento de imagem
  const handleImageError = () => {
    setImageError(true);
  };
  
  return (
    <div className={`${styles.card} card post-card slide-up`} onClick={handleCardClick}>
      {normalizedImageUrl ? (
        <div className={styles.imageContainer}>
          <LazyImage
            src={normalizedImageUrl}
            alt={normalizedTitle}
            className={styles.cardImage}
            onError={handleImageError}
            placeholderColor="rgba(15, 23, 42, 0.6)"
          />
        </div>
      ) : null}
      
      <div className={`${styles.cardContent} post-content`}>
        {normalizedCategory && (
          <div className={styles.cardCategory}>{normalizedCategory}</div>
        )}
        <h3 className={`${styles.cardTitle} post-title`}>{normalizedTitle}</h3>
        {normalizedSubtitle && <div className="badge badge-primary mb-sm">{normalizedSubtitle}</div>}
        <p className={`${styles.cardDescription} post-caption`}>{normalizedDescription}</p>
        
        {normalizedTags && normalizedTags.length > 0 && (
          <div className={styles.cardTags}>
            {normalizedTags.map((tag, index) => (
              <span key={index} className={styles.cardTag}>{tag}</span>
            ))}
          </div>
        )}
        
        {normalizedAuthor && (
          <div className="post-author mt-sm mb-sm">
            <small className="text-secondary">Por {normalizedAuthor}</small>
            {formattedDate && <small className="text-terciario">{' • '}{formattedDate}</small>}
          </div>
        )}
        
        <div className={styles.cardFooter}>
          <div className="post-stats">
            <LikeButton 
              count={normalizedLikes}
              isLiked={isLiked}
              onLike={handleLike}
              onUnlike={handleUnlike}
              disabled={!user}
              size="md"
            />
            
            <span title="Comentários" className={styles.commentCount}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              {normalizedComments}
            </span>
            
            {!hideShareButton && (
              <ShareButton 
                url={window.location.origin + `/post/${id}`}
                title={normalizedTitle}
                description={normalizedDescription}
                size="sm"
                className={styles.shareButton}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Card };