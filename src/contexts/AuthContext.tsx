import React, { createContext, useState, useEffect } from "react";
import { IUser, UserRole } from "../types";

// Acá definimos lo que va a compartir el contexto a cualquier pantalla que lo consulte
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

// Creamos el contexto vacío antes de inicializarlo con el proveedor
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

// Este proveedor envuelve toda la aplicación en App.tsx para que la sesión sea global
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Acá revisamos el localStorage apenas arranca la app: si el profe o ayudante recarga con F5,
  // rescatamos el usuario guardado para que no se le cierre la sesión (esto cubre la persistencia de la pauta)
  const [user, setUser] = useState<IUser | null>(() => {
    try {
      const sesionGuardada = localStorage.getItem("msd_session_user");
      return sesionGuardada ? JSON.parse(sesionGuardada) : null;
    } catch {
      return null;
    }
  });

  // Cada vez que cambia el usuario lo dejamos sincronizado en el localStorage al tiro, o lo borramos si cerró sesión
  useEffect(() => {
    if (user) {
      localStorage.setItem("msd_session_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("msd_session_user");
    }
  }, [user]);

  // Esta función simula el login: determina el rol según el correo y le asigna el nombre oficial de nuestras proto-personas
  const login = (
    email: string,
    passwordOrRol?: string,
    rolOpcional?: UserRole,
  ) => {
    let rol: UserRole = "vecino";
    if (rolOpcional) {
      rol = rolOpcional;
    } else if (passwordOrRol === "admin" || passwordOrRol === "vecino") {
      rol = passwordOrRol as UserRole;
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

  // Cuando la persona presiona salir, limpiamos el estado y el useEffect se encarga de borrar el localStorage
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
