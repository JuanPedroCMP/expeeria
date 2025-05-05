import { useState } from "react";
import { useParams } from "react-router-dom";
import { usePosts } from "../../contexts/PostContext";
import ReactMarkdown from "react-markdown";
import style from "./PostPage.module.css";
import { Button } from "../../components";
import { useAuth } from "../../contexts/AuthContext";

export const PostPage = () => {
  const { id } = useParams();
  const { posts, loading, likePost, addComment, deletePost } = usePosts();
  const [comment, setComment] = useState("");
  const [userInput, setUserInput] = useState("");
  const { user } = useAuth();

  const handleDelete = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Você precisa estar logado para excluir!");
      return;
    }
    if (window.confirm("Tem certeza que deseja excluir este post?")) {
      deletePost(id);
    }
  };

  if (loading) return <p>Carregando...</p>;

  const post = posts.find((p) => String(p.id) === String(id));
  const isOwnerOrAdmin =
    user && (user.email === post.author || user.role === "admin");
  if (!post) return <p>Post não encontrado.</p>;

  const handleComment = (e) => {
    e.preventDefault();
    if (!userInput || !comment) return;
    addComment(post.id, { user: userInput, text: comment });
    setComment("");
    setUserInput("");
  };

  return (
    <>
      <div className={style.postContainer}>
        {isOwnerOrAdmin && (
          <>
            <button
              className={style.editBtn}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/editar/${id}`;
              }}
            >
              Editar
            </button>
            <button className={style.deleteBtn} onClick={handleDelete}>
              Excluir
            </button>
          </>
        )}

        <Button destino="/" texto="Voltar para a página inicial" />
        {post.imageUrl && (
          <div className={style.bannerBox}>
            <img
              src={post.imageUrl}
              alt={post.title}
              className={style.bannerImage}
            />
          </div>
        )}
        <h2 className={style.postTitle}>{post.title}</h2>
        <h4 className={style.postMeta}>
          {post.area ? `${post.area} • ${post.author}` : post.author}
        </h4>
        <p className={style.postCaption}>{post.caption}</p>
        <div className={style.postContent}>
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
        <button
          onClick={() => {
            if (!user) {
              alert("Você precisa estar logado para curtir!");
              return;
            }
            likePost(post.id);
          }}
          className={style.likeBtn}
          disabled={!user}
        >
          ❤️ {post.likes || 0}
        </button>
        <p className={style.postDate}>
          Publicado em {new Date(post.createdAt).toLocaleString()}
        </p>
        <hr />
        <h3 className={style.commentsTitle}>Comentários</h3>
        <form onSubmit={handleComment} className={style.commentForm}>
          <input
            type="text"
            placeholder="Seu nome"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Seu comentário"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
          <button type="submit">Comentar</button>
        </form>
        <ul className={style.commentsList}>
          {(post.comments || []).map((c) => (
            <li key={c.id}>
              <b>{c.user}:</b> {c.text}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
