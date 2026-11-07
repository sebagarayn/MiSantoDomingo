import pool from "../config/db.js";

// Texto que ve el vecino segun el nuevo estado de su reclamo
const mensajeCambioEstado = (folio, estado) => {
  switch (estado) {
    case "En Revisión":
      return `Tu reclamo ${folio} está en revisión.`;
    case "Derivado":
      return `Tu reclamo ${folio} fue derivado a otra unidad municipal.`;
    case "Resuelto":
      return `Tu reclamo ${folio} fue resuelto. Ya puedes calificar la atención.`;
    case "Rechazado":
      return `Tu reclamo ${folio} fue rechazado. Revisa la respuesta en el detalle.`;
    default:
      return `Tu reclamo ${folio} cambió a estado «${estado}».`;
  }
};


// Crea el aviso usando el MISMO cliente de la transaccion que cambia el estado:
// si algo falla, se hace ROLLBACK de todo y nunca queda un estado sin aviso (ni al reves).
export const crearNotificacionCambioEstado = async (
  cliente,
  { id_usuario, id_reclamo, folio, estado },
) => {
  await cliente.query(
    `INSERT INTO notificaciones (id_usuario, id_reclamo, tipo, mensaje)
     VALUES ($1, $2, 'cambio_estado', $3)`,
    [id_usuario, id_reclamo, mensajeCambioEstado(folio, estado)],
  );
};



// Lista las notificaciones del usuario autenticado (nunca las de otros)
export const listarNotificacionesDeDB = async ({
  id_usuario,
  soloNoLeidas,
  limite,
}) => {
  const filtroLeida = soloNoLeidas ? "AND NOT n.leida" : "";

  const lista = await pool.query(
    `SELECT n.id_notificacion, n.id_reclamo, r.folio, n.tipo, n.mensaje,
            n.leida, n.creado_en
     FROM notificaciones n
     JOIN reclamos r ON r.id_reclamo = n.id_reclamo
     WHERE n.id_usuario = $1 ${filtroLeida}
     ORDER BY n.creado_en DESC, n.id_notificacion DESC
     LIMIT $2`,
    [id_usuario, limite],
  );

  // El contador del icono siempre cuenta TODAS las no leidas, aunque la lista venga filtrada
  const conteo = await pool.query(
    `SELECT COUNT(*)::int AS no_leidas
     FROM notificaciones
     WHERE id_usuario = $1 AND NOT leida`,
    [id_usuario],
  );

  return { notificaciones: lista.rows, no_leidas: conteo.rows[0].no_leidas };
};



// Marca una notificacion como leida. El "AND id_usuario" impide tocar las de otra persona:
// si no es suya responde igual que si no existiera (404), sin revelar nada.
export const marcarLeidaEnDB = async ({ id, id_usuario }) => {
  const resultado = await pool.query(
    `UPDATE notificaciones SET leida = TRUE
     WHERE id_notificacion = $1 AND id_usuario = $2
     RETURNING id_notificacion`,
    [id, id_usuario],
  );
  return resultado.rowCount > 0;
};

export const marcarTodasLeidasEnDB = async (id_usuario) => {
  const resultado = await pool.query(
    `UPDATE notificaciones SET leida = TRUE
     WHERE id_usuario = $1 AND NOT leida`,
    [id_usuario],
  );
  return resultado.rowCount;
};