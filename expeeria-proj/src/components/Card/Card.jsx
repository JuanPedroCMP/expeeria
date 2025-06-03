import React, { useState } from "react";
import { usePost } from "../../hooks/usePost";
import { useAuth } from "../../hooks/useAuth";
import { LikeButton } from "../LikeButton/LikeButton";
import { LazyImage } from "../LazyImage/LazyImage";
import { ShareButton } from "../ShareButton/ShareButton";
import styles from "./Card.module.css";

/**
 * Componente Card
 * Exibe posts com suporte a dados variados, imagem, autor, categorias, tags, curtidas e comentários.
 */
const Card = (props) => {
  // Proteção contra props indefinidas
  if (!props) return null;

  // Extração e fallback de propriedades
  const {
    TituloCard, SubTitulo, Descricao,
    likes = 0, comments = 0,
    id, imageUrl, author, createdAt, onClick,
    title, caption, content, like_count, likeCount, comment_count, commentCount,
    image_url, created_at, author_name,
    category, categoria, tags,
    hideShareButton = false
  } = props;

  // Normalização de dados
  const normalizedTitle = TituloCard || title || '';
  const normalizedSubtitle = SubTitulo || '';
  const normalizedDescription =
    Descricao || caption ||
    (content?.substring(0, 120) + (content?.length > 120 ? '...' : '')) || '';
  const normalizedLikes = parseInt(likes || likeCount || like_count || 0, 10);
  const normalizedComments = parseInt(comments || commentCount || comment_count || 0, 10);
  const normalizedImageUrl = imageUrl || image_url || '';
  const normalizedAuthor = author || author_name || '';
  const normalizedCreatedAt = createdAt || created_at || '';
  const normalizedCategory = category || categoria || '';
  const normalizedTags = tags || [];

  const { likePost, unlikePost, hasLikedPost } = usePost();
  const { user } = useAuth();

  const isLiked = hasLikedPost?.(id); // Verifica se já foi curtido

  // Lógica de curtida
  const handleLike = (e) => {
    e.stopPropagation();
    if (user) likePost(id);
  };

  const handleUnlike = (e) => {
    e.stopPropagation();
    if (user) unlikePost(id);
  };

  // Ação ao clicar no card (navegação ou detalhe)
  const handleCardClick = () => {
    if (onClick) onClick(id);
  };

  // Formatação de data
  const formattedDate = normalizedCreatedAt
    ? new Date(normalizedCreatedAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : '';

  const [imageError, setImageError] = useState(false);

  // Tratar erro de imagem
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className={`${styles.card} card post-card slide-up`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
    >
      {/* Imagem do post (se existir) */}
      {normalizedImageUrl && !imageError && (
        <div className={styles.imageContainer}>
          <LazyImage
            src={normalizedImageUrl}
            alt={normalizedTitle}
            className={styles.cardImage}
            onError={handleImageError}
            placeholderColor="rgba(15, 23, 42, 0.6)"
          />
        </div>
      )}

      {/* Conteúdo textual do card */}
      <div className={`${styles.cardContent} post-content`}>
        {normalizedCategory && (
          <div className={styles.cardCategory}>{normalizedCategory}</div>
        )}

        <h3 className={`${styles.cardTitle} post-title`}>{normalizedTitle}</h3>

        {normalizedSubtitle && (
          <div className="badge badge-primary mb-sm">{normalizedSubtitle}</div>
        )}

        <p className={`${styles.cardDescription} post-caption`}>
          {normalizedDescription}
        </p>

        {/* Tags (se existirem) */}
        {normalizedTags.length > 0 && (
          <div className={styles.cardTags}>
            {normalizedTags.map((tag, index) => (
              <span key={index} className={styles.cardTag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Autor + Data */}
        {normalizedAuthor && (
          <div className="post-author mt-sm mb-sm">
            <small className="text-secondary">Por {normalizedAuthor}</small>
            {formattedDate && (
              <small className="text-terciario"> • {formattedDate}</small>
            )}
          </div>
        )}

        {/* Rodapé com botões */}
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {normalizedComments}
            </span>

            {!hideShareButton && (
              <ShareButton
                url={`${window.location.origin}/post/${id}`}
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
