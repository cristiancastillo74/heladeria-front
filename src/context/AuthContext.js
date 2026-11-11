import { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { requestLogin } from '../services/authService';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';
const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      axios.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
    }
    return storedToken;
  });
  const [currentUser, setCurrentUser] = useState(readStoredUser);
  const currentBranch = currentUser?.branch ?? null;
  const isAuthenticated = Boolean(token && currentUser);

  const login = async (username, password) => {
    const { token: newToken, user } = await requestLogin(username, password);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    setToken(newToken);
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete axios.defaults.headers.common.Authorization;
    setToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, currentBranch, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
