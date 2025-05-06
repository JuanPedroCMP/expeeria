import { useState, useEffect } from "react";
import { usePosts } from "../../contexts/PostContext";
import ReactMarkdown from "react-markdown";
import style from "./NewPost.module.css";
import { Button } from "../Button";
// import { categorizePost } from "../../utils/categorizePost";
import { categoriasPadrao } from "../../utils/categoriasPadrao";
import { useAuth } from "../../contexts/AuthContext";
import { UploadImage } from "../UploadImage/UploadImage";

export const NewPost = ({
  modoEdicao = false,
  postOriginal = null,
  onSubmitEdicao,
}) => {
  const { addPost } = usePosts();
  const { user } = useAuth();
  const [title, setTitle] = useState(postOriginal?.title || "");
  const [caption, setCaption] = useState(postOriginal?.caption || "");
  const [content, setContent] = useState(postOriginal?.content || "");
  const [imageUrl, setImageUrl] = useState(postOriginal?.imageUrl || "");
  // eslint-disable-next-line no-unused-vars
  const [author, setAuthor] = useState(postOriginal?.author || "");
  const [area, setArea] = useState(postOriginal?.area || []);
//   const [categorias, setCategorias] = useState(categoriasPadrao);
//   const [loadingCategoria, setLoadingCategoria] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categoriasOpen, setCategoriasOpen] = useState(false);

  useEffect(() => {
    if (postOriginal) {
      setTitle(postOriginal.title || "");
      setCaption(postOriginal.caption || "");
      setContent(postOriginal.content || "");
      setImageUrl(postOriginal.imageUrl || "");
      setAuthor(postOriginal.author || "");
      setArea(postOriginal.area || []);
    }
  }, [postOriginal]);

//   const handleCategorize = async () => {
//     setLoadingCategoria(true);
//     const categoria = await categorizePost(content, categorias);
//     setLoadingCategoria(false);
//     setArea([categoria]);
//     if (!categorias.includes(categoria)) {
//       setCategorias([...categorias, categoria]);
//     }
//   };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !caption || !content || !user?.email || !area.length) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    const postData = {
      author: user?.email,
      userId: user?.id,
      title,
      caption,
      content,
      area,
      imageUrl,
      createdAt: postOriginal?.createdAt || new Date().toISOString(),
      likes: postOriginal?.likes || 0,
      comments: postOriginal?.comments || [],
      id: postOriginal?.id,
    };

    if (modoEdicao && onSubmitEdicao) {
      await onSubmitEdicao(postData);
      setSuccess("Post editado com sucesso!");
    } else {
      await addPost(postData);
      setSuccess("Post criado com sucesso!");
      setTitle("");
      setCaption("");
      setContent("");
      setImageUrl("");
      setAuthor("");
      setArea([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={style.formNewPost}>
      <h2>{modoEdicao ? "Editar Post" : "Novo Post"}</h2>
      <Button destino="/" texto="Voltar para a página inicial" />
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
              {/* <button
                type="button"
                onClick={handleCategorize}
                disabled={loadingCategoria || !content}
                style={{ marginLeft: 12 }}
              >
                {loadingCategoria ? "Analisando..." : "Categorizar com IA (Ainda não está funcionando)"}
              </button> */}
            </div>
          )}
        </div>
      </div>
      <button type="submit">
        {modoEdicao ? "Salvar alterações" : "Publicar"}
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
