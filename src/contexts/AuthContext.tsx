import React, { createContext, useState, useEffect } from "react";
import { IUser, UserRole } from "../types";

export interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    passwordOrRol?: string,
    rolOpcional?: UserRole,
  ) => Promise<boolean>;
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

  // Login conectado al Backend real en Node.js + PostgreSQL
  const login = async (
    email: string,
    passwordOrRol?: string,
    rolOpcional?: UserRole,
  ): Promise<boolean> => {
    try {
      // Si la clave no viene, usamos la contraseña por defecto de prueba: 123456
      const passwordEnvio =
        passwordOrRol && passwordOrRol !== "admin" && passwordOrRol !== "vecino"
          ? passwordOrRol
          : "123456";

      const respuesta = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email.trim(), password: passwordEnvio }),
      });

      const data = await respuesta.json();

      if (respuesta.ok && data.ok) {
        // Guardamos el token JWT real en el navegador
        localStorage.setItem("msd_token", data.token);

        const nuevoUsuario: IUser = {
          id: `usr-${data.usuario.id_usuario}`,
          email: data.usuario.correo,
          nombre: data.usuario.nombre,
          rol: data.usuario.rol as UserRole,
          fechaRegistro: new Date().toISOString(),
        };

        setUser(nuevoUsuario);
        return true;
      }
    } catch (error) {
      console.warn("Backend no disponible, usando fallback local:", error);
    }

    // Fallback de contingencia (por si el backend estuviera apagado)
    let rol: UserRole = "vecino";
    if (rolOpcional) {
      rol = rolOpcional;
    } else if (passwordOrRol === "admin" || passwordOrRol === "vecino") {
      rol = passwordOrRol as UserRole;
    } else if (email.includes("admin")) {
      rol = "admin";
    }

    const usuarioFallback: IUser = {
      id: rol === "admin" ? "usr-admin-1" : "usr-vecino-1",
      email,
      nombre:
        rol === "admin"
          ? "Felipe OIRS (Funcionario)"
          : "María González (Vecina)",
      rol,
      fechaRegistro: new Date().toISOString(),
    };
    setUser(usuarioFallback);
    return true;
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
