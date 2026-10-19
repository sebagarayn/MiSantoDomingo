import pool from "../config/db.js";

// Funcion auxiliar para generar folios unicos estilo: SD-2026-A1B2C3
const generarFolioUnico = () => {
  const anio = new Date().getFullYear();
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return `SD-${anio}-${codigo}`;
};

// 1. Ingresar un nuevo reclamo ciudadano (Vecino)
export const crearReclamo = async (req, res) => {
  const { id_categoria, descripcion, ubicacion } = req.body;
  const id_usuario = req.usuario.id_usuario;

  if (!id_categoria || !descripcion || !ubicacion) {
    return res.status(400).json({
      ok: false,
      mensaje: "Categoria, descripcion y ubicacion son obligatorios",
    });
  }

  // Si adjunto foto, guardamos la ruta relativa
  const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

  const cliente = await pool.connect();

  try {
    // Usamos una transaccion para asegurar que se cree el reclamo y su primer historial juntos
    await cliente.query("BEGIN");

    // 1. Buscamos la unidad OIRS Central (unidad inicial por defecto)
    const unidadInicial = await cliente.query(
      "SELECT id_unidad FROM unidades WHERE nombre = 'OIRS Central' LIMIT 1",
    );
    const id_unidad_asignada = unidadInicial.rows[0]?.id_unidad || 1;

    // 2. Generamos un folio unico
    const folio = generarFolioUnico();

    // 3. Insertamos el reclamo
    const insertReclamoQuery = `
      INSERT INTO reclamos (
        folio, id_usuario, id_categoria, id_unidad_asignada, 
        descripcion, ubicacion, foto_url, estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pendiente')
      RETURNING *
    `;
    const resReclamo = await cliente.query(insertReclamoQuery, [
      folio,
      id_usuario,
      id_categoria,
      id_unidad_asignada,
      descripcion.trim(),
      ubicacion.trim(),
      foto_url,
    ]);
    const nuevoReclamo = resReclamo.rows[0];

    // 4. Registramos el primer evento en el historial de trazabilidad
    const insertHistorialQuery = `
      INSERT INTO historial_reclamos (
        id_reclamo, id_usuario, estado, observacion
      )
      VALUES ($1, $2, 'Pendiente', 'Reclamo ingresado por el vecino')
    `;
    await cliente.query(insertHistorialQuery, [
      nuevoReclamo.id_reclamo,
      id_usuario,
    ]);

    await cliente.query("COMMIT");

    return res.status(201).json({
      ok: true,
      mensaje: "Reclamo ingresado exitosamente",
      reclamo: nuevoReclamo,
    });
  } catch (error) {
    await cliente.query("ROLLBACK");
    console.error("Error al crear reclamo:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error en el servidor al registrar el reclamo",
    });
  } finally {
    cliente.release();
  }
};

// 2. Listar reclamos (Vecino ve solo los suyos; Admin ve todos con filtros)
export const listarReclamos = async (req, res) => {
  const { rol, id_usuario } = req.usuario;
  const { estado, id_categoria, id_unidad, busqueda } = req.query;

  try {
    let consulta = `
      SELECT 
        r.id_reclamo, r.id_usuario, r.folio, r.descripcion, r.ubicacion, r.foto_url,
        r.estado, r.fecha_ingreso, r.respuesta_formal,
        c.nombre AS categoria,
        u.nombre AS unidad_asignada,
        usr.nombre AS nombre_vecino,
        GREATEST(0, 20 - FLOOR(EXTRACT(EPOCH FROM (NOW() - r.fecha_ingreso)) / 86400)::INTEGER) AS dias_restantes,
        (EXTRACT(EPOCH FROM (NOW() - r.fecha_ingreso)) / 86400 > 20) AS vencido,
        -- Subconsulta para traer toda la trazabilidad historica con motivos de derivacion (RF-05)
        (
          SELECT json_agg(
            json_build_object(
              'estado', h.estado,
              'fecha', h.fecha,
              'observacion', h.observacion,
              'unidad_destino', u_dest.nombre,
              'nombre_responsable', usr_h.nombre
            ) ORDER BY h.fecha ASC
          )
          FROM historial_reclamos h
          JOIN usuarios usr_h ON h.id_usuario = usr_h.id_usuario
          LEFT JOIN unidades u_dest ON h.id_unidad_destino = u_dest.id_unidad
          WHERE h.id_reclamo = r.id_reclamo
        ) AS historial
      FROM reclamos r
      JOIN categorias c ON r.id_categoria = c.id_categoria
      JOIN unidades u ON r.id_unidad_asignada = u.id_unidad
      JOIN usuarios usr ON r.id_usuario = usr.id_usuario
      WHERE 1=1
    `;
    const valores = [];
    let contador = 1;

    // Si es vecino, filtramos obligatoriamente por sus propios reclamos
    if (rol === "vecino") {
      consulta += ` AND r.id_usuario = $${contador}`;
      valores.push(id_usuario);
      contador++;
    }

    // Filtros opcionales para administradores
    if (estado) {
      consulta += ` AND r.estado = $${contador}`;
      valores.push(estado);
      contador++;
    }

    if (id_categoria) {
      consulta += ` AND r.id_categoria = $${contador}`;
      valores.push(id_categoria);
      contador++;
    }

    if (id_unidad) {
      consulta += ` AND r.id_unidad_asignada = $${contador}`;
      valores.push(id_unidad);
      contador++;
    }

    if (busqueda) {
      consulta += ` AND (r.folio ILIKE $${contador} OR r.descripcion ILIKE $${contador})`;
      valores.push(`%${busqueda}%`);
      contador++;
    }

    consulta += " ORDER BY r.fecha_ingreso DESC";

    const resultado = await pool.query(consulta, valores);

    return res.json({
      ok: true,
      total: resultado.rows.length,
      reclamos: resultado.rows,
    });
  } catch (error) {
    console.error("Error al listar reclamos:", error);
    return res
      .status(500)
      .json({ ok: false, mensaje: "Error al obtener reclamos" });
  }
};

