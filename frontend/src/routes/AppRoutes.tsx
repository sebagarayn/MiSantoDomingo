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

// Importamos todas las pantallas de nuestra carpeta pages
import LoginPage from "../pages/auth/LoginPage";
import RegistroPage from "../pages/auth/RegistroPage";
import ConsultaPublicaPage from "../pages/public/ConsultaPublicaPage";
import VecinoHomePage from "../pages/vecino/VecinoHomePage";
import AdminHomePage from "../pages/admin/AdminHomePage";
import Dashboard from "../pages/admin/Dashboard";
import NotFoundPage from "../pages/NotFoundPage";

// Traemos el componente que protege rutas y el hook de sesion
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../hooks/useAuth";

const AppRoutes: React.FC = () => {
  // Leemos si hay alguien conectado y que rol tiene para armar el menu dinamicamente
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <>
      {/* Este menu lateral desplegable cumple con el componente IonMenu obligatorio que pide la pauta */}
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
          {/* Franja tricolor institucional */}
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
            {/* Opcion publica para que cualquiera consulte un folio */}
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

            {/* Opciones que solo se muestran si el usuario conectado es vecino */}
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

            {/* Opciones que solo se muestran si el usuario conectado es funcionario (admin) */}
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
                    <IonLabel>Gestión OIRS</IonLabel>
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
                    <IonLabel>Métricas de Gestión</IonLabel>
                  </IonItem>
                </IonMenuToggle>
              </>
            )}

            {/* Si esta logueado mostramos el boton rojo para salir, si no mostramos iniciar sesion */}
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
                    Cerrar Sesión ({user?.rol})
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
                  <IonLabel>Iniciar Sesión</IonLabel>
                </IonItem>
              </IonMenuToggle>
            )}
          </IonList>
        </IonContent>
      </IonMenu>

      {/* IonRouterOutlet es obligatorio en Ionic para que maneje bien las animaciones y el historial de vistas */}
      <IonRouterOutlet id="main-content">
        <Switch>
          {/* 1. Rutas Publicas: cualquiera puede entrar */}
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/registro" component={RegistroPage} />
          <Route exact path="/consulta" component={ConsultaPublicaPage} />

          {/* 2. Rutas Privadas del Vecino: protegidas con rol 'vecino' */}
          <ProtectedRoute
            exact
            path="/app/inicio"
            component={VecinoHomePage}
            roles={["vecino"]}
          />

          {/* 3. Rutas Privadas del Funcionario: protegidas con rol 'admin' */}
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

          {/* 4. Si alguien entra a la raiz '/', lo mandamos al login por defecto */}
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>

          {/* 5. Si escriben una URL que no existe, cae en nuestra pantalla 404 personalizada */}
          <Route component={NotFoundPage} />
        </Switch>
      </IonRouterOutlet>
    </>
  );
};

export default AppRoutes;
