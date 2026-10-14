import pool from "../config/db.js";

// Obtener todas las categorias de reclamos
export const obtenerCategorias = async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM categorias ORDER BY id_categoria ASC",
    );
    return res.json({
      ok: true,
      categorias: resultado.rows,
    });
  } catch (error) {
    console.error("Error al obtener categorias:", error);
    return res
      .status(500)
      .json({ ok: false, mensaje: "Error al cargar categorias" });
  }
};

// Obtener todas las unidades municipales disponibles
export const obtenerUnidades = async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM unidades ORDER BY id_unidad ASC",
    );
    return res.json({
      ok: true,
      unidades: resultado.rows,
    });
  } catch (error) {
    console.error("Error al obtener unidades:", error);
    return res
      .status(500)
      .json({ ok: false, mensaje: "Error al cargar unidades" });
  }
};
