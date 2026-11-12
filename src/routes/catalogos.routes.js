import { Router } from "express";
import {
  obtenerCategorias,
  obtenerUnidades,
  controladoresCategorias,
  controladoresUnidades,
} from "../controllers/catalogos.controller.js";
import { verificarToken, soloAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Lectura publica: el vecino necesita ver las categorias en el formulario
router.get("/categorias", obtenerCategorias);
router.get("/unidades", obtenerUnidades);

// Escritura: solo administrador (401 sin token, 403 si el rol no es admin)
router.post("/categorias", verificarToken, soloAdmin, controladoresCategorias.crear);
router.put("/categorias/:id", verificarToken, soloAdmin, controladoresCategorias.actualizar);
router.delete("/categorias/:id", verificarToken, soloAdmin, controladoresCategorias.eliminar);

router.post("/unidades", verificarToken, soloAdmin, controladoresUnidades.crear);
router.put("/unidades/:id", verificarToken, soloAdmin, controladoresUnidades.actualizar);
router.delete("/unidades/:id", verificarToken, soloAdmin, controladoresUnidades.eliminar);

export default router;
