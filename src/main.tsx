import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Busca el div con id "root" que dejamos en el index.html
const container = document.getElementById("root");

// Inicializa el root de React 18 usando createRoot
const root = createRoot(container!);

// Monta toda la aplicacion envuelta en StrictMode para buenas practicas
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
