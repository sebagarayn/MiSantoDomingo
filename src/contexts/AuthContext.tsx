import React, { createContext, useState, useEffect } from "react";
import { IUser, UserRole } from "../types";

// Contrato con las variables y funciones que compartimos a toda la app
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

// Creamos el contexto vacio
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

// Proveedor que envuelve toda la aplicacion en App.tsx
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Al partir lee si habia una sesion guardada en el navegador para que no se caiga con F5 (lo de la persistencia)
  const [user, setUser] = useState<IUser | null>(() => {
    try {
      const sesionGuardada = localStorage.getItem("msd_session_user");
      return sesionGuardada ? JSON.parse(sesionGuardada) : null;
    } catch {
      return null;
    }
  });

  // Mantiene sincronizado el localStorage cuando alguien inicia o cierra sesion
  useEffect(() => {
    if (user) {
      localStorage.setItem("msd_session_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("msd_session_user");
    }
  }, [user]);

  // Simula el login asignando el nombre y rol segun el usuario de prueba
  const login = (email: string, param2?: string, param3?: UserRole) => {
    let rol: UserRole = "vecino";
    if (param3) {
      rol = param3;
    } else if (param2 === "admin" || param2 === "vecino") {
      rol = param2 as UserRole;
    } else if (email.includes("admin")) {
      rol = "admin";
    }

    const nuevoUsuario: IUser = {
      id: rol === "admin" ? "usr-admin-1" : "usr-vecino-1",
      email,
      nombre:
        rol === "admin"
          ? "Felipe OIRS (Funcionario)"
          : "María González (Vecina)",
      rol,
      fechaRegistro: new Date().toISOString(),
    };
    setUser(nuevoUsuario);
  };

  // Limpia la sesion actual
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
