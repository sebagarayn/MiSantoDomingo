import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import {
  IonRouterOutlet,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenuToggle,
} from "@ionic/react";
import {
  homeOutline,
  searchOutline,
  logInOutline,
  logOutOutline,
  statsChartOutline,
  clipboardOutline,
} from "ionicons/icons";

import LoginPage from "../pages/auth/LoginPage";
import RegistroPage from "../pages/auth/RegistroPage";
import ConsultaPublicaPage from "../pages/public/ConsultaPublicaPage";
import VecinoHomePage from "../pages/vecino/VecinoHomePage";
import AdminHomePage from "../pages/admin/AdminHomePage";
import Dashboard from "../pages/admin/Dashboard";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../hooks/useAuth";

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <>
      {/* IonMenu: Es el menú lateral adaptable para móvil y escritorio */}
      <IonMenu contentId="main-content" type="overlay">
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>MiSantoDomingo</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList lines="full">
            {/* Opción Pública: Para las consulta por folio sin cuenta (RF-03) */}
            <IonMenuToggle autoHide={false}>
              <IonItem routerLink="/consulta" routerDirection="root">
                <IonIcon slot="start" icon={searchOutline} />
                <IonLabel>Consulta por Folio</IonLabel>
              </IonItem>
            </IonMenuToggle>

            {/* Opciones del Vecino Autenticado */}
            {isAuthenticated && user?.rol === "vecino" && (
              <IonMenuToggle autoHide={false}>
                <IonItem routerLink="/app/inicio" routerDirection="root">
                  <IonIcon slot="start" icon={homeOutline} />
                  <IonLabel>Mis Reclamos</IonLabel>
                </IonItem>
              </IonMenuToggle>
            )}

            {/* Opciones del Funcionario Municipal / Admin */}
            {isAuthenticated && user?.rol === "admin" && (
              <>
                <IonMenuToggle autoHide={false}>
                  <IonItem routerLink="/admin/inicio" routerDirection="root">
                    <IonIcon slot="start" icon={clipboardOutline} />
                    <IonLabel>Gestión OIRS</IonLabel>
                  </IonItem>
                </IonMenuToggle>
                <IonMenuToggle autoHide={false}>
                  <IonItem routerLink="/admin/dashboard" routerDirection="root">
                    <IonIcon slot="start" icon={statsChartOutline} />
                    <IonLabel>Dashboard KPIs</IonLabel>
                  </IonItem>
                </IonMenuToggle>
              </>
            )}

            {/* Iniciar o Cerrar Sesión según estado */}
            {isAuthenticated ? (
              <IonMenuToggle autoHide={false}>
                <IonItem button onClick={logout} detail={false}>
                  <IonIcon slot="start" icon={logOutOutline} color="danger" />
                  <IonLabel color="danger">
                    Cerrar Sesión ({user?.rol})
                  </IonLabel>
                </IonItem>
              </IonMenuToggle>
            ) : (
              <IonMenuToggle autoHide={false}>
                <IonItem routerLink="/login" routerDirection="root">
                  <IonIcon slot="start" icon={logInOutline} />
                  <IonLabel>Iniciar Sesión</IonLabel>
                </IonItem>
              </IonMenuToggle>
            )}
          </IonList>
        </IonContent>
      </IonMenu>

      {/* Salida de rutas envuelta con IonRouterOutlet para navegación nativa de Ionic */}
      <IonRouterOutlet id="main-content">
        <Switch>
          {/* Rutas Públicas */}
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/registro" component={RegistroPage} />
          <Route exact path="/consulta" component={ConsultaPublicaPage} />

          {/* Rutas Protegidas Vecino */}
          <ProtectedRoute
            exact
            path="/app/inicio"
            component={VecinoHomePage}
            roles={["vecino"]}
          />

          {/* Rutas Protegidas Funcionario / Admin (Dashboard ahora 100% protegido) */}
          <ProtectedRoute
            exact
            path="/admin/inicio"
            component={AdminHomePage}
            roles={["admin"]}
          />
          <ProtectedRoute
            exact
            path="/admin/dashboard"
            component={Dashboard}
            roles={["admin"]}
          />

          {/* Redirección inicial */}
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>

          {/* 404 Not Found */}
          <Route component={NotFoundPage} />
        </Switch>
      </IonRouterOutlet>
    </>
  );
};

export default AppRoutes;
