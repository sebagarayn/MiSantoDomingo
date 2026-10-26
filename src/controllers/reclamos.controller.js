import {
  crearReclamoEnDB,
  listarReclamosDeDB,
  consultarReclamoPorFolioEnDB,
  obtenerDetalleReclamoEnDB,
  actualizarEstadoReclamoEnDB,
  cancelarReclamoEnDB,
  calificarReclamoEnDB,
  editarReclamoEnDB,
} from "../services/reclamos.service.js";

export const crearReclamo = async (req, res, next) => {
  const { id_categoria, descripcion, ubicacion } = req.body;
  const id_usuario = req.usuario.id_usuario;

  if (!id_categoria || !descripcion || !ubicacion) {
    return res.status(400).json({
      ok: false,
      mensaje: "Categoria, descripcion y ubicacion son obligatorios",
    });
  }

  // Valida que los textos sean realmente strings para que no explote el .trim()
  if (typeof descripcion !== "string" || typeof ubicacion !== "string") {
    return res.status(400).json({
      ok: false,
      mensaje: "La descripción y ubicación deben ser formato de texto",
    });
  }

  // Bloquea categorías no numéricas
  if (!Number.isInteger(Number(id_categoria))) {
    return res.status(400).json({
      ok: false,
      mensaje: "La categoría debe ser un identificador numérico",
    });
  }

  const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const nuevoReclamo = await crearReclamoEnDB({
      id_usuario,
      id_categoria,
      descripcion,
      ubicacion,
      foto_url,
    });
    return res.status(201).json({
      ok: true,
      mensaje: "Reclamo ingresado exitosamente",
      reclamo: nuevoReclamo,
    });
  } catch (error) {
    next(error); // Pasa el error al manejador global de app.js
  }
};

export const listarReclamos = async (req, res, next) => {
  const { rol, id_usuario } = req.usuario;
  const { estado, id_categoria, id_unidad, busqueda } = req.query;

  try {
    const reclamos = await listarReclamosDeDB({
      rol,
      id_usuario,
      estado,
      id_categoria,
      id_unidad,
      busqueda,
    });
    return res.json({ ok: true, total: reclamos.length, reclamos });
  } catch (error) {
    next(error);
  }
};

export const consultarPorFolio = async (req, res, next) => {
  const { folio } = req.params;
  try {
    const resultado = await consultarReclamoPorFolioEnDB(folio);
    if (!resultado) {
      return res.status(404).json({
        ok: false,
        mensaje: "No se encontro ningun reclamo con el folio ingresado",
      });
    }
    return res.json({ ok: true, ...resultado });
  } catch (error) {
    next(error);
  }
};

export const obtenerDetalleReclamo = async (req, res, next) => {
  const { id } = req.params;
  const { rol, id_usuario } = req.usuario;

  // Validación estricta que evita el truco '12abc'
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "El ID del reclamo debe ser un número entero válido",
    });
  }

  try {
    const resultado = await obtenerDetalleReclamoEnDB(id, rol, id_usuario);
    if (resultado.error) {
      return res
        .status(resultado.error)
        .json({ ok: false, mensaje: resultado.mensaje });
    }
    return res.json({ ok: true, ...resultado });
  } catch (error) {
    next(error);
  }
};

