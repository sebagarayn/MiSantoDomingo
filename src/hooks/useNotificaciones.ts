import { useCallback, useEffect, useState } from "react";
import { notificacionesService } from "../services/notificaciones.service";
import { INotificacion } from "../types";

// Cada cuanto se le pregunta al servidor si hay avisos nuevos
const INTERVALO_MS = 30_000;

// "activo" evita consultar cuando no corresponde (por ejemplo, si no hay un vecino con sesion)
export const useNotificaciones = (activo: boolean) => {
  const [notificaciones, setNotificaciones] = useState<INotificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [error, setError] = useState("");

  // Pide la lista al servidor y actualiza el estado
  const recargar = useCallback(async () => {
    try {
      const data = await notificacionesService.listar();
      setNotificaciones(data.notificaciones);
      setNoLeidas(data.no_leidas);
      setError("");
    } catch (e: any) {
      // Se guarda el error pero no se muestra un aviso cada 30 s: la campana sigue funcionando
      setError(e.message || "No se pudieron cargar las notificaciones");
    }
  }, []);

  // Carga al montar y luego repite cada 30 s (polling). El return limpia el temporizador.
  useEffect(() => {
    if (!activo) return;
    recargar();
    const temporizador = setInterval(recargar, INTERVALO_MS);
    return () => clearInterval(temporizador);
  }, [activo, recargar]);

  // Marca una como leida: primero se actualiza la pantalla y luego se avisa al servidor
  const marcarLeida = useCallback(
    async (id: number) => {
      setNotificaciones((prev) =>
        prev.map((n) => (n.id_notificacion === id ? { ...n, leida: true } : n)),
      );
      setNoLeidas((prev) => Math.max(0, prev - 1));
      try {
        await notificacionesService.marcarLeida(id);
      } catch {
        await recargar(); // si fallo, se vuelve a lo que dice el servidor
      }
    },
    [recargar],
  );

  const marcarTodasLeidas = useCallback(async () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    setNoLeidas(0);
    try {
      await notificacionesService.marcarTodasLeidas();
    } catch {
      await recargar();
    }
  }, [recargar]);

  return { notificaciones, noLeidas, error, recargar, marcarLeida, marcarTodasLeidas };
};