// 3. Consulta publica por numero de folio (sin inicio de sesion, RF-03)
export const consultarPorFolio = async (req, res) => {
  const { folio } = req.params;

  try {
    const folioLimpio = folio.trim();

    const reclamoRes = await pool.query(
      `SELECT 
        r.id_reclamo, r.folio, r.estado, r.fecha_ingreso, r.respuesta_formal,
        c.nombre AS categoria,
        u.nombre AS unidad_asignada,
        GREATEST(0, 20 - FLOOR(EXTRACT(EPOCH FROM (NOW() - r.fecha_ingreso)) / 86400)::INTEGER) AS dias_restantes,
        (EXTRACT(EPOCH FROM (NOW() - r.fecha_ingreso)) / 86400 > 20) AS vencido
      FROM reclamos r
      JOIN categorias c ON r.id_categoria = c.id_categoria
      JOIN unidades u ON r.id_unidad_asignada = u.id_unidad
      WHERE r.folio = $1`,
      [folioLimpio],
    );

    if (reclamoRes.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "No se encontro ningun reclamo con el folio ingresado",
      });
    }

    const reclamo = reclamoRes.rows[0];

    // Obtenemos tambien la trazabilidad publica (sin datos sensibles)
    const historialRes = await pool.query(
      `SELECT h.estado, h.observacion, h.fecha, u.nombre AS unidad_destino
       FROM historial_reclamos h
       LEFT JOIN unidades u ON h.id_unidad_destino = u.id_unidad
       WHERE h.id_reclamo = $1
       ORDER BY h.fecha ASC`,
      [reclamo.id_reclamo],
    );

    // Verificamos si ya tiene calificacion ciudadana
    const calificacionRes = await pool.query(
      "SELECT puntaje, comentario FROM calificaciones WHERE id_reclamo = $1",
      [reclamo.id_reclamo],
    );

    return res.json({
      ok: true,
      reclamo,
      historial: historialRes.rows,
      calificacion: calificacionRes.rows[0] || null,
    });
  } catch (error) {
    console.error("Error al consultar por folio:", error);
    return res
      .status(500)
      .json({ ok: false, mensaje: "Error al consultar reclamo" });
  }
};

