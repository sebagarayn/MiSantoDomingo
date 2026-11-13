import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { iniciarAlmacenamiento } from "./services/almacenamiento.service";

// Acá buscamos el div 'root' que dejamos en el index.html para montar la app
const container = document.getElementById("root");

// Usamos createRoot que es la forma oficial de React 18
const root = createRoot(container!);

// Primero cargamos lo guardado en el dispositivo (sesion, borrador) y recien despues mostramos la app.
// Renderizamos dentro de StrictMode para que React nos avise si hay errores o dependencias deprecadas en desarrollo
iniciarAlmacenamiento().finally(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
