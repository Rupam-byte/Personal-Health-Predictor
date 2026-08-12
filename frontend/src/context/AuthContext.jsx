import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, ask Flask "am I logged in?" using the existing cookie.
  useEffect(() => {
    api
      .get("/api/me")
      .then((res) => {
        if (res.data.logged_in) setUser(res.data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password, remember = false) {
    const res = await api.post("/api/login", { email, password, remember });
    setUser(res.data.user);
    return res.data;
  }

  async function signup(name, email, password) {
    const res = await api.post("/api/signup", { name, email, password });
    setUser(res.data.user);
    return res.data;
  }

  async function logout() {
    await api.post("/api/logout");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