// 4. Ver detalle completo de un reclamo (Para creador o administrador)
export const obtenerDetalleReclamo = async (req, res) => {
  const { id } = req.params;
  const { rol, id_usuario } = req.usuario;

  try {
    const reclamoRes = await pool.query(
      `SELECT 
        r.*, 
        c.nombre AS categoria, 
        u.nombre AS unidad_asignada,
        usr.nombre AS nombre_vecino,
        usr.correo AS correo_vecino,
        GREATEST(0, 20 - FLOOR(EXTRACT(EPOCH FROM (NOW() - r.fecha_ingreso)) / 86400)::INTEGER) AS dias_restantes,
        (EXTRACT(EPOCH FROM (NOW() - r.fecha_ingreso)) / 86400 > 20) AS vencido
      FROM reclamos r
      JOIN categorias c ON r.id_categoria = c.id_categoria
      JOIN unidades u ON r.id_unidad_asignada = u.id_unidad
      JOIN usuarios usr ON r.id_usuario = usr.id_usuario
      WHERE r.id_reclamo = $1`,
      [id],
    );

    if (reclamoRes.rows.length === 0) {
      return res
        .status(404)
        .json({ ok: false, mensaje: "Reclamo no encontrado" });
    }

    const reclamo = reclamoRes.rows[0];

    // Seguridad: Si es vecino, solo puede ver su propio reclamo
    if (rol === "vecino" && reclamo.id_usuario !== id_usuario) {
      return res.status(403).json({
        ok: false,
        mensaje: "No tienes permiso para ver este reclamo",
      });
    }

    const historialRes = await pool.query(
      `SELECT h.*, usr.nombre AS nombre_responsable, u.nombre AS unidad_destino
       FROM historial_reclamos h
       JOIN usuarios usr ON h.id_usuario = usr.id_usuario
       LEFT JOIN unidades u ON h.id_unidad_destino = u.id_unidad
       WHERE h.id_reclamo = $1
       ORDER BY h.fecha ASC`,
      [id],
    );

    const calificacionRes = await pool.query(
      "SELECT * FROM calificaciones WHERE id_reclamo = $1",
      [id],
    );

    return res.json({
      ok: true,
      reclamo,
      historial: historialRes.rows,
      calificacion: calificacionRes.rows[0] || null,
    });
  } catch (error) {
    console.error("Error al obtener detalle de reclamo:", error);
    return res
      .status(500)
      .json({ ok: false, mensaje: "Error al cargar reclamo" });
  }
};

// 5. Actualizar estado / Derivar / Cerrar reclamo (Solo Administrador OIRS)
export const actualizarEstado = async (req, res) => {
  const { id } = req.params;
  const { nuevo_estado, id_unidad_destino, observacion, respuesta_formal } =
    req.body;
  const id_funcionario = req.usuario.id_usuario;

  if (!nuevo_estado) {
    return res
      .status(400)
      .json({ ok: false, mensaje: "El nuevo estado es obligatorio" });
  }

  // Validaciones del negocio segun restricciones de base de datos
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

  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");

    // 1. Buscamos el reclamo actual
    const actualRes = await cliente.query(
      "SELECT * FROM reclamos WHERE id_reclamo = $1 FOR UPDATE",
      [id],
    );
    if (actualRes.rows.length === 0) {
      await cliente.query("ROLLBACK");
      return res
        .status(404)
        .json({ ok: false, mensaje: "Reclamo no encontrado" });
    }

    const reclamoActual = actualRes.rows[0];

    // No se puede reabrir un reclamo que ya estaba Resuelto o Rechazado
    if (["Resuelto", "Rechazado"].includes(reclamoActual.estado)) {
      await cliente.query("ROLLBACK");
      return res.status(409).json({
        ok: false,
        mensaje:
          "No se puede modificar un reclamo que ya se encuentra cerrado (Resuelto o Rechazado)",
      });
    }

    // 2. Determinamos la unidad asignada resultante
    const unidadFinal =
      nuevo_estado === "Derivado"
        ? id_unidad_destino
        : reclamoActual.id_unidad_asignada;
    const respuestaFinal =
      nuevo_estado === "Resuelto"
        ? respuesta_formal.trim()
        : reclamoActual.respuesta_formal;

    // 3. Actualizamos el reclamo
    await cliente.query(
      `UPDATE reclamos 
       SET estado = $1, id_unidad_asignada = $2, respuesta_formal = $3 
       WHERE id_reclamo = $4`,
      [nuevo_estado, unidadFinal, respuestaFinal, id],
    );

    // 4. Registramos en el historial inmutable
    await cliente.query(
      `INSERT INTO historial_reclamos (
        id_reclamo, id_usuario, id_unidad_destino, estado, observacion
      )
      VALUES ($1, $2, $3, $4, $5)`,
      [
        id,
        id_funcionario,
        nuevo_estado === "Derivado" ? id_unidad_destino : null,
        nuevo_estado,
        observacion
          ? observacion.trim()
          : nuevo_estado === "Resuelto"
            ? "Reclamo resuelto con respuesta oficial"
            : null,
      ],
    );

    await cliente.query("COMMIT");

    return res.json({
      ok: true,
      mensaje: `Reclamo actualizado exitosamente al estado: ${nuevo_estado}`,
    });
  } catch (error) {
    await cliente.query("ROLLBACK");
    console.error("Error al actualizar estado:", error);
    return res
      .status(500)
      .json({ ok: false, mensaje: "Error al actualizar el reclamo" });
  } finally {
    cliente.release();
  }
};

