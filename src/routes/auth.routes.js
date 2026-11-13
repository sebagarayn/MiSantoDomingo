import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  registrarVecino,
  iniciarSesion,
  obtenerPerfil,
} from "../controllers/auth.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Limitador de seguridad para evitar ataques de fuerza bruta (S1)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: 5, // Máximo 5 intentos por IP
  skipSuccessfulRequests: true, // Solo cuentan los intentos fallidos
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    mensaje:
      "Demasiados intentos fallidos. Por seguridad, inténtelo de nuevo en 15 minutos.",
  },
});

// Rutas de autenticación protegidas con limitador de intentos
router.post("/registro", authLimiter, registrarVecino);
router.post("/login", authLimiter, iniciarSesion);

// Ruta protegida para validar sesión
router.get("/perfil", verificarToken, obtenerPerfil);

export default router;
