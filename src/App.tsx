import React from "react";
// Componentes estructurales de Ionic y el enrutador para React
import { IonApp, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

// El estado global de sesion y el mapa de rutas
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/AppRoutes";

// Estilos base y utilidades CSS obligatorias de Ionic (Inclueyendo display que es para ocultar en PC/movil)
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

// Paleta de colores principales que usamos (azul, verde y amarillo)
import "./theme/variables.css";

// Para inicializar la configuracion de Ionic en React
setupIonicReact();

// Esto es para conectar el router de Ionic, el proveedor de sesion y nuestras rutas
const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </IonReactRouter>
  </IonApp>
);

export default App;
