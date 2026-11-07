
import { apiFetch } from "./api";

// Representa una categoria almacenada en PostgreSQL
export interface ICategoria {
  id_categoria: number;
  nombre: string;
}

// Representa una unidad municipal
export interface IUnidad {
  id_unidad: number;
  nombre: string;
}

// Servicio que obtiene los catalogos desde el backend
export const catalogosService = {
  obtenerCategorias: async (): Promise<ICategoria[]> => {
    const data = await apiFetch("/categorias");
    return data.categorias;
  },

  obtenerUnidades: async (): Promise<IUnidad[]> => {
    const data = await apiFetch("/unidades");
    return data.unidades;
  },
};

