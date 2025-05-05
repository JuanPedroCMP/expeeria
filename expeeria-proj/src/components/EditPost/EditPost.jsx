import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePosts } from "../../contexts/PostContext";
import { NewPost } from "../NewPost/NewPost";

export const EditPost = () => {
  const { id } = useParams();
  const { posts, editPost } = usePosts();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const found = posts.find((p) => String(p.id) === String(id));
    if (found) setPost(found);
  }, [posts, id]);

  if (!post) return <p>Carregando post para edição...</p>;

  // Função para salvar edição
  const handleEdit = async (dadosEditados) => {
    await editPost(post.id, dadosEditados);
    navigate(`/post/${post.id}`);
  };

  return (
    <NewPost
      modoEdicao
      postOriginal={post}
      onSubmitEdicao={handleEdit}
    />
  );
};