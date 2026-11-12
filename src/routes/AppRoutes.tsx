import React , { lazy, Suspense } from "react";
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
  IonSpinner,
} from "@ionic/react";
import {
  homeOutline,
  searchOutline,
  logInOutline,
  logOutOutline,
  statsChartOutline,
  clipboardOutline,
  listOutline,
} from "ionicons/icons";

// Carga diferida (EF2): cada pantalla se descarga solo cuando el usuario entra a su ruta.
// Asi, quien abre el login no baja el codigo del panel de administracion.
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegistroPage = lazy(() => import("../pages/auth/RegistroPage"));
const ConsultaPublicaPage = lazy(
  () => import("../pages/public/ConsultaPublicaPage"),
);
const VecinoHomePage = lazy(() => import("../pages/vecino/VecinoHomePage"));
const AdminHomePage = lazy(() => import("../pages/admin/AdminHomePage"));
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const CatalogosPage = lazy(() => import("../pages/admin/CatalogosPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

// Lo que se ve mientras se descarga una pantalla
const PantallaCargando: React.FC = () => (
  <div
    role="status"
    aria-label="Cargando"
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      minHeight: "100vh",
    }}
  >
    <IonSpinner name="crescent" color="primary" />
  </div>
);

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
                                <IonMenuToggle autoHide={false}>
                  <IonItem
                    routerLink="/admin/catalogos"
                    routerDirection="root"
                    style={{ "--color": "#0D3B66", fontWeight: 600 }}
                  >
                    <IonIcon
                      slot="start"
                      icon={listOutline}
                      style={{ color: "#0D3B66" }}
                    />
                    <IonLabel>Catálogos</IonLabel>
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
    <Suspense fallback={<PantallaCargando />}>
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

          <ProtectedRoute
            exact
            path="/admin/catalogos"
            component={CatalogosPage}
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
    </Suspense>
    </>
  );
};

export default AppRoutes;
