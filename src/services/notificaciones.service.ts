import { INotificacionesResponse } from "../types";
import { apiFetch } from "./api";

// Servicio de notificaciones: solo habla con la API.
// El token y los errores de sesion los maneja apiFetch (api.ts).
class NotificacionesService {
  // GET /api/notificaciones  (las del usuario con sesion iniciada)
  public async listar(soloNoLeidas = false): Promise<INotificacionesResponse> {
    const query = soloNoLeidas ? "?solo_no_leidas=true" : "";
    return apiFetch(`/notificaciones${query}`);
  }

  // PATCH /api/notificaciones/:id/leida
  public async marcarLeida(id: number): Promise<void> {
    await apiFetch(`/notificaciones/${id}/leida`, { method: "PATCH" });
  }

  // PATCH /api/notificaciones/leer-todas
  public async marcarTodasLeidas(): Promise<void> {
    await apiFetch("/notificaciones/leer-todas", { method: "PATCH" });
  }
}

export const notificacionesService = new NotificacionesService();