import { createContext, useState, ReactNode } from "react";
import { IUser, UserRole } from "../types";

// Interfaz que define el valor del contexto de autenticación
export interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rol: UserRole) => Promise<boolean>;
  logout: () => void;
}

// Creación del contexto con valor por defecto undefined
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

// Props del proveedor
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Proveedor de autenticación
 * En EP1 funciona con datos simulados (mock).
 * En EP2 se conectará con la API real y JWT.
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<IUser | null>(null);

  const isAuthenticated = user !== null;

  // Función de login simulada para EP1
  const login = async (
    email: string,
    password: string,
    rol: UserRole,
  ): Promise<boolean> => {
    // Simulación: en EP2 aquí se llamará a la API y se validará el JWT
    try {
      const mockUser: IUser = {
        id: "1",
        nombre: rol === "admin" ? "Funcionario Municipal" : "Vecino Demo",
        email: email,
        rol: rol,
        fechaRegistro: new Date().toISOString(),
      };

      setUser(mockUser);
      return true;
    } catch (error) {
      console.error("Error en login:", error);
      return false;
    }
  };

  // Función de logout
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
