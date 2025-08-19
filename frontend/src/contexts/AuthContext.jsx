import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode'; // importação correta para jwt-decode v3+

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        // verifica a expiração do token
        if (decodedUser.exp * 1000 < Date.now()) {
          // token expirado
          sessionStorage.removeItem('authToken');
          setUser(null);
        } else {
          // extrai as informações necessárias do token decodificado
          // valida que o backend envia estas informações no token
          setUser({
            id: decodedUser.userId,
            login: decodedUser.sub, // 'sub' é o subject, geralmente o login/username
            profile: decodedUser.profile, // Ex: 'ADMIN', 'USUARIO'
            mustChangePassword: decodedUser.mustChangePassword
          });
        }
      } catch (error) {
        console.error("Invalid token:", error);
        sessionStorage.removeItem('authToken');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    sessionStorage.setItem('authToken', token);
    const decodedUser = jwtDecode(token);
    setUser({
      id: decodedUser.userId,
      login: decodedUser.sub,
      profile: decodedUser.profile,
      mustChangePassword: decodedUser.mustChangePassword
    });
  };

  const logout = () => {
    sessionStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);