export const actualizarEstado = async (req, res, next) => {
  const { id } = req.params;
  const { nuevo_estado, id_unidad_destino, observacion, respuesta_formal } =
    req.body;
  const id_funcionario = req.usuario.id_usuario;

  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "El ID del reclamo debe ser un número entero válido",
    });
  }

  if (!nuevo_estado) {
    return res
      .status(400)
      .json({ ok: false, mensaje: "El nuevo estado es obligatorio" });
  }

  const estadosPermitidos = [
    "Pendiente",
    "En Revisión",
    "Derivado",
    "Resuelto",
    "Rechazado",
  ];
  if (!estadosPermitidos.includes(nuevo_estado)) {
    return res
      .status(400)
      .json({ ok: false, mensaje: "El estado enviado no es válido" });
  }

  if (nuevo_estado === "Derivado" && (!id_unidad_destino || !observacion)) {
    return res.status(400).json({
      ok: false,
      mensaje:
        "Para derivar un reclamo debes indicar la unidad de destino y el motivo de derivacion",
    });
  }

  if (
    nuevo_estado === "Resuelto" &&
    (!respuesta_formal || respuesta_formal.trim() === "")
  ) {
    return res.status(400).json({
      ok: false,
      mensaje:
        "Para resolver un reclamo es obligatorio ingresar la respuesta formal",
    });
  }

  try {
    const resultado = await actualizarEstadoReclamoEnDB({
      id,
      id_funcionario,
      nuevo_estado,
      id_unidad_destino,
      observacion,
      respuesta_formal,
    });
    if (resultado.error) {
      return res
        .status(resultado.error)
        .json({ ok: false, mensaje: resultado.mensaje });
    }
    return res.json({
      ok: true,
      mensaje: `Reclamo actualizado exitosamente al estado: ${nuevo_estado}`,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelarReclamo = async (req, res, next) => {
  const { id } = req.params;
  const { rol, id_usuario } = req.usuario;

  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "El ID del reclamo debe ser un número entero válido",
    });
  }

  try {
    const resultado = await cancelarReclamoEnDB({ id, id_usuario, rol });
    if (resultado.error) {
      return res
        .status(resultado.error)
        .json({ ok: false, mensaje: resultado.mensaje });
    }
    return res.json({ ok: true, mensaje: "Reclamo cancelado exitosamente" });
  } catch (error) {
    next(error);
  }
};

export const calificarReclamo = async (req, res, next) => {
  const { id } = req.params;
  const { puntaje, comentario } = req.body;
  const { id_usuario } = req.usuario;

  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "El ID del reclamo debe ser un número entero válido",
    });
  }

  const estrellas = parseInt(puntaje, 10);
  if (isNaN(estrellas) || estrellas < 1 || estrellas > 5) {
    return res.status(400).json({
      ok: false,
      mensaje: "La calificacion debe ser un numero entero entre 1 y 5",
    });
  }

  try {
    const resultado = await calificarReclamoEnDB({
      id,
      id_usuario,
      estrellas,
      comentario,
    });
    if (resultado.error) {
      return res
        .status(resultado.error)
        .json({ ok: false, mensaje: resultado.mensaje });
    }
    return res.status(201).json({
      ok: true,
      mensaje: "Gracias por calificar la respuesta municipal",
    });
  } catch (error) {
    next(error); // Los errores de llave foranea los ataja app.js
  }
};

export const editarReclamo = async (req, res, next) => {
  const { id } = req.params;
  const { id_categoria, descripcion, ubicacion } = req.body;
  const { rol, id_usuario } = req.usuario;

  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "El ID del reclamo debe ser un número entero válido",
    });
  }

  if (!id_categoria || !descripcion || !ubicacion) {
    return res.status(400).json({
      ok: false,
      mensaje:
        "Categoria, descripcion y ubicacion son campos obligatorios para actualizar el reclamo",
    });
  }

  if (typeof descripcion !== "string" || typeof ubicacion !== "string") {
    return res
      .status(400)
      .json({
        ok: false,
        mensaje: "La descripción y ubicación deben ser formato de texto",
      });
  }

  try {
    const resultado = await editarReclamoEnDB({
      id,
      id_usuario,
      rol,
      id_categoria,
      descripcion,
      ubicacion,
    });
    if (resultado.error) {
      return res
        .status(resultado.error)
        .json({ ok: false, mensaje: resultado.mensaje });
    }
    return res.json({
      ok: true,
      mensaje: "Reclamo actualizado exitosamente",
      reclamo: resultado.reclamo,
    });
  } catch (error) {
    next(error);
  }
};
