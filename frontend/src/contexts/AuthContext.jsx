import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        if (decodedUser.exp * 1000 < Date.now()) {
          sessionStorage.removeItem('authToken');
          setUser(null);
        } else {
         
          setUser({
            id: decodedUser.userId,
            login: decodedUser.sub, 
            profile: decodedUser.profile, 
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