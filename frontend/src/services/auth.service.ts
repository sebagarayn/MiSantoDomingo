import { apiFetch } from "./api";
import { IUser, UserRole } from "../types";

export interface IRegistroInput {
  nombre: string;
  correo: string;
  password: string;
  telefono?: string;
}

export const authService = {
  // Login real contra POST /api/auth/login
  login: async (correo: string, password: string) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ correo: correo.trim().toLowerCase(), password }),
    });

    const usuario: IUser = {
      id: `usr-${data.usuario.id_usuario}`,
      nombre: data.usuario.nombre,
      email: data.usuario.correo,
      rol: data.usuario.rol as UserRole,
    };

    return { token: data.token as string, usuario };
  },

  // Registro real contra POST /api/auth/registro (guarda en PostgreSQL)
  registrar: async (input: IRegistroInput) => {
    return apiFetch("/auth/registro", {
      method: "POST",
      body: JSON.stringify({
        nombre: input.nombre.trim(),
        correo: input.correo.trim().toLowerCase(),
        password: input.password,
        telefono: input.telefono?.trim() || undefined,
      }),
    });
  },
};

export default authService;