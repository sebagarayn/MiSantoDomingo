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
