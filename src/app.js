import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Necesario para manejar rutas de carpetas en modulos ES de Node.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares globales
app.use(cors()); // Permite conexiones desde el frontend de Ionic (puerto 5173)
app.use(express.json()); // Permite recibir y procesar datos en formato JSON

// Servir de forma estatica la carpeta de fotos que suban los vecinos
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Ruta de prueba para verificar que el backend esta respondiendo
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    mensaje: "API de MiSantoDomingo funcionando correctamente",
  });
});

export default app;
