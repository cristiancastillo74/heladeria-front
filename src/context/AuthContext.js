// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

// Usuario y sucursal de prueba (quemados)
const dummyUser = {
  idUser: 1,
  firstName: 'MARIA',
  lastName: 'MENJIVAR',
  dui: '04876875-7',
  phone: '1234-1234',
  address: 'S.S.',
  salary: 300.0,
  workDays: '30',
  username: 'mmenjivar',
  password: '123123',
  role: 'EMPLOYEE',
  branch: {
    id: 1,
    name: 'Opico',
    location: 'S.S.',
    phone: '2222-2222',
    createdAt: null
  },
  createdAt: null,
  updatedAt: null
};

const dummyBranch = dummyUser.branch;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(dummyUser);
  const [currentBranch, setCurrentBranch] = useState(dummyBranch);

  // Login y logout están listos para cuando los uses realmente
  const login = (userData, branchData) => {
    setCurrentUser(userData);
    setCurrentBranch(branchData);
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentBranch(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, currentBranch, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
