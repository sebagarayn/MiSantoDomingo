
import { apiFetch } from "./api";

export interface ResultadoGeocodificacion {
  latitud: number;
  longitud: number;
  direccion: string;
}

interface RespuestaGeocodificacion {
  ok: boolean;
  ubicacion: ResultadoGeocodificacion;
}

// Busca las coordenadas de una dirección escrita
export const buscarDireccion = async (
  direccion: string
): Promise<ResultadoGeocodificacion> => {
  const respuesta: RespuestaGeocodificacion = await apiFetch(
    `/geocodificar?q=${encodeURIComponent(direccion)}`
  );

  return respuesta.ubicacion;
};

// Obtiene una dirección aproximada a partir de coordenadas
export const obtenerDireccionDesdeCoordenadas = async (
  latitud: number,
  longitud: number
): Promise<ResultadoGeocodificacion> => {
  const respuesta: RespuestaGeocodificacion = await apiFetch(
    `/geocodificar/inversa?lat=${latitud}&lng=${longitud}`
  );

  return respuesta.ubicacion;
};
