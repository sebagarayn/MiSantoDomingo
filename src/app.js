import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Importamos las rutas
import authRoutes from "./routes/auth.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Servir fotos estaticas
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Montar las rutas de la API
app.use("/api/auth", authRoutes);

// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    mensaje: "API de MiSantoDomingo funcionando correctamente",
  });
});

export default app;