// 6. Cancelar reclamo (Verbo DELETE de la rubrica: el vecino anula su propio reclamo pendiente)
export const cancelarReclamo = async (req, res) => {
  const { id } = req.params;
  const { rol, id_usuario } = req.usuario;

  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");

    const reclamoRes = await cliente.query(
      "SELECT * FROM reclamos WHERE id_reclamo = $1 FOR UPDATE",
      [id],
    );

    if (reclamoRes.rows.length === 0) {
      await cliente.query("ROLLBACK");
      return res
        .status(404)
        .json({ ok: false, mensaje: "Reclamo no encontrado" });
    }

    const reclamo = reclamoRes.rows[0];

    // Solo el creador o un admin pueden anular
    if (rol === "vecino" && reclamo.id_usuario !== id_usuario) {
      await cliente.query("ROLLBACK");
      return res.status(403).json({
        ok: false,
        mensaje: "No tienes permiso para cancelar este reclamo",
      });
    }

    // Solo se permite anular si aun esta en estado Pendiente
    if (reclamo.estado !== "Pendiente") {
      await cliente.query("ROLLBACK");
      return res.status(409).json({
        ok: false,
        mensaje:
          "Solo se pueden cancelar reclamos que esten en estado Pendiente",
      });
    }

    // Cambiamos el estado a Rechazado (baja logica) registrando la anulacion en el historial
    await cliente.query(
      "UPDATE reclamos SET estado = 'Rechazado' WHERE id_reclamo = $1",
      [id],
    );

    await cliente.query(
      `INSERT INTO historial_reclamos (id_reclamo, id_usuario, estado, observacion)
       VALUES ($1, $2, 'Rechazado', 'Reclamo cancelado voluntariamente por el usuario')`,
      [id, id_usuario],
    );

    await cliente.query("COMMIT");

    return res.json({
      ok: true,
      mensaje: "Reclamo cancelado exitosamente",
    });
  } catch (error) {
    await cliente.query("ROLLBACK");
    console.error("Error al cancelar reclamo:", error);
    return res
      .status(500)
      .json({ ok: false, mensaje: "Error al cancelar el reclamo" });
  } finally {
    cliente.release();
  }
};

// 7. Calificacion ciudadana de 1 a 5 estrellas (RF-09, voto unico)
export const calificarReclamo = async (req, res) => {
  const { id } = req.params;
  const { puntaje, comentario } = req.body;
  const { id_usuario } = req.usuario;

  const estrellas = parseInt(puntaje, 10);
  if (isNaN(estrellas) || estrellas < 1 || estrellas > 5) {
    return res.status(400).json({
      ok: false,
      mensaje: "La calificacion debe ser un numero entero entre 1 y 5",
    });
  }

  try {
    // 1. Verificamos que el reclamo exista y pertenezca al usuario
    const reclamoRes = await pool.query(
      "SELECT id_reclamo, id_usuario, estado FROM reclamos WHERE id_reclamo = $1",
      [id],
    );

    if (reclamoRes.rows.length === 0) {
      return res
        .status(404)
        .json({ ok: false, mensaje: "Reclamo no encontrado" });
    }

    const reclamo = reclamoRes.rows[0];

    if (reclamo.id_usuario !== id_usuario) {
      return res.status(403).json({
        ok: false,
        mensaje: "Solo quien ingreso el reclamo puede calificarlo",
      });
    }

    if (reclamo.estado !== "Resuelto") {
      return res.status(409).json({
        ok: false,
        mensaje:
          "Solo se pueden calificar reclamos que esten en estado Resuelto",
      });
    }

    // 2. Insertamos la calificacion (si ya voto, la restriccion UNIQUE de la BD lo impedira)
    await pool.query(
      "INSERT INTO calificaciones (id_reclamo, puntaje, comentario) VALUES ($1, $2, $3)",
      [id, estrellas, comentario ? comentario.trim() : null],
    );

    return res.status(201).json({
      ok: true,
      mensaje: "Gracias por calificar la respuesta municipal",
    });
  } catch (error) {
    // Codigo 23505 = violacion de constraint UNIQUE en PostgreSQL (ya voto)
    if (error.code === "23505") {
      return res.status(409).json({
        ok: false,
        mensaje:
          "Este reclamo ya cuenta con una calificacion registrada (voto unico)",
      });
    }
    console.error("Error al calificar reclamo:", error);
    return res
      .status(500)
      .json({ ok: false, mensaje: "Error al registrar la calificacion" });
  }
};
