import React, { createContext, useState, useEffect } from "react";
import { IUser, UserRole } from "../types";

export interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    passwordOrRol?: string,
    rolOpcional?: UserRole,
  ) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Acá se lee la sesión guardada previamente en localStorage si es que existe
  const [user, setUser] = useState<IUser | null>(() => {
    try {
      const savedUser = localStorage.getItem("msd_session_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Se mantiene sincronizado el localStorage cuando el usuario inicia o cierra sesión
  useEffect(() => {
    if (user) {
      localStorage.setItem("msd_session_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("msd_session_user");
    }
  }, [user]);

  // Soporta tanto login(email, password, rol) como login(email, rol)
  const login = (email: string, param2?: string, param3?: UserRole) => {
    let rol: UserRole = "vecino";
    if (param3) {
      rol = param3;
    } else if (param2 === "admin" || param2 === "vecino") {
      rol = param2 as UserRole;
    } else if (email.includes("admin")) {
      rol = "admin";
    }

    const newUser: IUser = {
      id: rol === "admin" ? "usr-admin-1" : "usr-vecino-1",
      email,
      nombre:
        rol === "admin"
          ? "Felipe OIRS (Funcionario)"
          : "María González (Vecina)",
      rol,
      fechaRegistro: new Date().toISOString(),
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
