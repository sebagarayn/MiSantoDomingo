
import { afterEach, expect, test, vi } from "vitest";
import { apiFetch } from "./api";

// Simulamos el almacenamiento para que la prueba
// no dependa de una sesión real.
vi.mock("./almacenamiento.service", () => ({
  CLAVES: {
    token: "token",
    usuario: "usuario",
  },
  PREFIJO_CACHE: "cache_",
  leer: vi.fn(() => null),
  borrar: vi.fn(),
  borrarPorPrefijo: vi.fn(),
}));

afterEach(() => {
  // Restauramos fetch después de cada prueba.
  vi.unstubAllGlobals();
});

test("apiFetch muestra el mensaje de error cuando el servidor responde 500", async () => {
  // Simulamos una respuesta del backend con error HTTP 500.
  const fetchMock = vi.fn().mockResolvedValue({
    ok: false,
    status: 500,
    json: async () => ({
      mensaje: "Error interno del servidor",
    }),
  });

  // Reemplazamos fetch únicamente durante la prueba.
  vi.stubGlobal("fetch", fetchMock);

  // Comprobamos que apiFetch genere el error esperado.
  await expect(
    apiFetch("/reclamos")
  ).rejects.toThrow("Error interno del servidor");

  // Verificamos que se haya realizado una solicitud HTTP.
  expect(fetchMock).toHaveBeenCalledTimes(1);
});


test("apiFetch identifica correctamente un error de conexión", async () => {
  // Simulamos que no se puede conectar con el backend.
  const fetchMock = vi.fn().mockRejectedValue(
    new TypeError("Failed to fetch")
  );

  vi.stubGlobal("fetch", fetchMock);

  // Ejecutamos apiFetch y capturamos el error.
  let errorCapturado: unknown;

  try {
    await apiFetch("/reclamos");
  } catch (error) {
    errorCapturado = error;
  }

  // Comprobamos que se generó un error.
  expect(errorCapturado).toBeInstanceOf(Error);

  // Comprobamos que el mensaje sea el esperado.
  expect((errorCapturado as Error).message).toBe(
    "No se pudo conectar con el servidor. Verifique su conexión."
  );

  // Comprobamos que el error esté marcado como falta de conexión.
  expect(
    (errorCapturado as Error & { sinConexion?: boolean }).sinConexion
  ).toBe(true);

  // Verificamos que se intentó realizar la solicitud.
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
