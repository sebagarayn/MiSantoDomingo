import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { INotificacion } from "../types";

// En el celular (app nativa) el aviso es una notificacion del sistema.
// En el navegador esa funcion no existe, asi que ahi se usa un toast (lo decide VecinoHomePage).
export const esAppNativa = (): boolean => Capacitor.isNativePlatform();

// Pide permiso para mostrar avisos. Solo aplica en el celular; en la web no hace nada
export const pedirPermisoAvisos = async (): Promise<boolean> => {
  if (!esAppNativa()) return false;
  try {
    const actual = await LocalNotifications.checkPermissions();
    if (actual.display === "granted") return true;
    const pedido = await LocalNotifications.requestPermissions();
    return pedido.display === "granted";
  } catch {
    return false;
  }
};

// Muestra una notificacion del sistema. Devuelve false si no se pudo (sin permiso o en la web)
export const mostrarAvisoNativo = async (n: INotificacion): Promise<boolean> => {
  if (!esAppNativa()) return false;
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: n.id_notificacion, // el plugin exige un entero; el id de PostgreSQL lo es
          title: "Municipalidad de Santo Domingo",
          body: n.mensaje,
          extra: { id_reclamo: n.id_reclamo, folio: n.folio },
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
};