import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

import pool from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import catalogosRoutes from "./routes/catalogos.routes.js";
import reclamosRoutes from "./routes/reclamos.routes.js";
import geocodificacionRoutes from "./routes/geocodificacion.routes.js";

import compression from "compression";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Seguridad mediante cabeceras HTTP (visto en clases de Seguridad)
app.use(helmet());

app.use(compression());

// CORS restringido al origen del frontend
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api", catalogosRoutes);
app.use("/api/reclamos", reclamosRoutes);
app.use("/api", geocodificacionRoutes);

// Health check real que comprueba el estado de la base de datos
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      ok: true,
      mensaje: "API y base de datos funcionando correctamente",
      fecha: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      mensaje: "Servicio no disponible: error de conexión con la base de datos",
    });
  }
});

// Manejador 404
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: `La ruta solicitada no existe en este servidor: ${req.method} ${req.originalUrl}`,
  });
});

// Manejador Global de errores
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      ok: false,
      mensaje:
        "El cuerpo de la petición contiene un formato JSON inválido o malformado",
    });
  }

  if (
    err instanceof multer.MulterError ||
    (err.message && err.message.includes("Solo se permiten archivos"))
  ) {
    return res.status(400).json({
      ok: false,
      mensaje: `Error de archivo: ${err.message}`,
    });
  }

  if (
    err.code === "23503" ||
    err.code === "22001" ||
    err.code === "22P02" ||
    err.code === "23514"
  ) {
    return res.status(400).json({
      ok: false,
      mensaje:
        "Los datos enviados son inválidos o referencian a registros que no existen",
    });
  }

  console.error("Error interno capturado:", err.message);
  return res.status(500).json({
    ok: false,
    mensaje: "Ocurrió un error interno en el servidor",
  });
});

export default app;
