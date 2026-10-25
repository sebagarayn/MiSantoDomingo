import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Importamos las rutas
import authRoutes from "./routes/auth.routes.js";
import catalogosRoutes from "./routes/catalogos.routes.js";
import reclamosRoutes from "./routes/reclamos.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Servir fotos subidas
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Montaje de rutas en la API
app.use("/api/auth", authRoutes);
app.use("/api", catalogosRoutes);
app.use("/api/reclamos", reclamosRoutes);

// Ruta de verificacion
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    mensaje: "API de MiSantoDomingo funcionando correctamente",
  });
});

// 1. Manejador para cualquier ruta no encontrada (Evita devolver paginas HTML por defecto)
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: `La ruta solicitada no existe en este servidor: ${req.method} ${req.originalUrl}`,
  });
});

// 2. Manejador global de errores: captura JSON malformado y fallos sin revelar rutas de disco
app.use((err, req, res, next) => {
  // Captura error de sintaxis en el JSON enviado por el cliente
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      ok: false,
      mensaje:
        "El cuerpo de la petición contiene un formato JSON inválido o malformado",
    });
  }

  // Cualquier otro error interno se responde en JSON sin exponer trazas de Node.js
  console.error("Error interno capturado:", err.message);
  return res.status(500).json({
    ok: false,
    mensaje: "Ocurrió un error interno en el servidor",
  });
});

export default app;
