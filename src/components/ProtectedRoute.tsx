import React from "react";
// Usamos Route y Redirect de react-router-dom para armar la guardia de navegacion
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { UserRole } from "../types";

// Definimos las props: recibe el componente a mostrar, el path y opcionalmente la lista de roles permitidos
interface ProtectedRouteProps {
  component: any;
  exact?: boolean;
  path: string;
  roles?: UserRole[];
}

// Este componente actua como un filtro o guardia de seguridad para que nadie entre a rutas privadas sin permiso
function ProtectedRoute({
  component: Component,
  roles,
  ...rest
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        // 1. Si no ha iniciado sesion, lo mandamos al tiro a /login (esto cubre la redireccion obligatoria que pide la pauta EP 1.5)
        if (!isAuthenticated) {
          return <Redirect to="/login" />;
        }

        // 2. Si la ruta exige rol admin y entra una vecina (o al reves), tambien lo pateamos al login por no tener permisos
        if (roles && user && !roles.includes(user.rol)) {
          return <Redirect to="/login" />;
        }

        // 3. Si paso todas las validaciones de sesion y rol, recien ahi le mostramos la pantalla
        return <Component {...props} />;
      }}
    />
  );
}

export default ProtectedRoute;
