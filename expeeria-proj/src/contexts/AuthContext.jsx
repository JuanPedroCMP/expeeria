import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // Cadastro
  const signUp = async (email, password) => {
    try {
      // Verifica se já existe
      const res = await axios.get(`http://localhost:5000/users?email=${email}`);
      if (res.data.length > 0) return false; // Já existe

      const newUser = { email, password, role: "user" };
      const postRes = await axios.post("http://localhost:5000/users", newUser);
      setUser({ email, id: postRes.data.id, role: "user" });
      localStorage.setItem(
        "user",
        JSON.stringify({ email, id: postRes.data.id, role: "user" })
      );
      return true;
    } catch {
      return false;
    }
  };

  // Login
  const signIn = async (email, password) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/users?email=${email}&password=${password}`
      );
      if (res.data.length > 0) {
        const userData = res.data[0];
        setUser({
          email: userData.email,
          id: userData.id,
          role: userData.role,
        });
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: userData.email,
            id: userData.id,
            role: userData.role,
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
