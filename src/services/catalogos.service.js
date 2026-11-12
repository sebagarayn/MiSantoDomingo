import pool from "../config/db.js";

// Consulta en la base de datos todas las categorias oficiales
export const obtenerTodasCategorias = async () => {
  const resultado = await pool.query(
    "SELECT * FROM categorias ORDER BY id_categoria ASC",
  );
  return resultado.rows;
};

// Consulta en la base de datos todas las unidades municipales
export const obtenerTodasUnidades = async () => {
  const resultado = await pool.query(
    "SELECT * FROM unidades ORDER BY id_unidad ASC",
  );
  return resultado.rows;
};

// Las dos tablas tienen la misma forma (id + nombre), asi que se describen aqui
// y comparten el mismo codigo. Los nombres de tabla/columna salen de ESTA constante,
// nunca del cliente; los valores del cliente viajan siempre como parametros ($1, $2).
export const CATALOGOS = {
  categorias: {
    tabla: "categorias",
    id: "id_categoria",
    // Donde se usa el registro: si hay filas ahi, no se puede eliminar
    usos: [{ tabla: "reclamos", columna: "id_categoria" }],
  },
  unidades: {
    tabla: "unidades",
    id: "id_unidad",
    usos: [
      { tabla: "reclamos", columna: "id_unidad_asignada" },
      { tabla: "historial_reclamos", columna: "id_unidad_destino" },
    ],
  },
};

// Todo reclamo nuevo entra a esta unidad: no se puede eliminar ni renombrar
export const UNIDAD_DE_INGRESO = "OIRS Central";

const esUnidadProtegida = (clave, nombre) =>
  clave === "unidades" && nombre === UNIDAD_DE_INGRESO;

// Existe otro registro con el mismo nombre (sin distinguir mayusculas)?
const existeNombre = async (cat, nombre, excluirId = 0) => {
  const r = await pool.query(
    `SELECT 1 FROM ${cat.tabla}
     WHERE lower(btrim(nombre)) = lower($1) AND ${cat.id} <> $2
     LIMIT 1`,
    [nombre, excluirId],
  );
  return r.rowCount > 0;
};

// Cuantos registros de reclamos usan este elemento
const contarUsos = async (cat, id) => {
  let total = 0;
  for (const uso of cat.usos) {
    const r = await pool.query(
      `SELECT COUNT(*)::int AS total FROM ${uso.tabla} WHERE ${uso.columna} = $1`,
      [id],
    );
    total += r.rows[0].total;
  }
  return total;
};

// Cada funcion devuelve { estado, ... } y el controlador lo traduce a HTTP:
// ok -> 200/201 | duplicado, protegido, en_uso -> 409 | no_existe -> 404

export const crearElemento = async (clave, nombre) => {
  const cat = CATALOGOS[clave];
  if (await existeNombre(cat, nombre)) return { estado: "duplicado" };

  try {
    const r = await pool.query(
      `INSERT INTO ${cat.tabla} (nombre) VALUES ($1) RETURNING *`,
      [nombre],
    );
    return { estado: "ok", registro: r.rows[0] };
  } catch (error) {
    // 23505: otro admin creo el mismo nombre justo antes (restriccion UNIQUE)
    if (error.code === "23505") return { estado: "duplicado" };
    throw error;
  }
};

export const actualizarElemento = async (clave, id, nombre) => {
  const cat = CATALOGOS[clave];

  const actual = await pool.query(
    `SELECT nombre FROM ${cat.tabla} WHERE ${cat.id} = $1`,
    [id],
  );
  if (actual.rowCount === 0) return { estado: "no_existe" };

  if (esUnidadProtegida(clave, actual.rows[0].nombre) && nombre !== UNIDAD_DE_INGRESO) {
    return { estado: "protegido" };
  }
  if (await existeNombre(cat, nombre, id)) return { estado: "duplicado" };

  try {
    const r = await pool.query(
      `UPDATE ${cat.tabla} SET nombre = $1 WHERE ${cat.id} = $2 RETURNING *`,
      [nombre, id],
    );
    return { estado: "ok", registro: r.rows[0] };
  } catch (error) {
    if (error.code === "23505") return { estado: "duplicado" };
    throw error;
  }
};

export const eliminarElemento = async (clave, id) => {
  const cat = CATALOGOS[clave];

  const actual = await pool.query(
    `SELECT nombre FROM ${cat.tabla} WHERE ${cat.id} = $1`,
    [id],
  );
  if (actual.rowCount === 0) return { estado: "no_existe" };
  if (esUnidadProtegida(clave, actual.rows[0].nombre)) return { estado: "protegido" };

  const usos = await contarUsos(cat, id);
  if (usos > 0) return { estado: "en_uso", usos };

  try {
    await pool.query(`DELETE FROM ${cat.tabla} WHERE ${cat.id} = $1`, [id]);
    return { estado: "ok" };
  } catch (error) {
    // 23503: alguien uso este elemento justo despues del conteo; la clave foranea lo protege
    if (error.code === "23503") return { estado: "en_uso", usos: 1 };
    throw error;
  }
};