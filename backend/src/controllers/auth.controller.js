import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  buscarUsuarioPorCorreo,
  registrarNuevoVecino,
} from "../services/auth.service.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Falta la variable de entorno JWT_SECRET en el archivo .env");
}

// Registro de nuevos vecinos con validaciones estrictas
export const registrarVecino = async (req, res) => {
  const { nombre, correo, password, telefono } = req.body;

  if (!nombre || !correo || !password) {
    return res.status(400).json({
      ok: false,
      mensaje: "Nombre, correo y password son campos obligatorios",
    });
  }

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
    return res
      .status(400)
      .json({ ok: false, mensaje: "El nombre no puede estar vacío" });
  }

  if (password.length < 6) {
    return res.status(400).json({
      ok: false,
      mensaje: "La contraseña debe tener al menos 6 caracteres",
    });
  }

  if (password.length > 72) {
    return res.status(400).json({
      ok: false,
      mensaje: "La contraseña no puede superar los 72 caracteres",
    });
  }

  if (nombreLimpio.length > 100) {
    return res.status(400).json({
      ok: false,
      mensaje: "El nombre no puede superar los 100 caracteres",
    });
  }

  if (telefonoLimpio.length > 20) {
    return res.status(400).json({
      ok: false,
      mensaje: "El teléfono no puede superar los 20 caracteres",
    });
  }

  if (
    correoNormalizado.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoNormalizado)
  ) {
    return res.status(400).json({
      ok: false,
      mensaje:
        "Ingresa un correo electrónico válido (ejemplo: usuario@correo.cl)",
    });
  }

  try {
    // 1. Verificamos si ya existe usando el servicio
    const usuarioExistente = await buscarUsuarioPorCorreo(correoNormalizado);
    if (usuarioExistente) {
      return res.status(409).json({
        ok: false,
        mensaje: "Ya existe una cuenta registrada con este correo",
      });
    }

    // 2. Hasheamos con bcrypt (10 rondas de salt)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Guardamos a través del servicio
    const nuevoUsuario = await registrarNuevoVecino({
      nombre: nombreLimpio,
      correo: correoNormalizado,
      passwordHash,
      telefono: telefonoLimpio,
    });

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

// Inicio de sesion para vecinos y administradores
export const iniciarSesion = async (req, res) => {
  const { correo, password } = req.body;

  if (
    !correo ||
    !password ||
    typeof correo !== "string" ||
    typeof password !== "string"
  ) {
    return res
      .status(400)
      .json({
        ok: false,
        mensaje:
          "Por favor ingresa un correo y contraseña válidos en formato de texto",
      });
  }

  try {
    const correoNormalizado = correo.trim().toLowerCase();
    const usuario = await buscarUsuarioPorCorreo(correoNormalizado);

    if (!usuario) {
      return res.status(401).json({
        ok: false,
        mensaje: "Credenciales invalidas (correo o contraseña incorrectos)",
      });
    }

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

export const obtenerPerfil = async (req, res) => {
  return res.json({ ok: true, usuario: req.usuario });
};
