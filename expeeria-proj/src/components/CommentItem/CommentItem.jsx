import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useComment } from "../../hooks/useComment";
import styles from "./CommentItem.module.css";

/**
 * Componente para exibir um comentário individual
 * Permite respostas, edição e exclusão
 */
export const  CommentItem = ({ 
  comment, 
  postId, 
  onReply, 
  onEdit, 
  onDelete 
}) => {
  const { user } = useAuth();
  const { hasLikedComment, likeComment, unlikeComment } = useComment();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  
  const isCommentOwner = user && user.id === comment.user_id;
  const isLiked = hasLikedComment(comment.id, postId);
  
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
    } catch (error) {
      console.error("Erro ao processar curtida:", error);
    }
  };
  
  const handleEdit = () => {
    if (editContent.trim() === "") return;
    
    onEdit(comment.id, editContent);
    setIsEditing(false);
  };
  
  const handleReply = () => {
    if (replyContent.trim() === "") return;
    
    onReply(comment.id, replyContent);
    setReplyContent("");
    setShowReplyForm(false);
  };
  
  const formattedDate = new Date(comment.created_at).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div className={styles.commentItem}>
      <div className={styles.commentHeader}>
        <div className={styles.userInfo}>
          <img 
            src={comment.profiles?.avatar_url || "/default-avatar.png"} 
            alt={comment.profiles?.username || "Usuário"} 
            className={styles.avatar}
          />
          <span className={styles.username}>{comment.profiles?.username || "Usuário"}</span>
        </div>
        <span className={styles.date}>{formattedDate}</span>
      </div>
      
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
      
      {comment.replies && comment.replies.length > 0 && (
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