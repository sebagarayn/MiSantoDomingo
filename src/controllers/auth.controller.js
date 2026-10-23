import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Falta la variable de entorno JWT_SECRET en el archivo .env");
}

// Registro de nuevos vecinos en la plataforma
export const registrarVecino = async (req, res) => {
  const { nombre, correo, password, telefono } = req.body;

  // Validaciones basicas de campos requeridos
  if (!nombre || !correo || !password) {
    return res.status(400).json({
      ok: false,
      mensaje: "Nombre, correo y password son campos obligatorios",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      ok: false,
      mensaje: "La contraseña debe tener al menos 6 caracteres",
    });
  }

  // Los datos deben ser texto
  if (
    typeof nombre !== "string" ||
    typeof correo !== "string" ||
    typeof password !== "string" ||
    (telefono != null && typeof telefono !== "string")
  ) {
    return res.status(400).json({
      ok: false,
      mensaje: "Los datos enviados no tienen el formato correcto",
    });
  }
 
  const nombreLimpio = nombre.trim();
  const correoNormalizado = correo.trim().toLowerCase();
  const telefonoLimpio = telefono ? telefono.trim() : "";
 
  if (!nombreLimpio) {
    return res.status(400).json({
      ok: false,
      mensaje: "El nombre no puede estar vacío",
    });
  }
 
  // Formato de correo compatible con la restricción de la base de datos
  if (
    correoNormalizado.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoNormalizado)
  ) {
    return res.status(400).json({
      ok: false,
      mensaje: "Ingresa un correo electrónico válido (ejemplo: usuario@correo.cl)",
    });
  }

if (nombreLimpio.length > 100) {
    return res.status(400).json({
      ok: false,
      mensaje: "El nombre no puede superar los 100 caracteres",
    });
  }

  // bcrypt solo considera los primeros 72 caracteres de la contraseña
  if (password.length > 72) {
    return res.status(400).json({
      ok: false,
      mensaje: "La contraseña no puede superar los 72 caracteres",
    });
  }

  if (telefonoLimpio.length > 20) {
    return res.status(400).json({
      ok: false,
      mensaje: "El teléfono no puede superar los 20 caracteres",
    });
  }



  try {
    // Verificamos si el correo ya esta registrado en la base de datos
    const usuarioExistente = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE correo = $1",
      [correoNormalizado],
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(409).json({
        ok: false,
        mensaje: "Ya existe una cuenta registrada con este correo",
      });
    }

    // Hasheamos la contraseña con bcrypt (salt de 10 rondas)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insertamos el nuevo vecino (el rol por defecto es 'vecino')
    const query = `
      INSERT INTO usuarios (nombre, correo, password_hash, telefono, rol)
      VALUES ($1, $2, $3, $4, 'vecino')
      RETURNING id_usuario, nombre, correo, rol, fecha_registro
    `;

    const resultado = await pool.query(query, [
      nombreLimpio,
      correoNormalizado,
      passwordHash,
      telefonoLimpio || null,
    ]);

    const nuevoUsuario = resultado.rows[0];

    return res.status(201).json({
      ok: true,
      mensaje: "Usuario registrado exitosamente",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error interno en el servidor al registrar el usuario",
    });
  }
};

// Inicio de sesion para vecinos y funcionarios (admin)
export const iniciarSesion = async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({
      ok: false,
      mensaje: "Por favor ingresa tu correo y contraseña",
    });
  }

  try {
    const correoNormalizado = correo.trim().toLowerCase();

    // Buscamos al usuario por su correo
    const resultado = await pool.query(
      "SELECT id_usuario, nombre, correo, password_hash, rol FROM usuarios WHERE correo = $1",
      [correoNormalizado],
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        ok: false,
        mensaje: "Credenciales invalidas (correo o contraseña incorrectos)",
      });
    }

    const usuario = resultado.rows[0];

    // Comparamos la contraseña enviada con el hash guardado usando bcrypt
    const passwordCorrecto = await bcrypt.compare(
      password,
      usuario.password_hash,
    );
    if (!passwordCorrecto) {
      return res.status(401).json({
        ok: false,
        mensaje: "Credenciales invalidas (correo o contraseña incorrectos)",
      });
    }

    // Generamos el token JWT con vigencia de 8 horas
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    return res.json({
      ok: true,
      mensaje: "Inicio de sesion exitoso",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error al iniciar sesion:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error interno en el servidor al intentar iniciar sesion",
    });
  }
};

// Endpoint simple para obtener los datos del usuario conectado
export const obtenerPerfil = async (req, res) => {
  return res.json({
    ok: true,
    usuario: req.usuario,
  });
};
