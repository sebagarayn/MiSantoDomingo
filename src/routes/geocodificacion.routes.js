import { Router } from "express";
import {
  geocodificarDireccion,
  geocodificarInversa,
} from "../controllers/geocodificacion.controller.js";

const router = Router();

// Busca coordenadas a partir de una dirección.
router.get("/geocodificar", geocodificarDireccion);

// Busca una dirección a partir de coordenadas.
router.get("/geocodificar/inversa", geocodificarInversa);

export default router;
