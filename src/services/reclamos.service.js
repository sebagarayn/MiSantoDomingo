import pool from "../config/db.js";

// Genera un folio alfanumérico único estilo: SD-2026-A1B2C3
const generarFolioUnico = () => {
  const anio = new Date().getFullYear();
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return `SD-${anio}-${codigo}`;
};

// 1. Servicio: Crear reclamo con transacción ACID (Reclamo + primer evento de historial)
export const crearReclamoEnDB = async ({
  id_usuario,
  id_categoria,
  descripcion,
  ubicacion,
  foto_url,
}) => {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");

    const unidadInicial = await cliente.query(
      "SELECT id_unidad FROM unidades WHERE nombre = 'OIRS Central' LIMIT 1",
    );
    const id_unidad_asignada = unidadInicial.rows[0]?.id_unidad || 1;
    const folio = generarFolioUnico();

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

    const insertHistorialQuery = `
      INSERT INTO historial_reclamos (id_reclamo, id_usuario, estado, observacion)
      VALUES ($1, $2, 'Pendiente', 'Reclamo ingresado por el vecino')
    `;
    await cliente.query(insertHistorialQuery, [
      nuevoReclamo.id_reclamo,
      id_usuario,
    ]);

    await cliente.query("COMMIT");
    return nuevoReclamo;
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
};

// 2. Servicio: Listar reclamos con filtros, cálculo legal de 20 días y trazabilidad histórica
export const listarReclamosDeDB = async ({
  rol,
  id_usuario,
  estado,
  id_categoria,
  id_unidad,
  busqueda,
}) => {
  let consulta = `
    SELECT 
      r.id_reclamo, r.id_usuario, r.folio, r.descripcion, r.ubicacion, r.foto_url,
      r.estado, r.fecha_ingreso, r.respuesta_formal,
      c.nombre AS categoria,
      u.nombre AS unidad_asignada,
      usr.nombre AS nombre_vecino,
      GREATEST(0, 20 - FLOOR(EXTRACT(EPOCH FROM (NOW() - r.fecha_ingreso)) / 86400)::INTEGER) AS dias_restantes,
      (EXTRACT(EPOCH FROM (NOW() - r.fecha_ingreso)) / 86400 > 20) AS vencido,
      (SELECT puntaje FROM calificaciones WHERE id_reclamo = r.id_reclamo LIMIT 1) AS calificacion,
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

  if (rol === "vecino") {
    consulta += ` AND r.id_usuario = $${contador}`;
    valores.push(id_usuario);
    contador++;
  }

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
    consulta += ` AND (r.folio ILIKE $${contador} OR r.descripcion ILIKE $${contador} OR r.ubicacion ILIKE $${contador})`;
    valores.push(`%${busqueda}%`);
    contador++;
  }

  consulta += " ORDER BY r.fecha_ingreso DESC";
  const resultado = await pool.query(consulta, valores);
  return resultado.rows;
};

// 3. Servicio: Consulta pública por folio
export const consultarReclamoPorFolioEnDB = async (folio) => {
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
    [folio.trim()],
  );

  if (reclamoRes.rows.length === 0) return null;
  const reclamo = reclamoRes.rows[0];

  const historialRes = await pool.query(
    `SELECT h.estado, h.observacion, h.fecha, u.nombre AS unidad_destino
     FROM historial_reclamos h
     LEFT JOIN unidades u ON h.id_unidad_destino = u.id_unidad
     WHERE h.id_reclamo = $1
     ORDER BY h.fecha ASC`,
    [reclamo.id_reclamo],
  );

  const calificacionRes = await pool.query(
    "SELECT puntaje, comentario FROM calificaciones WHERE id_reclamo = $1",
    [reclamo.id_reclamo],
  );

  return {
    reclamo,
    historial: historialRes.rows,
    calificacion: calificacionRes.rows[0] || null,
  };
};

// 4. Servicio: Obtener detalle completo para dueño o admin
export const obtenerDetalleReclamoEnDB = async (id, rol, id_usuario) => {
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

  if (reclamoRes.rows.length === 0)
    return { error: 404, mensaje: "Reclamo no encontrado" };
  const reclamo = reclamoRes.rows[0];

  if (rol === "vecino" && reclamo.id_usuario !== id_usuario) {
    return { error: 403, mensaje: "No tienes permiso para ver este reclamo" };
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

  return {
    reclamo,
    historial: historialRes.rows,
    calificacion: calificacionRes.rows[0] || null,
  };
};

// 5. Servicio: Derivar o cerrar reclamo (Admin)
export const actualizarEstadoReclamoEnDB = async ({
  id,
  id_funcionario,
  nuevo_estado,
  id_unidad_destino,
  observacion,
  respuesta_formal,
}) => {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");

    const actualRes = await cliente.query(
      "SELECT * FROM reclamos WHERE id_reclamo = $1 FOR UPDATE",
      [id],
    );
    if (actualRes.rows.length === 0) {
      await cliente.query("ROLLBACK");
      return { error: 404, mensaje: "Reclamo no encontrado" };
    }

    const reclamoActual = actualRes.rows[0];
    if (["Resuelto", "Rechazado"].includes(reclamoActual.estado)) {
      await cliente.query("ROLLBACK");
      return {
        error: 409,
        mensaje:
          "No se puede modificar un reclamo que ya se encuentra cerrado (Resuelto o Rechazado)",
      };
    }

    const unidadFinal =
      nuevo_estado === "Derivado"
        ? id_unidad_destino
        : reclamoActual.id_unidad_asignada;
    const respuestaFinal =
      nuevo_estado === "Resuelto"
        ? respuesta_formal.trim()
        : reclamoActual.respuesta_formal;

    await cliente.query(
      `UPDATE reclamos 
       SET estado = $1, id_unidad_asignada = $2, respuesta_formal = $3 
       WHERE id_reclamo = $4`,
      [nuevo_estado, unidadFinal, respuestaFinal, id],
    );

    await cliente.query(
      `INSERT INTO historial_reclamos (id_reclamo, id_usuario, id_unidad_destino, estado, observacion)
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
    return { ok: true };
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
};

