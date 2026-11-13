import { Preferences } from "@capacitor/preferences";

// Prefijo de todo lo que es "cache": se borra completo al cerrar sesion
export const PREFIJO_CACHE = "msd_cache_";

// Claves que usa la app para guardar cosas en el dispositivo
export const CLAVES = {
  token: "msd_token",
  usuario: "msd_session_user",
  borradorReclamo: (idUsuario: string) => `msd_borrador_reclamo_${idUsuario}`,
  cacheReclamos: (idUsuario: string) => `${PREFIJO_CACHE}reclamos_${idUsuario}`,
};

// Copia en memoria de lo guardado. Se llena una vez al arrancar (iniciarAlmacenamiento),
// asi el resto de la app puede leer de forma sincrona, igual que con localStorage.
const memoria = new Map<string, string>();

// Se llama UNA vez en main.tsx, antes de mostrar la app: carga lo guardado en el dispositivo
export const iniciarAlmacenamiento = async (): Promise<void> => {
  memoria.clear();
  try {
    const { keys } = await Preferences.keys();
    for (const clave of keys) {
      const { value } = await Preferences.get({ key: clave });
      if (value !== null) memoria.set(clave, value);
    }

    // Migracion unica: quien ya tenia sesion en localStorage no tiene que volver a entrar
    for (const clave of [CLAVES.token, CLAVES.usuario]) {
      const antiguo = window.localStorage.getItem(clave);
      if (antiguo === null) continue;
      if (!memoria.has(clave)) {
        memoria.set(clave, antiguo);
        await Preferences.set({ key: clave, value: antiguo });
      }
      window.localStorage.removeItem(clave);
    }
  } catch (error) {
    console.error("No se pudo leer el almacenamiento local:", error);
  }
};

// Lectura sincrona desde la copia en memoria
export const leer = (clave: string): string | null => memoria.get(clave) ?? null;

export const leerJSON = <T>(clave: string): T | null => {
  const texto = leer(clave);
  if (texto === null) return null;
  try {
    return JSON.parse(texto) as T;
  } catch {
    return null;
  }
};

// Escribir actualiza la memoria al tiro y despues guarda en el dispositivo.
// Si el guardado falla (por ejemplo, disco lleno) se avisa en consola y la app sigue funcionando.
export const guardar = async (clave: string, valor: string): Promise<void> => {
  memoria.set(clave, valor);
  try {
    await Preferences.set({ key: clave, value: valor });
  } catch (error) {
    console.error("No se pudo guardar en el dispositivo:", error);
  }
};

export const guardarJSON = (clave: string, valor: unknown): Promise<void> =>
  guardar(clave, JSON.stringify(valor));

export const borrar = async (clave: string): Promise<void> => {
  memoria.delete(clave);
  try {
    await Preferences.remove({ key: clave });
  } catch (error) {
    console.error("No se pudo borrar del dispositivo:", error);
  }
};

// Borra todas las claves que empiezan con un prefijo (por ejemplo, toda la cache)
export const borrarPorPrefijo = async (prefijo: string): Promise<void> => {
  for (const clave of [...memoria.keys()]) {
    if (clave.startsWith(prefijo)) await borrar(clave);
  }
};