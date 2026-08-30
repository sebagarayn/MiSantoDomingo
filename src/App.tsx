import { IonApp, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

// Importamos nuestro contexto y las rutas
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/AppRoutes";

/* Estilos base requeridos por Ionic */
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

/* Variables de tema de la aplicacion */
import "./theme/variables.css";

// Configuracion inicial de Ionic
setupIonicReact();

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
