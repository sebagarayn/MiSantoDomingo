import { Router } from "express";
import {
  registrarVecino,
  iniciarSesion,
  obtenerPerfil,
} from "../controllers/auth.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Rutas publicas de autenticacion
router.post("/registro", registrarVecino);
router.post("/login", iniciarSesion);

// Ruta protegida para probar que el token funcione correctamente
router.get("/perfil", verificarToken, obtenerPerfil);

export default router;
