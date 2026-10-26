import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import catalogosRoutes from "./routes/catalogos.routes.js";
import reclamosRoutes from "./routes/reclamos.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api", catalogosRoutes);
app.use("/api/reclamos", reclamosRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    mensaje: "API de MiSantoDomingo funcionando correctamente",
  });
});

// Manejador 404
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: `La ruta solicitada no existe en este servidor: ${req.method} ${req.originalUrl}`,
  });
});

// Manejador Global 500 / 400 (Aqui capturamos los errores de la BD)
app.use((err, req, res, next) => {
  // Errores de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      ok: false,
      mensaje:
        "El cuerpo de la petición contiene un formato JSON inválido o malformado",
    });
  }

  // Errores de Multer (foto muy pesada o formato invalido)
  if (
    err instanceof multer.MulterError ||
    err.message.includes("Solo se permiten archivos")
  ) {
    return res
      .status(400)
      .json({ ok: false, mensaje: `Error de archivo: ${err.message}` });
  }

  // Errores de PostgreSQL mapeados a 400 Bad Request
  if (err.code === "23503" || err.code === "22001" || err.code === "22P02") {
    return res.status(400).json({
      ok: false,
      mensaje:
        "Los datos enviados son inválidos o referencian a registros que no existen",
    });
  }

  console.error("Error interno capturado:", err.message);
  return res
    .status(500)
    .json({ ok: false, mensaje: "Ocurrió un error interno en el servidor" });
});

export default app;
