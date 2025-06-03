import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useComment } from "../../hooks/useComment";
import styles from "./CommentItem.module.css";

/**
 * Componente CommentItem
 * Exibe um comentário individual com suporte a curtidas, respostas, edição e exclusão.
 */
export const CommentItem = ({ 
  comment,       // Objeto do comentário principal
  postId,        // ID do post ao qual o comentário pertence
  onReply,       // Função chamada ao responder
  onEdit,        // Função chamada ao editar
  onDelete       // Função chamada ao excluir
}) => {
  const { user } = useAuth();
  const { hasLikedComment, likeComment, unlikeComment } = useComment();

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  const isCommentOwner = user && user.id === comment.user_id;

  // Verifica se o comentário foi curtido por esse usuário
  useEffect(() => {
    if (user && comment.id) {
      const checkLikeStatus = async () => {
        try {
          const liked = await hasLikedComment(comment.id);
          setIsLiked(liked);
        } catch (error) {
          console.error('Erro ao verificar status de curtida:', error);
        }
      };

      checkLikeStatus();
    }
  }, [user, comment.id, hasLikedComment]);

  // Alterna o status de curtida do comentário
  const handleLikeToggle = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Você precisa estar logado para curtir este comentário!");
      return;
    }

    try {
      if (isLiked) {
        await unlikeComment(comment.id, postId);
      } else {
        await likeComment(comment.id, postId);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Erro ao processar curtida:", error);
    }
  };

  // Salva edição de conteúdo
  const handleEdit = () => {
    if (editContent.trim() === "") return;

    onEdit(comment.id, editContent);
    setIsEditing(false);
  };

  // Envia uma resposta
  const handleReply = () => {
    if (replyContent.trim() === "") return;

    onReply(comment.id, replyContent);
    setReplyContent("");
    setShowReplyForm(false);
  };

  // Formatação da data de criação
  const formattedDate = new Date(comment.created_at).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className={styles.commentItem}>
      {/* Cabeçalho do comentário: Avatar, nome, data */}
      <div className={styles.commentHeader}>
        <div className={styles.userInfo}>
          <img 
            src={comment.profiles?.avatar_url || "/default-avatar.png"} 
            alt={comment.profiles?.username || "Usuário"} 
            className={styles.avatar}
          />
          <span className={styles.username}>
            {comment.profiles?.username || "Usuário"}
          </span>
        </div>
        <span className={styles.date}>{formattedDate}</span>
      </div>

      {/* Área de edição ou conteúdo simples */}
      {isEditing ? (
        <div className={styles.editForm}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className={styles.editTextarea}
          />
          <div className={styles.editActions}>
            <button onClick={handleEdit} className={styles.saveBtn}>Salvar</button>
            <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>Cancelar</button>
          </div>
        </div>
      ) : (
        <p className={styles.commentContent}>{comment.content}</p>
      )}

      {/* Ações do comentário: Curtir, Responder, Editar, Excluir */}
      <div className={styles.commentActions}>
        <button 
          onClick={handleLikeToggle}
          className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
          disabled={!user}
        >
          ❤️ {comment.likes || 0}
        </button>

        {user && (
          <button 
            onClick={() => setShowReplyForm(!showReplyForm)} 
            className={styles.actionBtn}
          >
            Responder
          </button>
        )}

        {isCommentOwner && (
          <>
            <button 
              onClick={() => setIsEditing(true)} 
              className={styles.actionBtn}
            >
              Editar
            </button>
            <button 
              onClick={() => onDelete(comment.id)} 
              className={styles.actionBtn}
            >
              Excluir
            </button>
          </>
        )}
      </div>

      {/* Formulário de resposta */}
      {showReplyForm && (
        <div className={styles.replyForm}>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Escreva sua resposta..."
            className={styles.replyTextarea}
          />
          <div className={styles.replyActions}>
            <button onClick={handleReply} className={styles.replyBtn}>Enviar resposta</button>
            <button onClick={() => setShowReplyForm(false)} className={styles.cancelBtn}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Exibe respostas, se existirem */}
      {comment.replies?.length > 0 && (
        <div className={styles.replies}>
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
