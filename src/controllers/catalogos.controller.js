import {
  obtenerTodasCategorias,
  obtenerTodasUnidades,
  crearElemento,
  actualizarElemento,
  eliminarElemento,
  UNIDAD_DE_INGRESO,
} from "../services/catalogos.service.js";
import { esIdValido, badRequest, validarCuerpoCatalogo } from "../utils/validaciones.js";

// Los catalogos ahora los edita el admin, asi que el navegador debe revalidar siempre.
// Sigue siendo barato: Express manda un ETag y, si nada cambio, responde 304 sin cuerpo.
const SIN_CACHE = "no-cache";

export const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await obtenerTodasCategorias();
      // Optimización EF4: caché con revalidación (ETag): el navegador pregunta, el servidor responde 304
    res.set("Cache-Control", SIN_CACHE);
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
    // Optimización EF4: caché con revalidación (ETag): el navegador pregunta, el servidor responde 304
    res.set("Cache-Control", SIN_CACHE);
    return res.json({ ok: true, unidades });
  } catch (error) {
    console.error("Error al obtener unidades:", error);
    return res
      .status(500)
      .json({ ok: false, mensaje: "Error al cargar unidades" });
  }
};

const TEXTOS = {
  categorias: { singular: "categoría", clave: "categoria" },
  unidades: { singular: "unidad", clave: "unidad" },
};

const mayuscula = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

// Crea los 3 controladores (crear, actualizar, eliminar) para un catalogo
const construirControladores = (catalogo) => {
  const t = TEXTOS[catalogo];
  const errorId = "El id debe ser un número entero positivo válido";

  const crear = async (req, res) => {
    const { nombre, error } = validarCuerpoCatalogo(req.body);
    if (error) return badRequest(res, error);

    try {
      const r = await crearElemento(catalogo, nombre);
      if (r.estado === "duplicado") {
        return res.status(409).json({ ok: false, mensaje: `Ya existe una ${t.singular} con ese nombre` });
      }
      return res.status(201).json({
        ok: true,
        mensaje: `${mayuscula(t.singular)} creada exitosamente`,
        [t.clave]: r.registro,
      });
    } catch (e) {
      console.error(`Error al crear ${t.singular}:`, e);
      return res.status(500).json({ ok: false, mensaje: `Error al crear la ${t.singular}` });
    }
  };

  const actualizar = async (req, res) => {
    if (!esIdValido(req.params.id)) return badRequest(res, errorId);
    const { nombre, error } = validarCuerpoCatalogo(req.body);
    if (error) return badRequest(res, error);

    try {
      const r = await actualizarElemento(catalogo, Number(req.params.id), nombre);
      if (r.estado === "no_existe") {
        return res.status(404).json({ ok: false, mensaje: `No se encontró la ${t.singular}` });
      }
      if (r.estado === "protegido") {
        return res.status(409).json({
          ok: false,
          mensaje: `La unidad "${UNIDAD_DE_INGRESO}" recibe todos los reclamos nuevos y no se puede renombrar`,
        });
      }
      if (r.estado === "duplicado") {
        return res.status(409).json({ ok: false, mensaje: `Ya existe una ${t.singular} con ese nombre` });
      }
      return res.json({
        ok: true,
        mensaje: `${mayuscula(t.singular)} actualizada exitosamente`,
        [t.clave]: r.registro,
      });
    } catch (e) {
      console.error(`Error al actualizar ${t.singular}:`, e);
      return res.status(500).json({ ok: false, mensaje: `Error al actualizar la ${t.singular}` });
    }
  };

  const eliminar = async (req, res) => {
    if (!esIdValido(req.params.id)) return badRequest(res, errorId);

    try {
      const r = await eliminarElemento(catalogo, Number(req.params.id));
      if (r.estado === "no_existe") {
        return res.status(404).json({ ok: false, mensaje: `No se encontró la ${t.singular}` });
      }
      if (r.estado === "protegido") {
        return res.status(409).json({
          ok: false,
          mensaje: `La unidad "${UNIDAD_DE_INGRESO}" recibe todos los reclamos nuevos y no se puede eliminar`,
        });
      }
      if (r.estado === "en_uso") {
        return res.status(409).json({
          ok: false,
          mensaje: `No se puede eliminar: hay ${r.usos} registro(s) de reclamos que usan la ${t.singular}`,
        });
      }
      return res.json({ ok: true, mensaje: `${mayuscula(t.singular)} eliminada exitosamente` });
    } catch (e) {
      console.error(`Error al eliminar ${t.singular}:`, e);
      return res.status(500).json({ ok: false, mensaje: `Error al eliminar la ${t.singular}` });
    }
  };

  return { crear, actualizar, eliminar };
};

export const controladoresCategorias = construirControladores("categorias");
export const controladoresUnidades = construirControladores("unidades");
