import { createContext, useContext, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // Cadastro
  const signUp = async (email, password, name, username) => {
    try {
      // Verifica se já existe email ou username
      const res = await api.get(`/users?email=${email}`);
      const resUser = await api.get(`/users?username=${username}`);
      if (res.data.length > 0 || resUser.data.length > 0) return false; // Já existe

      const newUser = { email, password, name, username, role: "user" };
      const postRes = await api.post("/users", newUser);
      setUser({
        email: postRes.data.email,
        id: postRes.data.id,
        role: postRes.data.role,
        name: postRes.data.name,
        username: postRes.data.username,
      });
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: postRes.data.email,
          id: postRes.data.id,
          role: postRes.data.role,
          name: postRes.data.name,
          username: postRes.data.username,
        })
      );
      return true;
    } catch {
      return false;
    }
  };

  // Login
  const signIn = async (email, password) => {
    try {
      const res = await api.get(`/users?email=${email}&password=${password}`);
      if (res.data.length > 0) {
        const userData = res.data[0];
        setUser({
          email: userData.email,
          id: userData.id,
          role: userData.role,
          name: userData.name,
          username: userData.username,
        });
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: userData.email,
            id: userData.id,
            role: userData.role,
            name: userData.name,
            username: userData.username,
          })
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
