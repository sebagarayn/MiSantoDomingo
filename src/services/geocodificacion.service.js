const NOMINATIM_URL =
  process.env.NOMINATIM_URL || "https://nominatim.openstreetmap.org";

const NOMINATIM_CONTACT = process.env.NOMINATIM_CONTACT;

const TIMEOUT_MS = 5000;

// Guarda temporalmente resultados para evitar consultas repetidas.
const cache = new Map();

// Controla la frecuencia de consultas a Nominatim.
// La API pública permite como máximo una solicitud por segundo.
let ultimaSolicitud = 0;
let colaSolicitudes = Promise.resolve();


const esperarTurno = () => {
  // Organiza las solicitudes para ejecutarlas una después de otra.
  const turno = colaSolicitudes.then(async () => {
    const tiempoTranscurrido = Date.now() - ultimaSolicitud;
    const tiempoEspera = Math.max(0, 1100 - tiempoTranscurrido);

    // Espera si todavía no ha transcurrido el intervalo mínimo.
    if (tiempoEspera > 0) {
      await new Promise((resolve) => setTimeout(resolve, tiempoEspera));
    }

    // Registra cuándo comienza la siguiente solicitud.
    ultimaSolicitud = Date.now();
  });

  // Mantiene la cola funcionando incluso si ocurre un error.
  colaSolicitudes = turno.catch(() => {});

  return turno;
};

const consultarNominatim = async (ruta, parametros) => {
  const url = new URL(ruta, NOMINATIM_URL);

  // Agrega los parámetros de búsqueda a la URL.
  url.search = new URLSearchParams({
    ...parametros,
    format: "json",
  }).toString();

  try {
    // Espera su turno antes de consultar Nominatim.
    await esperarTurno();

    // Realiza la consulta con un tiempo máximo de 5 segundos.
    const respuesta = await fetch(url, {
      headers: {
        "User-Agent": `MiSantoDomingo/1.0 (${NOMINATIM_CONTACT})`,
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    // Detecta si el servicio externo respondió con un error.
    if (!respuesta.ok) {
      throw new Error("Nominatim no pudo procesar la solicitud");
    }

    return await respuesta.json();
  } catch (error) {
    // Distingue un tiempo de espera agotado de otros errores.
    if (
      error.name === "TimeoutError" ||
      (error.name === "AbortError" && error.message?.includes("timeout"))
    ) {
      const timeoutError = new Error(
        "La consulta de ubicación superó los 5 segundos",
      );
      timeoutError.status = 504;
      throw timeoutError;
    }

    const servicioError = new Error(
      "No fue posible consultar el servicio de ubicación",
    );
    servicioError.status = 502;
    throw servicioError;
  }
};

export const geocodificarDireccion = async (direccion) => {
  // Normaliza la dirección para utilizarla como clave de caché.
  const consulta = direccion.trim();
  const clave = `direccion:${consulta.toLowerCase()}`;

  // Reutiliza el resultado si ya se consultó anteriormente.
  if (cache.has(clave)) {
    return cache.get(clave);
  }

  // Consulta las coordenadas de la dirección en Nominatim.

    const resultados = await consultarNominatim("/search", {
    q: `${consulta}, Santo Domingo, Región de Valparaíso, Chile`,
    countrycodes: "cl",
    viewbox: "-71.75,-33.45,-71.45,-33.85",
    bounded: "1",
    limit: "5",
    });


  // Si no encuentra resultados, devuelve null.
  if (!resultados.length) {
    return null;
  }

  const resultado = {
    latitud: Number(resultados[0].lat),
    longitud: Number(resultados[0].lon),
    direccion: resultados[0].display_name,
  };

  // Guarda el resultado para evitar repetir la consulta.
  cache.set(clave, resultado);

  return resultado;
};

export const geocodificarInversa = async (latitud, longitud) => {
  // Crea una clave para identificar la consulta en caché.
  const clave = `coordenadas:${latitud},${longitud}`;

  // Reutiliza el resultado si ya fue consultado.
  if (cache.has(clave)) {
    return cache.get(clave);
  }

  // Consulta la dirección asociada a las coordenadas.
  const resultado = await consultarNominatim("/reverse", {
    lat: String(latitud),
    lon: String(longitud),
  });

  // Si Nominatim no encuentra una dirección, devuelve null.
  if (resultado.error) {
    return null;
  }

  const ubicacion = {
    latitud: Number(resultado.lat),
    longitud: Number(resultado.lon),
    direccion: resultado.display_name,
  };

  // Guarda el resultado para evitar consultas repetidas.
  cache.set(clave, ubicacion);

  return ubicacion;
};
