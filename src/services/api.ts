// URL base de nuestro servidor Express local
export const API_URL = "http://localhost:3000/api";

// Helper para hacer peticiones fetch adjuntando el token JWT si existe
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("msd_token");

  const headers = new Headers(options.headers || {});

  // Si no es un FormData (subida de archivos), aseguramos que sea JSON
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Adjuntamos el token Bearer en el header de autorizacion
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.mensaje || "Error en la comunicacion con el servidor");
  }

  return data;
};
