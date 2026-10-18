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
app.use("/api", catalogosRoutes); // /api/categorias y /api/unidades
app.use("/api/reclamos", reclamosRoutes);

// Ruta de verificacion
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    mensaje: "API de MiSantoDomingo funcionando correctamente",
  });
});

export default app;
