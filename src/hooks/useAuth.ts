import { useContext } from "react";
import { AuthContext, AuthContextType } from "../contexts/AuthContext";

// Hook personalizado para acceder a la sesion desde cualquier componente
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  // Si alguien intenta usar useAuth fuera del AuthProvider, avisa del error al tiro
  if (context === undefined) {
    throw new Error(
      "useAuth debe usarse obligatoriamente dentro de un AuthProvider",
    );
  }

  // Retorna { user, isAuthenticated, login, logout }
  return context;
};
