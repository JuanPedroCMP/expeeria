import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NewPost } from "../NewPost/NewPost";
import { useNotification } from "../../hooks/useNotification";
import { useAuth } from "../../hooks/useAuth";
import { usePost } from "../../hooks/usePost";
import supabase from "../../services/supabase";

export const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useNotification();
  const { user } = useAuth();
  const { getPostById, updatePost } = usePost();

  // Buscar os dados do post usando o hook usePost
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar o post usando o hook usePost
        const postData = await getPostById(id);
        if (!postData) throw new Error('Post não encontrado');
        
        // Buscar as categorias do post (ainda precisamos fazer isso separadamente)
        // No futuro podemos melhorar o hook usePost para incluir categorias
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('post_categories')
          .select('category')
          .eq('post_id', id);
          
        if (categoriesError) throw categoriesError;
        
        // Formatar os dados do post para o formato esperado pelo componente NewPost
        const formattedPost = {
          id: postData.id,
          title: postData.title,
          caption: postData.caption,
          content: postData.content,
          imageUrl: postData.image_url || postData.imageUrl,
          author: postData.author_id,
          area: categoriesData?.map(cat => cat.category) || []
        };
        
        // Verificar se o usuário tem permissão para editar este post
        if (user?.id !== postData.author_id && user?.role !== 'admin') {
          setError('Você não tem permissão para editar este post.');
          setLoading(false);
          return;
        }
        
        setPost(formattedPost);
      } catch (err) {
        console.error('Erro ao buscar post para edição:', err);
        setError('Não foi possível carregar os dados do post. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchPost();
    }
  }, [id, user, getPostById]);

  // Função para salvar a edição do post
  const handleEdit = async (dadosEditados) => {
    try {
      // Preparar dados para atualização
      const postData = {
        title: dadosEditados.title,
        caption: dadosEditados.caption,
        content: dadosEditados.content,
        image_url: dadosEditados.imageUrl || dadosEditados.image_url,
        updated_at: new Date().toISOString()
      };
      
      // Atualizar o post usando o hook usePost
      await updatePost(id, postData);
      
      // Gerenciar categorias se foram fornecidas
      if (dadosEditados.area) {
        // Primeiro deletar categorias existentes
        const { error: deleteError } = await supabase
          .from('post_categories')
          .delete()
          .eq('post_id', id);
          
        if (deleteError) throw deleteError;
        
        // Adicionar novas categorias se houver
        if (dadosEditados.area.length > 0) {
          const categorias = dadosEditados.area.map(cat => ({
            post_id: id,
            category: cat
          }));
          
          const { error: catError } = await supabase
            .from('post_categories')
            .insert(categorias);
            
          if (catError) throw catError;
        }
      }
      
      showSuccess('Post atualizado com sucesso!');
      navigate(`/post/${id}`);
    } catch (err) {
      console.error('Erro ao atualizar post:', err);
      showError(`Erro ao atualizar post: ${err.message || 'Tente novamente'}`);
    }
  };

  if (loading) return <p>Carregando post para edição...</p>;
  if (error) return <p>{error}</p>;
  if (!post) return <p>Post não encontrado.</p>;

  return (
    <NewPost
      modoEdicao
      postOriginal={post}
      onSubmitEdicao={handleEdit}
    />
  );
};