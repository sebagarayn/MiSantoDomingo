import { IUser } from "../types";

// Usuarios de prueba para simular el login
const usuariosPrueba: IUser[] = [
  {
    id: "1",
    nombre: "Vecino Demo",
    email: "vecino@correo.cl",
    rol: "vecino",
  },
  {
    id: "2",
    nombre: "Funcionario Municipal",
    email: "admin@correo.cl",
    rol: "admin",
  },
];

// Simula el inicio de sesion buscando el usuario por email
export function login(email: string, password: string): IUser | null {
  const usuario = usuariosPrueba.find((u) => u.email === email);
  return usuario || null;
}
