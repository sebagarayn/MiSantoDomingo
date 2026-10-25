import { Router } from "express";
import {
  crearReclamo,
  listarReclamos,
  consultarPorFolio,
  obtenerDetalleReclamo,
  actualizarEstado,
  cancelarReclamo,
  calificarReclamo,
  editarReclamo,
} from "../controllers/reclamos.controller.js";
import { verificarToken, soloAdmin } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

// 1. Ruta publica: Consulta ciudadana por folio sin login (RF-03)
router.get("/folio/:folio", consultarPorFolio);

// 2. Rutas protegidas para usuarios autenticados
router.use(verificarToken);

// Listar reclamos (vecino ve los suyos, admin ve todos con filtros)
router.get("/", listarReclamos);

// Ingresar nuevo reclamo con foto opcional (Multer)
router.post("/", upload.single("foto"), crearReclamo);

// Ver detalle completo con historial
router.get("/:id", obtenerDetalleReclamo);

// Anular reclamo propio pendiente (Verbo DELETE de la rubrica)
router.delete("/:id", cancelarReclamo);

// Calificar respuesta oficial de 1 a 5 estrellas
router.post("/:id/calificacion", calificarReclamo);

// Rutas exclusivas para Administradores (OIRS)
router.patch("/:id/estado", soloAdmin, actualizarEstado);

// Editar datos completos de un reclamo pendiente (Verbo PUT del CRUD)
router.put("/:id", editarReclamo);

export default router;
