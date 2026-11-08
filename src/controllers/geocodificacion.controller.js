import {
  geocodificarDireccion as buscarCoordenadas,
  geocodificarInversa as buscarDireccion,
} from "../services/geocodificacion.service.js";

// Recibe una dirección y devuelve sus coordenadas.
export const geocodificarDireccion = async (req, res) => {
  const q = req.query.q;

  // Comprueba que se haya ingresado una dirección válida.
  if (typeof q !== "string" || !q.trim()) {
    return res.status(400).json({
      ok: false,
      mensaje: "Debe ingresar una dirección para realizar la búsqueda",
    });
  }

  try {
    const ubicacion = await buscarCoordenadas(q);

    // Informa cuando no se encuentra la dirección.
    if (!ubicacion) {
      return res.status(404).json({
        ok: false,
        mensaje: "No se encontró una ubicación para la dirección ingresada",
      });
    }

    return res.json({
      ok: true,
      ubicacion,
    });
  } catch (error) {
    console.error("Error al geocodificar dirección:", error);

    return res.status(error.status || 502).json({
      ok: false,
      mensaje: error.message || "No fue posible consultar el servicio de ubicación",
    });
  }
};

 // Recibe coordenadas y devuelve una dirección aproximada.
export const geocodificarInversa = async (req, res) => {
  const { lat, lng } = req.query;

  // Comprueba que ambos parámetros sean números válidos.
  if (
    typeof lat !== "string" ||
    typeof lng !== "string" ||
    !lat.trim() ||
    !lng.trim() ||
    !Number.isFinite(Number(lat)) ||
    !Number.isFinite(Number(lng)) ||
    Number(lat) < -90 ||
    Number(lat) > 90 ||
    Number(lng) < -180 ||
    Number(lng) > 180
  ) {
    return res.status(400).json({
      ok: false,
      mensaje: "Debe ingresar una latitud y longitud válidas",
    });
  }

  try {
    const ubicacion = await buscarDireccion(Number(lat), Number(lng));

    // Informa cuando no existe una dirección para las coordenadas.
    if (!ubicacion) {
      return res.status(404).json({
        ok: false,
        mensaje: "No se encontró una dirección para estas coordenadas",
      });
    }

    return res.json({
      ok: true,
      ubicacion,
    });
  } catch (error) {
    console.error("Error al realizar geocodificación inversa:", error);

    return res.status(error.status || 502).json({
      ok: false,
      mensaje: error.message || "No fue posible consultar el servicio de ubicación",
    });
  }
};
