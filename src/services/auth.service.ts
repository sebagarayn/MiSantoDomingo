import { IUser } from "../types";

// Acá dejamos listos los dos usuarios de prueba iniciales: la vecina María y el funcionario Felipe
export const usuariosPrueba: IUser[] = [
  {
    id: "usr-vecino-1",
    nombre: "María González (Vecina)",
    email: "vecino@correo.cl",
    rol: "vecino",
    fechaRegistro: "2026-01-15",
  },
  {
    id: "usr-admin-1",
    nombre: "Felipe OIRS (Funcionario)",
    email: "admin@correo.cl",
    rol: "admin",
    fechaRegistro: "2026-01-10",
  },
];

// Esta función simula el login buscando si el correo existe en la lista de prueba.
export const login = (email: string, _password?: string): IUser | null => {
  const usuario = usuariosPrueba.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  );
  return usuario || null;
};

// Exportamos tanto el objeto agrupado como la función suelta para que sea fácil llamarlo desde cualquier pantalla sin errores de importación
export const authService = {
  usuariosPrueba,
  login,
};

export default authService;
