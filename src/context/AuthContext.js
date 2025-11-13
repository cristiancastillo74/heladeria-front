// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);

  // Recuperar usuario/token de localStorage al iniciar la app
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const login = (userData, jwtToken) => {
    setCurrentUser(userData);
    setToken(jwtToken);
    localStorage.setItem("currentUser", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ currentUser, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
