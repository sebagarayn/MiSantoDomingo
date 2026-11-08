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

// Función auxiliar para detectar intentos de inyección HTML o XSS
const contieneHtmlOXss = (texto) => /<[a-z/][\s\S]*>/i.test(texto);

export const crearReclamo = async (req, res, next) => {
  const { id_categoria, descripcion, ubicacion, latitud, longitud } = req.body;
  const id_usuario = req.usuario.id_usuario;

  if (!id_categoria || !descripcion || !ubicacion) {
    return res.status(400).json({
      ok: false,
      mensaje: "Categoria, descripcion y ubicacion son obligatorios",
    });
  }

  if (typeof descripcion !== "string" || typeof ubicacion !== "string") {
    return res.status(400).json({
      ok: false,
      mensaje: "La descripción y ubicación deben ser formato de texto",
    });
  }

  // Protección XSS: Se rechaza cualquier contenido con etiquetas HTML o scripts
  if (contieneHtmlOXss(descripcion) || contieneHtmlOXss(ubicacion)) {
    return res.status(400).json({
      ok: false,
      mensaje:
        "Entrada inválida: No se permite código HTML ni scripts en los campos de texto",
    });
  }

  if (descripcion.trim().length > 500) {
    return res.status(400).json({
      ok: false,
      mensaje: "La descripción no puede superar los 500 caracteres",
    });
  }

  // Bloquea categorías no numéricas
  if (!Number.isInteger(Number(id_categoria)) || Number(id_categoria) <= 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "La categoría debe ser un identificador numérico válido",
    });
  }

  // Validar que las coordenadas se envíen juntas y sean correctas.
  const tieneLatitud = latitud !== undefined && latitud !== null && latitud !== "";
  const tieneLongitud = longitud !== undefined && longitud !== null && longitud !== "";

  if (tieneLatitud !== tieneLongitud) {
    return res.status(400).json({
      ok: false,
      mensaje: "Debe enviar ambas coordenadas: latitud y longitud",
    });
  }

  if (
    tieneLatitud &&
    (
      !Number.isFinite(Number(latitud)) ||
      !Number.isFinite(Number(longitud)) ||
      Number(latitud) < -90 ||
      Number(latitud) > 90 ||
      Number(longitud) < -180 ||
      Number(longitud) > 180
    )
  ) {
    return res.status(400).json({
      ok: false,
      mensaje: "Las coordenadas ingresadas no son válidas",
    });
  }

  const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const nuevoReclamo = await crearReclamoEnDB({
      id_usuario,
      id_categoria,
      descripcion: descripcion.trim(),
      ubicacion: ubicacion.trim(),
      foto_url,
      latitud: tieneLatitud ? Number(latitud) : null,
      longitud: tieneLongitud ? Number(longitud) : null,
    });
    return res.status(201).json({
      ok: true,
      mensaje: "Reclamo ingresado exitosamente",
      reclamo: nuevoReclamo,
    });
  } catch (error) {
    next(error);
  }
};

export const listarReclamos = async (req, res, next) => {
  const { rol, id_usuario } = req.usuario;
  const { estado, id_categoria, id_unidad, busqueda, pagina, limite } =
    req.query;

  // Validación de filtros
  const estadosValidos = [
    "Pendiente",
    "En Revisión",
    "Derivado",
    "Resuelto",
    "Rechazado",
  ];

  if (estado && !estadosValidos.includes(estado)) {
    return res.status(400).json({
      ok: false,
      mensaje: `El filtro de estado '${estado}' es inválido. Estados permitidos: ${estadosValidos.join(", ")}`,
    });
  }

  if (
    id_categoria &&
    (!Number.isInteger(Number(id_categoria)) || Number(id_categoria) <= 0)
  ) {
    return res.status(400).json({
      ok: false,
      mensaje: "El filtro de categoría debe ser un número entero válido",
    });
  }

  if (
    id_unidad &&
    (!Number.isInteger(Number(id_unidad)) || Number(id_unidad) <= 0)
  ) {
    return res.status(400).json({
      ok: false,
      mensaje: "El filtro de unidad debe ser un número entero válido",
    });
  }

  if (busqueda && (typeof busqueda !== "string" || busqueda.length > 100)) {
    return res.status(400).json({
      ok: false,
      mensaje: "El texto de búsqueda no puede superar los 100 caracteres",
    });
  }

  // Paginación segura: por defecto página 1 y límite 20
  const numPagina = Math.max(1, parseInt(pagina, 10) || 1);
  const numLimite = Math.min(100, Math.max(1, parseInt(limite, 10) || 20));

  try {
    const resultado = await listarReclamosDeDB({
      rol,
      id_usuario,
      estado,
      id_categoria,
      id_unidad,
      busqueda,
      pagina: numPagina,
      limite: numLimite,
    });

    return res.json({
      ok: true,
      total: resultado.total,
      pagina: resultado.paginaActual,
      total_paginas: resultado.totalPaginas,
      limite: resultado.limite,
      reclamos: resultado.reclamos,
    });
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

  if (observacion && contieneHtmlOXss(observacion)) {
    return res.status(400).json({
      ok: false,
      mensaje: "No se permite contenido HTML o scripts en la observación",
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

  if (respuesta_formal && contieneHtmlOXss(respuesta_formal)) {
    return res.status(400).json({
      ok: false,
      mensaje: "No se permite contenido HTML o scripts en la respuesta formal",
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

  // Validación estricta con Number.isInteger (evita trampas como '5abc')
  const puntajeNumero = Number(puntaje);
  if (
    puntaje === undefined ||
    puntaje === null ||
    typeof puntaje === "boolean" ||
    !Number.isInteger(puntajeNumero) ||
    String(puntaje).trim() !== String(puntajeNumero) ||
    puntajeNumero < 1 ||
    puntajeNumero > 5
  ) {
    return res.status(400).json({
      ok: false,
      mensaje: "La calificación debe ser un número entero entre 1 y 5",
    });
  }

  if (comentario && contieneHtmlOXss(comentario)) {
    return res.status(400).json({
      ok: false,
      mensaje: "No se permite contenido HTML o scripts en el comentario",
    });
  }

  try {
    const resultado = await calificarReclamoEnDB({
      id,
      id_usuario,
      estrellas: puntajeNumero,
      comentario: comentario ? comentario.trim() : null,
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
    next(error);
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
    return res.status(400).json({
      ok: false,
      mensaje: "La descripción y ubicación deben ser formato de texto",
    });
  }

  if (contieneHtmlOXss(descripcion) || contieneHtmlOXss(ubicacion)) {
    return res.status(400).json({
      ok: false,
      mensaje:
        "Entrada inválida: No se permite código HTML ni scripts en los campos de texto",
    });
  }

  try {
    const resultado = await editarReclamoEnDB({
      id,
      id_usuario,
      rol,
      id_categoria,
      descripcion: descripcion.trim(),
      ubicacion: ubicacion.trim(),
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
