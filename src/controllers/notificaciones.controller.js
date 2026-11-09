import {
  listarNotificacionesDeDB,
  marcarLeidaEnDB,
  marcarTodasLeidasEnDB,
} from "../services/notificaciones.service.js";
import { esIdValido, badRequest } from "../utils/validaciones.js";

// GET /api/notificaciones?solo_no_leidas=true&limite=30
export const listarNotificaciones = async (req, res) => {
  const { solo_no_leidas, limite } = req.query;

  if (solo_no_leidas !== undefined && !["true", "false"].includes(solo_no_leidas)) {
    return badRequest(res, "solo_no_leidas debe ser true o false");
  }
  if (limite !== undefined && (!esIdValido(limite) || Number(limite) > 100)) {
    return badRequest(res, "El limite debe ser un numero entero entre 1 y 100");
  }

  try {
    const { notificaciones, no_leidas } = await listarNotificacionesDeDB({
      id_usuario: req.usuario.id_usuario,
      soloNoLeidas: solo_no_leidas === "true",
      limite: limite ? Number(limite) : 50,
    });
    return res.status(200).json({
      ok: true,
      no_leidas,
      total: notificaciones.length,
      notificaciones,
    });
  } catch (error) {
    console.error("Error al listar notificaciones:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error en el servidor al obtener las notificaciones",
    });
  }
};




// PATCH /api/notificaciones/:id/leida
export const marcarLeida = async (req, res) => {
  const { id } = req.params;
  if (!esIdValido(id)) {
    return badRequest(res, "El ID de la notificacion debe ser un numero entero valido");
  }

  try {
    const encontrada = await marcarLeidaEnDB({
      id: Number(id),
      id_usuario: req.usuario.id_usuario,
    });
    if (!encontrada) {
      return res
        .status(404)
        .json({ ok: false, mensaje: "Notificacion no encontrada" });
    }
    return res.status(200).json({ ok: true, mensaje: "Notificacion marcada como leida" });
  } catch (error) {
    console.error("Error al marcar notificacion:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error en el servidor al actualizar la notificacion",
    });
  }
};


// PATCH /api/notificaciones/leer-todas
export const marcarTodasLeidas = async (req, res) => {
  try {
    const actualizadas = await marcarTodasLeidasEnDB(req.usuario.id_usuario);
    return res.status(200).json({ ok: true, actualizadas });
  } catch (error) {
    console.error("Error al marcar notificaciones:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error en el servidor al actualizar las notificaciones",
    });
  }
};