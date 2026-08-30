import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { UserRole } from "../types";

interface ProtectedRouteProps {
  component: any;
  exact?: boolean;
  path: string;
  roles?: UserRole[];
}

// Componente que protege las rutas privadas de la aplicacion
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
        // Si el usuario no esta autenticado, lo envia al login
        if (!isAuthenticated) {
          return <Redirect to="/login" />;
        }

        // Si la ruta exige roles especificos y el usuario no los tiene, lo envia al login
        if (roles && user && !roles.includes(user.rol)) {
          return <Redirect to="/login" />;
        }

        // Si pasa las validaciones, muestra la pagina
        return <Component {...props} />;
      }}
    />
  );
}

export default ProtectedRoute;
