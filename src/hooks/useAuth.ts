import { useContext } from "react";
import { AuthContext, AuthContextType } from "../contexts/AuthContext";

/**
 * Hook personalizado para acceder al contexto de autenticación
 * Debe usarse dentro de un componente hijo de AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }

  return context;
};
