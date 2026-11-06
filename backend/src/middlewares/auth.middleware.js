import jwt from "jsonwebtoken";

// Clave secreta definida en el .env
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Falta la variable de entorno JWT_SECRET en el archivo .env");
}

// Middleware para verificar que la peticion traiga un token JWT valido
export const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // El token normalmente viene en formato "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      ok: false,
      mensaje: "Acceso denegado: No se proporciono un token de autenticacion",
    });
  }

  try {
    // Verificamos la firma del token
    const decoded = jwt.verify(token, JWT_SECRET);
    // Guardamos los datos del usuario decodificado en la peticion (req)
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      ok: false,
      mensaje: "Token invalido o expirado. Inicia sesion nuevamente",
    });
  }
};

// Middleware para restringir rutas solo a administradores (OIRS)
export const soloAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== "admin") {
    return res.status(403).json({
      ok: false,
      mensaje: "Permiso denegado: Se requiere rol de administrador",
    });
  }
  next();
};
