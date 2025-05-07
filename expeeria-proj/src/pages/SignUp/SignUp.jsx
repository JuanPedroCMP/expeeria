import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import styles from "./SignUp.module.css";

export function SignUp() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const username =
      name.trim().toLowerCase().replace(/\s+/g, "") +
      Math.floor(1000 + Math.random() * 9000);
    if (await signUp(email, password, name, username)) {
      navigate("/");
    } else {
      setError("Erro ao cadastrar (usuário já existe?).");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.authForm}>
      <h2>Criar Conta</h2>
      <input
        type="text"
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Cadastrar</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        Já tem conta? <a href="/login">Entrar</a>
      </p>
    </form>
  );
}