// 6. Servicio: Cancelar reclamo propio en estado Pendiente
export const cancelarReclamoEnDB = async ({ id, id_usuario, rol }) => {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");

    const reclamoRes = await cliente.query(
      "SELECT * FROM reclamos WHERE id_reclamo = $1 FOR UPDATE",
      [id],
    );
    if (reclamoRes.rows.length === 0) {
      await cliente.query("ROLLBACK");
      return { error: 404, mensaje: "Reclamo no encontrado" };
    }

    const reclamo = reclamoRes.rows[0];
    if (rol === "vecino" && reclamo.id_usuario !== id_usuario) {
      await cliente.query("ROLLBACK");
      return {
        error: 403,
        mensaje: "No tienes permiso para cancelar este reclamo",
      };
    }

    if (reclamo.estado !== "Pendiente") {
      await cliente.query("ROLLBACK");
      return {
        error: 409,
        mensaje:
          "Solo se pueden cancelar reclamos que esten en estado Pendiente",
      };
    }

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
    return { ok: true };
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
};

// 7. Servicio: Calificación ciudadana única (1-5 estrellas)
export const calificarReclamoEnDB = async ({
  id,
  id_usuario,
  estrellas,
  comentario,
}) => {
  const reclamoRes = await pool.query(
    "SELECT id_reclamo, id_usuario, estado FROM reclamos WHERE id_reclamo = $1",
    [id],
  );
  if (reclamoRes.rows.length === 0)
    return { error: 404, mensaje: "Reclamo no encontrado" };

  const reclamo = reclamoRes.rows[0];
  if (reclamo.id_usuario !== id_usuario) {
    return {
      error: 403,
      mensaje: "Solo quien ingreso el reclamo puede calificarlo",
    };
  }

  if (reclamo.estado !== "Resuelto") {
    return {
      error: 409,
      mensaje: "Solo se pueden calificar reclamos que esten en estado Resuelto",
    };
  }

  try {
    await pool.query(
      "INSERT INTO calificaciones (id_reclamo, puntaje, comentario) VALUES ($1, $2, $3)",
      [id, estrellas, comentario ? comentario.trim() : null],
    );
    return { ok: true };
  } catch (error) {
    if (error.code === "23505") {
      return {
        error: 409,
        mensaje:
          "Este reclamo ya cuenta con una calificacion registrada (voto unico)",
      };
    }
    throw error;
  }
};

// 8. Servicio: Editar antecedentes completos del reclamo (Verbo PUT del vecino mientras este Pendiente)
export const editarReclamoEnDB = async ({
  id,
  id_usuario,
  rol,
  id_categoria,
  descripcion,
  ubicacion,
}) => {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");

    // 1. Buscamos el reclamo
    const reclamoRes = await cliente.query(
      "SELECT * FROM reclamos WHERE id_reclamo = $1 FOR UPDATE",
      [id],
    );
    if (reclamoRes.rows.length === 0) {
      await cliente.query("ROLLBACK");
      return { error: 404, mensaje: "Reclamo no encontrado" };
    }

    const reclamo = reclamoRes.rows[0];

    // 2. Solo el dueño del reclamo o un admin pueden editarlo
    if (rol === "vecino" && reclamo.id_usuario !== id_usuario) {
      await cliente.query("ROLLBACK");
      return {
        error: 403,
        mensaje: "No tienes permiso para editar este reclamo",
      };
    }

    // 3. Regla estricta: Solo se puede editar si sigue en Pendiente
    if (reclamo.estado !== "Pendiente") {
      await cliente.query("ROLLBACK");
      return {
        error: 409,
        mensaje:
          "Solo se pueden editar los datos de reclamos que esten en estado Pendiente",
      };
    }

    // 4. Reemplazamos los datos del reclamo (PUT)
    const updateQuery = `
      UPDATE reclamos 
      SET id_categoria = $1, descripcion = $2, ubicacion = $3 
      WHERE id_reclamo = $4 
      RETURNING *
    `;
    const resUpdate = await cliente.query(updateQuery, [
      id_categoria,
      descripcion.trim(),
      ubicacion.trim(),
      id,
    ]);

    // 5. Dejamos constancia en la trazabilidad inmutable
    await cliente.query(
      `INSERT INTO historial_reclamos (id_reclamo, id_usuario, estado, observacion)
       VALUES ($1, $2, 'Pendiente', 'Antecedentes del reclamo actualizados por el usuario (PUT)')`,
      [id, id_usuario],
    );

    await cliente.query("COMMIT");
    return { ok: true, reclamo: resUpdate.rows[0] };
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
};
