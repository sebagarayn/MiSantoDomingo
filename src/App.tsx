import React from "react";
import { IonApp, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

// Acá traemos el proveedor de sesión global y el archivo central donde configuramos las rutas
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/AppRoutes";

/* 
Estilos base que pide Ionic para que funcione bien.
Aca agregue el display.css porque es fundamental porque de ahí sacamos las clases ion-hide-md-up y ion-hide-md-down 
para ocultar o mostrar cosas según si estamos en PC o en celular (por lo de los dos perfiles)
*/
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

// Acá cargamos la paleta de colores (azul, verde y amarillo)
import "./theme/variables.css";

// Esta función es obligatoria llamarla al inicio para arrancar el framework de Ionic en React
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
