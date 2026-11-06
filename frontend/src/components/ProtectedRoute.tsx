import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useIonToast } from "@ionic/react";
import { useAuth } from "../hooks/useAuth";
import { UserRole } from "../types";

interface ProtectedRouteProps {
  component: any;
  exact?: boolean;
  path: string;
  roles?: UserRole[];
}

function ProtectedRoute({
  component: Component,
  roles,
  ...rest
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const [presentToast] = useIonToast();

  return (
    <Route
      {...rest}
      render={(props) => {
        // 1. Si no ha iniciado sesión, avisamos con Toast visual y redirigimos a /login
        if (!isAuthenticated) {
          presentToast({
            message:
              "Acceso restringido: Debes iniciar sesión para acceder a este módulo.",
            duration: 3500,
            color: "warning",
            position: "top",
          });
          return <Redirect to="/login" />;
        }

        // 2. Si el rol no tiene permisos, explicamos claramente el motivo
        if (roles && user && !roles.includes(user.rol)) {
          presentToast({
            message:
              "Permiso denegado: Tu perfil no tiene autorización para acceder a esta sección.",
            duration: 3500,
            color: "danger",
            position: "top",
          });
          return <Redirect to="/login" />;
        }

        // 3. Acceso autorizado
        return <Component {...props} />;
      }}
    />
  );
}

export default ProtectedRoute;
