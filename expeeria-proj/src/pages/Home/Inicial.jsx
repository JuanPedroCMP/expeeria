import { PostProvider } from "../../contexts/PostContext";
import { Feed } from "../../components/Feed/Feed";
import { Recomendacoes } from "../../components/Recomendacoes/Recomendacoes";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import style from "./Inicial.module.css";

const Inicial = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <PostProvider>
      <div className={style.homeContainer}>
        <div className={style.welcomeBox}>
          <h2>
            {user
              ? `Bem-vindo(a), ${user.name || user.email}!`
              : "Bem-vindo ao Expeeria!"}
          </h2>
          <p>
            {user
              ? "Veja recomendações personalizadas, explore novos conteúdos e compartilhe suas experiências!"
              : "Faça login para receber recomendações personalizadas e interagir com a comunidade."}
          </p>
          <button
            className={style.criarPostBtn}
            onClick={() => navigate("/criar_post")}
          >
            + Criar novo post
          </button>
        </div>
        <Recomendacoes />
        <Feed />
      </div>
    </PostProvider>
  );
};

export { Inicial };
