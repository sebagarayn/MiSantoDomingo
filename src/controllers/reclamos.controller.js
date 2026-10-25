import {
  crearReclamoEnDB,
  listarReclamosDeDB,
  consultarReclamoPorFolioEnDB,
  obtenerDetalleReclamoEnDB,
  actualizarEstadoReclamoEnDB,
  cancelarReclamoEnDB,
  calificarReclamoEnDB,
} from "../services/reclamos.service.js";

export const crearReclamo = async (req, res) => {
  const { id_categoria, descripcion, ubicacion } = req.body;
  const id_usuario = req.usuario.id_usuario;

  if (!id_categoria || !descripcion || !ubicacion) {
    return res.status(400).json({
      ok: false,
      mensaje: "Categoria, descripcion y ubicacion son obligatorios",
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
    console.error("Error al crear reclamo:", error);
    return res
      .status(500)
      .json({
        ok: false,
        mensaje: "Error en el servidor al registrar el reclamo",
      });
  }
};

export const listarReclamos = async (req, res) => {
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
    console.error("Error al listar reclamos:", error);
    return res
      .status(500)
      .json({ ok: false, mensaje: "Error al obtener reclamos" });
  }
};

export const consultarPorFolio = async (req, res) => {
  const { folio } = req.params;
  try {
    const resultado = await consultarReclamoPorFolioEnDB(folio);
    if (!resultado) {
      return res
        .status(404)
        .json({
          ok: false,
          mensaje: "No se encontro ningun reclamo con el folio ingresado",
        });
    }
    return res.json({ ok: true, ...resultado });
  } catch (error) {
    console.error("Error al consultar por folio:", error);
    return res
      .status(500)
      .json({ ok: false, mensaje: "Error al consultar reclamo" });
  }
};

export const obtenerDetalleReclamo = async (req, res) => {
  const { id } = req.params;
  const { rol, id_usuario } = req.usuario;

  // Validacion de entrada: ID debe ser numerico
  if (isNaN(parseInt(id, 10))) {
    return res
      .status(400)
      .json({
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
    console.error("Error al obtener detalle de reclamo:", error);
    return res
      .status(500)
      .json({ ok: false, mensaje: "Error al cargar reclamo" });
  }
};

export const actualizarEstado = async (req, res) => {
  const { id } = req.params;
  const { nuevo_estado, id_unidad_destino, observacion, respuesta_formal } =
    req.body;
  const id_funcionario = req.usuario.id_usuario;

  if (isNaN(parseInt(id, 10))) {
    return res
      .status(400)
      .json({
        ok: false,
        mensaje: "El ID del reclamo debe ser un número entero válido",
      });
  }

  if (!nuevo_estado) {
    return res
      .status(400)
      .json({ ok: false, mensaje: "El nuevo estado es obligatorio" });
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
    console.error("Error al actualizar estado:", error);
    return res
      .status(500)
      .json({ ok: false, mensaje: "Error al actualizar el reclamo" });
  }
};

export const cancelarReclamo = async (req, res) => {
  const { id } = req.params;
  const { rol, id_usuario } = req.usuario;

  if (isNaN(parseInt(id, 10))) {
    return res
      .status(400)
      .json({
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
    console.error("Error al cancelar reclamo:", error);
    return res
      .status(500)
      .json({ ok: false, mensaje: "Error al cancelar el reclamo" });
  }
};

export const calificarReclamo = async (req, res) => {
  const { id } = req.params;
  const { puntaje, comentario } = req.body;
  const { id_usuario } = req.usuario;

  if (isNaN(parseInt(id, 10))) {
    return res
      .status(400)
      .json({
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
    return res
      .status(201)
      .json({
        ok: true,
        mensaje: "Gracias por calificar la respuesta municipal",
      });
  } catch (error) {
    console.error("Error al calificar reclamo:", error);
    return res
      .status(500)
      .json({ ok: false, mensaje: "Error al registrar la calificacion" });
  }
};
