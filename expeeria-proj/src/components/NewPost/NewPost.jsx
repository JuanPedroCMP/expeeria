import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import style from "./NewPost.module.css";
import { Button } from "../Button";
import { categoriasPadrao } from "../../utils/categoriasPadrao";
import { useAuth } from "../../hooks/useAuth";
import { UploadImage } from "../UploadImage/UploadImage";
import { useNotification } from "../../hooks/useNotification";
import { usePost } from "../../hooks/usePost";
import supabase from "../../services/supabase";

export const NewPost = ({
  modoEdicao = false,
  postOriginal = null,
  onSubmitEdicao,
}) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { createPost } = usePost();
  const [title, setTitle] = useState(postOriginal?.title || "");
  const [caption, setCaption] = useState(postOriginal?.caption || "");
  const [content, setContent] = useState(postOriginal?.content || "");  const [imageUrl, setImageUrl] = useState(postOriginal?.imageUrl || "");
  const [area, setArea] = useState(postOriginal?.area || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categoriasOpen, setCategoriasOpen] = useState(false);

  useEffect(() => {
    if (postOriginal) {      setTitle(postOriginal.title || "");
      setCaption(postOriginal.caption || "");
      setContent(postOriginal.content || "");
      setImageUrl(postOriginal.imageUrl || "");
      setArea(postOriginal.area || []);
    }
  }, [postOriginal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);    if (!title || !caption || !content || !user?.id || !area.length) {
      setError("Preencha todos os campos obrigatórios.");
      setLoading(false);
      return;
    }
    
    if (!user?.id) {
      setError("Você precisa estar logado para criar um post.");
      setLoading(false);
      return;
    }

    try {      const postData = {
        title,
        caption,
        content,
        author_id: user.id,
        author_name: user.name || user.email || 'Usuário',
        image_url: imageUrl,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
        like_count: 0,
        comment_count: 0,
        view_count: 0,
        metadata: JSON.stringify({ readTime: Math.ceil(content.length / 1000) })
      };

      console.log("Enviando dados do post:", postData);      if (modoEdicao && onSubmitEdicao) {
        await onSubmitEdicao(postData);
        setSuccess("Post editado com sucesso!");
        showSuccess("Post editado com sucesso!");
      } else {
        try {
          const novoPost = await createPost(postData);
          
          if (!novoPost) throw new Error('Falha ao criar o post');
          
          console.log("Post criado com sucesso:", novoPost);
          
          if (area && area.length > 0) {
            const categorias = area.map(cat => ({
              post_id: novoPost.id,
              category: cat
            }));
            
            const { error: catError } = await supabase              .from('post_categories')
              .insert(categorias);
              
            if (catError) {
              console.error("Erro ao adicionar categorias:", catError);
            }
          }
          
          setSuccess("Post criado com sucesso!");
          showSuccess("Post criado com sucesso!");
          
          setTitle("");
          setCaption("");
          setContent("");
          setImageUrl("");
          setArea([]);
        } catch (error) {
          console.error("Erro ao criar post:", error);
          setError(`Não foi possível criar o post: ${error.message || 'Erro desconhecido'}`);
          showError("Não foi possível criar o post. Tente novamente.");
        }
      }
    } catch (err) {
      console.error("Erro ao " + (modoEdicao ? "editar" : "criar") + " post:", err);
      const mensagemErro = err.message || "Ocorreu um erro. Tente novamente mais tarde.";
      setError(mensagemErro);
      showError(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={style.formNewPost}>
      <h2>{modoEdicao ? "Editar Post" : "Novo Post"}</h2>
      <input
        type="text"
        placeholder="Título do post"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <div style={{ margin: "12px 0" }}>
        <UploadImage
          onUpload={setImageUrl}
          preset="expeeria_banner"
          previewStyle={{
            width: 400,
            height: 140,
            borderRadius: 8,
            objectFit: "cover",
            marginTop: 8,
          }}
        />
      </div>
      <input
        type="text"
        placeholder="Descrição curta (caption)"
        value={caption}
        maxLength={450}
        onChange={(e) => setCaption(e.target.value)}
        required
      />
      <label className={style.markdownLabel}>
        Conteúdo completo do post (Markdown permitido):
        <textarea
          placeholder="Digite o conteúdo em Markdown. Exemplo: **negrito**, [link](https://...), ![imagem](url)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={7}
          className={style.markdownTextarea}
        />
      </label>
      <div style={{ margin: "1rem 0" }}>
        <div className={style.categoriaPicker}>
          <button
            type="button"
            onClick={() => setCategoriasOpen((v) => !v)}
            style={{
              background: "#23283a",
              color: "#8ecae6",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              marginBottom: 8,
              marginRight: 8,
            }}
          >
            {categoriasOpen
              ? "Ocultar categorias ▲"
              : "Selecionar categorias ▼"}
          </button>
          {categoriasOpen && (
            <div>
              <div className={style["interesses-checkboxes"]}>
                {categoriasPadrao.map((cat) => (
                  <label key={cat} className={style["interesse-label"]}>
                    <input
                      type="checkbox"
                      value={cat}
                      checked={Array.isArray(area) && area.includes(cat)}
                      disabled={
                        !(Array.isArray(area) && area.includes(cat)) &&
                        Array.isArray(area) &&
                        area.length >= 3
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (Array.isArray(area) && area.length < 3)
                            setArea([...area, cat]);
                        } else {
                          setArea(area.filter((i) => i !== cat));
                        }
                      }}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "#aaa", marginLeft: 8 }}>
                Selecione até 3 categorias
              </p>
            </div>
          )}
        </div>
      </div>
      <button 
        type="submit" 
        disabled={loading}
      >
        {loading 
          ? "Processando..." 
          : (modoEdicao ? "Salvar alterações" : "Publicar")}
      </button>
      {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
      {success && <p style={{ color: "green", marginTop: 8 }}>{success}</p>}
      <br />
      <div className={style.markdownPreview}>
        <span>
          <span className={style.destaque}>BETA</span> Pré-visualização do
          conteúdo:{" "}
        </span>
        <div className={style.previewBox}>
          <ReactMarkdown>
            {content || "*Nada para pré-visualizar ainda...*"}
          </ReactMarkdown>
        </div>
      </div>
    </form>
  );
};
