import {
  CLAVES,
  PREFIJO_CACHE,
  borrar,
  borrarPorPrefijo,
  leer,
} from "./almacenamiento.service";
// URL base del backend (se puede cambiar con VITE_API_URL en un .env)
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Limpia la sesión y manda al login cuando el token venció o es inválido.
// Se espera a que termine el borrado antes de recargar la pagina.
const cerrarSesionExpirada = async () => {
  await Promise.all([
    borrar(CLAVES.token),
    borrar(CLAVES.usuario),
    borrarPorPrefijo(PREFIJO_CACHE),
  ]);
  window.location.href = "/login?expirada=1";
};

// Error de "no hay conexion": las pantallas lo usan para mostrar datos guardados en el dispositivo
export const esErrorDeRed = (error: unknown): boolean =>
  error instanceof Error &&
  (error as Error & { sinConexion?: boolean }).sinConexion === true;

// Helper central: adjunta el JWT y maneja los errores de sesión en un solo lugar
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = leer(CLAVES.token);

  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;
  try {
    // Intentamos la conexion de red con el backend
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkError) {
    const errorDeRed = new Error(
      "No se pudo conectar con el servidor. Verifique su conexión.",
    ) as Error & { sinConexion?: boolean };
    errorDeRed.sinConexion = true; // marca para que las pantallas sepan que fue falta de red
    throw errorDeRed;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Sesión vencida: 401, o 403 con mensaje de token inválido/expirado.
    // Se excluye /auth/ para no confundirlo con "credenciales incorrectas".
    const sesionInvalida =
      !!token &&
      !endpoint.startsWith("/auth/") &&
      (response.status === 401 ||
        (response.status === 403 && /token/i.test(data.mensaje || "")));

    if (sesionInvalida) {
      await cerrarSesionExpirada();
      throw new Error("Tu sesión expiró. Inicia sesión nuevamente.");
    }

    throw new Error(data.mensaje || "Error en la comunicacion con el servidor");
  }

  return data;
};
