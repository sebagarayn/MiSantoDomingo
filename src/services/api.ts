// URL base del backend (se puede cambiar con VITE_API_URL en un .env)
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Limpia la sesión y manda al login cuando el token venció o es inválido
const cerrarSesionExpirada = () => {
  localStorage.removeItem("msd_token");
  localStorage.removeItem("msd_session_user");
  window.location.href = "/login?expirada=1";
};

// Helper central: adjunta el JWT y maneja los errores de sesión en un solo lugar
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("msd_token");

  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

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
      cerrarSesionExpirada();
      throw new Error("Tu sesión expiró. Inicia sesión nuevamente.");
    }

    throw new Error(data.mensaje || "Error en la comunicacion con el servidor");
  }

  return data;
};