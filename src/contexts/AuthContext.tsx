import React, { createContext, useState, useEffect } from "react";
import { IUser } from "../types";
import { authService } from "../services/auth.service";

export interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<IUser>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUser | null>(() => {
    try {
      const sesionGuardada = localStorage.getItem("msd_session_user");
      return sesionGuardada ? JSON.parse(sesionGuardada) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("msd_session_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("msd_session_user");
      localStorage.removeItem("msd_token");
    }
  }, [user]);

  // Login real: si falla, lanza el error y NO inicia sesion
  const login = async (email: string, password: string): Promise<IUser> => {
    try {
      const { token, usuario } = await authService.login(email, password);
      localStorage.setItem("msd_token", token);
      setUser(usuario);
      return usuario;
    } catch (error) {
      // fetch lanza TypeError cuando el backend esta apagado o inalcanzable
      if (error instanceof TypeError) {
        throw new Error(
          "No se pudo conectar con el servidor. Intentalo nuevamente.",
        );
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("msd_token");
    localStorage.removeItem("msd_session_user");
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