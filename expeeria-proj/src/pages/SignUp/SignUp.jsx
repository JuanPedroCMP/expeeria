import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./SignUp.module.css";

export function SignUp() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await signUp(email, password)) {
      navigate("/");
    } else {
      setError("Erro ao cadastrar (usuário já existe?).");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.authForm}>
      <h2>Criar Conta</h2>
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
