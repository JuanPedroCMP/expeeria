import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NewPost } from "../NewPost/NewPost";
import { useNotification } from "../../hooks/useNotification";
import { useAuth } from "../../hooks/useAuth";
import { usePost } from "../../hooks/usePost";

// Componente para editar um post existente
export const EditPost = () => {
  const { id } = useParams();                          // ID do post da URL
  const navigate = useNavigate();                      // Navegação programática
  const [post, setPost] = useState(null);              // Dados do post
  const [loading, setLoading] = useState(true);        // Estado de carregamento
  const [error, setError] = useState(null);            // Erros durante carregamento
  const { showSuccess, showError } = useNotification();// Notificações
  const { user } = useAuth();                          // Usuário atual
  const { getPostById, updatePost } = usePost();       // Ações com post

  // Carregar o post ao montar o componente
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const postData = await getPostById(id);  // Busca post
        if (!postData) throw new Error('Post não encontrado');

        // Buscar categorias associadas a este post
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('post_categories')
          .select('category')
          .eq('post_id', id);

        if (categoriesError) throw categoriesError;

        // Formatar dados no formato esperado por <NewPost />
        const formattedPost = {
          id: postData.id,
          title: postData.title,
          caption: postData.caption,
          content: postData.content,
          imageUrl: postData.image_url,
          author: postData.author_id,
          area: categoriesData?.map(cat => cat.category) || []
        };

        // Permissões: apenas autor ou admin pode editar
        if (user?.id !== postData.author_id && user?.role !== 'admin') {
          setError('Você não tem permissão para editar este post.');
          setLoading(false);
          return;
        }

        setPost(formattedPost);
      } catch (err) {
        console.error('Erro ao buscar post:', err);
        setError('Não foi possível carregar os dados do post. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPost();
  }, [id, user, getPostById]);

  // Submeter edição do post
  const handleEdit = async (dadosEditados) => {
    try {
      const postData = {
        title: dadosEditados.title,
        caption: dadosEditados.caption,
        content: dadosEditados.content,
        image_url: dadosEditados.imageUrl || dadosEditados.image_url
      };

      // Atualizar o conteúdo textual
      await updatePost(id, postData);

      // Atualizar categorias
      if (dadosEditados.area?.length > 0) {
        // Remove categorias antigas
        const { error: deleteError } = await supabase
          .from('post_categories')
          .delete()
          .eq('post_id', id);

        if (deleteError) throw deleteError;

        // Adiciona novas categorias
        const categorias = dadosEditados.area.map(cat => ({
          post_id: id,
          category: cat
        }));

        const { error: catError } = await supabase
          .from('post_categories')
          .insert(categorias);

        if (catError) throw catError;
      }

      showSuccess('Post atualizado com sucesso!');
      navigate(`/post/${id}`);
    } catch (err) {
      console.error('Erro ao atualizar post:', err);
      showError(`Erro ao atualizar post: ${err.message || 'Tente novamente'}`);
    }
  };

  // Renderizações condicionais
  if (loading) return <p>Carregando post para edição...</p>;
  if (error) return <p>{error}</p>;
  if (!post) return <p>Post não encontrado.</p>;

  // Renderiza componente de criação com modo de edição ativo
  return (
    <NewPost
      modoEdicao
      postOriginal={post}
      onSubmitEdicao={handleEdit}
    />
  );
};
