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
      {/* Menu Lateral adaptado al diseno municipal */}
      <IonMenu contentId="main-content" type="overlay">
        <IonHeader className="ion-no-border">
          <IonToolbar style={{ "--background": "#0D3B66", padding: "6px 0" }}>
            <IonTitle
              style={{
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: "14px",
                letterSpacing: "0.5px",
              }}
            >
              SANTO DOMINGO
            </IonTitle>
          </IonToolbar>
          <div
            style={{
              height: "4px",
              width: "100%",
              background:
                "linear-gradient(90deg, #0D3B66 0%, #2E7D32 50%, #F59E0B 100%)",
            }}
          />
        </IonHeader>

        <IonContent style={{ "--background": "#FFFFFF" }}>
          <IonList lines="full" style={{ padding: "8px 0" }}>
            <IonMenuToggle autoHide={false}>
              <IonItem
                routerLink="/consulta"
                routerDirection="root"
                style={{ "--color": "#0D3B66", fontWeight: 600 }}
              >
                <IonIcon
                  slot="start"
                  icon={searchOutline}
                  style={{ color: "#0D3B66" }}
                />
                <IonLabel>Consulta por Folio</IonLabel>
              </IonItem>
            </IonMenuToggle>

            {isAuthenticated && user?.rol === "vecino" && (
              <IonMenuToggle autoHide={false}>
                <IonItem
                  routerLink="/app/inicio"
                  routerDirection="root"
                  style={{ "--color": "#0D3B66", fontWeight: 600 }}
                >
                  <IonIcon
                    slot="start"
                    icon={homeOutline}
                    style={{ color: "#0D3B66" }}
                  />
                  <IonLabel>Mis Reclamos</IonLabel>
                </IonItem>
              </IonMenuToggle>
            )}

            {isAuthenticated && user?.rol === "admin" && (
              <>
                <IonMenuToggle autoHide={false}>
                  <IonItem
                    routerLink="/admin/inicio"
                    routerDirection="root"
                    style={{ "--color": "#0D3B66", fontWeight: 600 }}
                  >
                    <IonIcon
                      slot="start"
                      icon={clipboardOutline}
                      style={{ color: "#0D3B66" }}
                    />
                    <IonLabel>Gestion OIRS</IonLabel>
                  </IonItem>
                </IonMenuToggle>
                <IonMenuToggle autoHide={false}>
                  <IonItem
                    routerLink="/admin/dashboard"
                    routerDirection="root"
                    style={{ "--color": "#0D3B66", fontWeight: 600 }}
                  >
                    <IonIcon
                      slot="start"
                      icon={statsChartOutline}
                      style={{ color: "#0D3B66" }}
                    />
                    <IonLabel>Dashboard KPIs</IonLabel>
                  </IonItem>
                </IonMenuToggle>
              </>
            )}

            {isAuthenticated ? (
              <IonMenuToggle autoHide={false}>
                <IonItem
                  button
                  onClick={logout}
                  detail={false}
                  style={{ marginTop: "16px" }}
                >
                  <IonIcon
                    slot="start"
                    icon={logOutOutline}
                    style={{ color: "#DC2626" }}
                  />
                  <IonLabel style={{ color: "#DC2626", fontWeight: 600 }}>
                    Cerrar Sesion ({user?.rol})
                  </IonLabel>
                </IonItem>
              </IonMenuToggle>
            ) : (
              <IonMenuToggle autoHide={false}>
                <IonItem
                  routerLink="/login"
                  routerDirection="root"
                  style={{ "--color": "#0D3B66", fontWeight: 600 }}
                >
                  <IonIcon
                    slot="start"
                    icon={logInOutline}
                    style={{ color: "#0D3B66" }}
                  />
                  <IonLabel>Iniciar Sesion</IonLabel>
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
