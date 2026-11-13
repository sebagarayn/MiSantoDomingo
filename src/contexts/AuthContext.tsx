import React, { createContext, useState, useEffect } from "react";
import { IUser } from "../types";
import { authService } from "../services/auth.service";
import {
  CLAVES,
  PREFIJO_CACHE,
  borrar,
  borrarPorPrefijo,
  guardar,
  guardarJSON,
  leerJSON,
} from "../services/almacenamiento.service";

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
  // La sesion guardada ya esta cargada en memoria (main.tsx espera a iniciarAlmacenamiento)
  const [user, setUser] = useState<IUser | null>(() =>
    leerJSON<IUser>(CLAVES.usuario),
  );

  useEffect(() => {
    if (user) {
      guardarJSON(CLAVES.usuario, user);
    } else {
      borrar(CLAVES.usuario);
      borrar(CLAVES.token);
    }
  }, [user]);

  // Login real: si falla, lanza el error y NO inicia sesion
  const login = async (email: string, password: string): Promise<IUser> => {
    try {
      const { token, usuario } = await authService.login(email, password);
      await guardar(CLAVES.token, token);
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
    borrar(CLAVES.token);
    borrar(CLAVES.usuario);
    borrarPorPrefijo(PREFIJO_CACHE); // la copia de reclamos no debe quedar en un equipo ajeno
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