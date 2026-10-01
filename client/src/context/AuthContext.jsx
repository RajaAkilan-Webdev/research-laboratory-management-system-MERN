import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lab-user"));
    } catch {
      return null;
    }
  });

  function login(data) {
    localStorage.setItem("lab-token", data.token);
    localStorage.setItem("lab-user", JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("lab-token");
    localStorage.removeItem("lab-user");
    setUser(null);
  }

  function updateUser(updatedUser) {
    const nextUser = { ...user, ...updatedUser };
    localStorage.setItem("lab-user", JSON.stringify(nextUser));
    setUser(nextUser);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
