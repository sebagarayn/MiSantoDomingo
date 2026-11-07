import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Falta la variable de entorno JWT_SECRET en el archivo .env");
}

export const verificarToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      ok: false,
      mensaje: "Acceso denegado: No se proporcionó un token de autenticación",
    });
  }

  try {
    // 1. Verificamos la firma y expiración del JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // 2. Seguridad avanzada (S1): Revalidar rol y estado vigente en PostgreSQL
    const idUsuario = decoded.id_usuario || decoded.id;
    const consultaUsuario = await pool.query(
      "SELECT id_usuario, nombre, correo, rol FROM usuarios WHERE id_usuario = $1",
      [idUsuario],
    );

    if (consultaUsuario.rowCount === 0) {
      return res.status(401).json({
        ok: false,
        mensaje: "Acceso denegado: El usuario ya no existe o fue dado de baja",
      });
    }

    // 3. Adjuntamos los datos vigentes de la BD a la petición
    req.usuario = consultaUsuario.rows[0];
    next();
  } catch (error) {
    // Unificación exigida por el ayudante: ante token expirado o corrupto, devolver 401
    return res.status(401).json({
      ok: false,
      mensaje: "Token inválido o expirado. Inicia sesión nuevamente",
    });
  }
};

export const soloAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== "admin") {
    return res.status(403).json({
      ok: false,
      mensaje: "Permiso denegado: Se requiere rol de administrador",
    });
  }
  next();
};
