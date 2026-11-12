
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

// Cuerpo JSON que esperan POST y PUT (contrato del backend: solo "nombre")
const cuerpoNombre = (nombre: string) => JSON.stringify({ nombre });

// Servicio que obtiene y administra los catalogos desde el backend.
// Leer es publico; crear, editar y eliminar exigen sesion de administrador.
export const catalogosService = {
  obtenerCategorias: async (): Promise<ICategoria[]> => {
    const data = await apiFetch("/categorias");
    return data.categorias;
  },

  obtenerUnidades: async (): Promise<IUnidad[]> => {
    const data = await apiFetch("/unidades");
    return data.unidades;
  },

  crearCategoria: async (nombre: string): Promise<ICategoria> => {
    const data = await apiFetch("/categorias", {
      method: "POST",
      body: cuerpoNombre(nombre),
    });
    return data.categoria;
  },

  actualizarCategoria: async (id: number, nombre: string): Promise<ICategoria> => {
    const data = await apiFetch(`/categorias/${id}`, {
      method: "PUT",
      body: cuerpoNombre(nombre),
    });
    return data.categoria;
  },

  eliminarCategoria: async (id: number): Promise<void> => {
    await apiFetch(`/categorias/${id}`, { method: "DELETE" });
  },

  crearUnidad: async (nombre: string): Promise<IUnidad> => {
    const data = await apiFetch("/unidades", {
      method: "POST",
      body: cuerpoNombre(nombre),
    });
    return data.unidad;
  },

  actualizarUnidad: async (id: number, nombre: string): Promise<IUnidad> => {
    const data = await apiFetch(`/unidades/${id}`, {
      method: "PUT",
      body: cuerpoNombre(nombre),
    });
    return data.unidad;
  },

  eliminarUnidad: async (id: number): Promise<void> => {
    await apiFetch(`/unidades/${id}`, { method: "DELETE" });
  },
};

