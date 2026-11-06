import {
  obtenerTodasCategorias,
  obtenerTodasUnidades,
} from "../services/catalogos.service.js";

export const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await obtenerTodasCategorias();
    return res.json({ ok: true, categorias });
  } catch (error) {
    console.error("Error al obtener categorias:", error);
    return res
      .status(500)
      .json({ ok: false, mensaje: "Error al cargar categorias" });
  }
};

export const obtenerUnidades = async (req, res) => {
  try {
    const unidades = await obtenerTodasUnidades();
    return res.json({ ok: true, unidades });
  } catch (error) {
    console.error("Error al obtener unidades:", error);
    return res
      .status(500)
      .json({ ok: false, mensaje: "Error al cargar unidades" });
  }
};
