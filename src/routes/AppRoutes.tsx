import { Route, Switch, Redirect } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// Importacion de paginas
import LoginPage from "../pages/auth/LoginPage";
import RegistroPage from "../pages/auth/RegistroPage";
import ConsultaPublicaPage from "../pages/public/ConsultaPublicaPage";
import VecinoHomePage from "../pages/vecino/VecinoHomePage";
import AdminHomePage from "../pages/admin/AdminHomePage";
import NotFoundPage from "../pages/NotFoundPage";

function AppRoutes() {
  return (
    <Switch>
      {/* Rutas publicas - cualquier persona puede acceder */}
      <Route exact path="/login" component={LoginPage} />
      <Route exact path="/registro" component={RegistroPage} />
      <Route exact path="/consulta" component={ConsultaPublicaPage} />

      {/* Rutas protegidas para vecinos */}
      <ProtectedRoute
        exact
        path="/app/inicio"
        component={VecinoHomePage}
        roles={["vecino"]}
      />

      {/* Rutas protegidas para administradores */}
      <ProtectedRoute
        exact
        path="/admin/inicio"
        component={AdminHomePage}
        roles={["admin"]}
      />

      {/* Redireccion de la ruta raiz al login */}
      <Route exact path="/">
        <Redirect to="/login" />
      </Route>

      {/* Pagina 404 cuando la ruta no existe */}
      <Route component={NotFoundPage} />
    </Switch>
  );
}

export default AppRoutes;
