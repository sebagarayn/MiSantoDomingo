import { Router } from "express";
import {
  obtenerCategorias,
  obtenerUnidades,
} from "../controllers/catalogos.controller.js";

const router = Router();

// Rutas publicas de catalogos
router.get("/categorias", obtenerCategorias);
router.get("/unidades", obtenerUnidades);

export default router;
