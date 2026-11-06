import { useContext } from "react";
import { AuthContext, AuthContextType } from "../contexts/AuthContext";

// Este custom hook lo armamos para no tener que importar useContext(AuthContext) a mano en cada pantalla
export const useAuth = (): AuthContextType => {
  const datosSesion = useContext(AuthContext);

  // Si alguien del grupo intenta usar useAuth en una vista fuera del AuthProvider, tiramos el error al tiro
  if (datosSesion === undefined) {
    throw new Error(
      "useAuth debe usarse obligatoriamente dentro de un AuthProvider",
    );
  }

  // Retorna las variables listas para desestructurar: { user, isAuthenticated, login, logout }
  return datosSesion;
};
