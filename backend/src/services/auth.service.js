import pool from "../config/db.js";

// Busca un usuario por correo en PostgreSQL
export const buscarUsuarioPorCorreo = async (correo) => {
  const query =
    "SELECT id_usuario, nombre, correo, password_hash, rol FROM usuarios WHERE correo = $1";
  const resultado = await pool.query(query, [correo]);
  return resultado.rows[0] || null;
};

// Inserta un nuevo vecino en PostgreSQL
export const registrarNuevoVecino = async ({
  nombre,
  correo,
  passwordHash,
  telefono,
}) => {
  const query = `
    INSERT INTO usuarios (nombre, correo, password_hash, telefono, rol)
    VALUES ($1, $2, $3, $4, 'vecino')
    RETURNING id_usuario, nombre, correo, rol, fecha_registro
  `;
  const resultado = await pool.query(query, [
    nombre,
    correo,
    passwordHash,
    telefono || null,
  ]);
  return resultado.rows[0];
};
