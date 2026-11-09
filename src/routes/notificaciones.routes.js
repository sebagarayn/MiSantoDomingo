import { Router } from "express";
import {
  listarNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
} from "../controllers/notificaciones.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Todas requieren sesion: cada usuario solo ve y modifica las suyas
router.use(verificarToken);

router.get("/", listarNotificaciones);
// IMPORTANTE: "leer-todas" va ANTES de "/:id/leida" para que no se confunda con un :id
router.patch("/leer-todas", marcarTodasLeidas);
router.patch("/:id/leida", marcarLeida);

export default router;