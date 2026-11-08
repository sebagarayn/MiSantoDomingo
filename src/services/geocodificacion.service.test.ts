import { describe, test, expect, vi } from "vitest";
import { apiFetch } from "./api";
import {
  buscarDireccion,
  obtenerDireccionDesdeCoordenadas,
} from "./geocodificacion.service";

// Simula las respuestas del backend sin realizar solicitudes reales.
vi.mock("./api", () => ({
  apiFetch: vi.fn(),
}));

describe("Servicio de geocodificación", () => {

  // TEST 1: Verificar la búsqueda de coordenadas desde una dirección.
  test("buscarDireccion debe enviar la dirección y devolver las coordenadas", async () => {
    const ubicacionSimulada = {
      latitud: -33.63,
      longitud: -71.63,
      direccion: "Santo Domingo, Chile",
    };

    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: true,
      ubicacion: ubicacionSimulada,
    });

    const resultado = await buscarDireccion("Santo Domingo");

    expect(apiFetch).toHaveBeenCalledWith(
      "/geocodificar?q=Santo%20Domingo"
    );

    expect(resultado).toEqual(ubicacionSimulada);
  });

});


  // TEST 2: Verificar la obtención de una dirección desde coordenadas.
  test("obtenerDireccionDesdeCoordenadas debe enviar las coordenadas y devolver la dirección", async () => {
        const ubicacionSimulada = {
        latitud: -33.63,
        longitud: -71.63,
        direccion: "Santo Domingo, Chile",
        };

        vi.mocked(apiFetch).mockResolvedValueOnce({
        ok: true,
        ubicacion: ubicacionSimulada,
        });

        const resultado = await obtenerDireccionDesdeCoordenadas(
        -33.63,
        -71.63
        );

        expect(apiFetch).toHaveBeenCalledWith(
        "/geocodificar/inversa?lat=-33.63&lng=-71.63"
        );

        expect(resultado).toEqual(ubicacionSimulada);
    });


    
  // TEST 3: Verificar el manejo de errores al buscar una dirección.
  test("buscarDireccion debe propagar un error del backend", async () => {
    vi.mocked(apiFetch).mockRejectedValueOnce(
      new Error("No se pudo encontrar la dirección")
    );

    await expect(
      buscarDireccion("Dirección inexistente")
    ).rejects.toThrow("No se pudo encontrar la dirección");

    expect(apiFetch).toHaveBeenCalledWith(
      "/geocodificar?q=Direcci%C3%B3n%20inexistente"
    );
  });
