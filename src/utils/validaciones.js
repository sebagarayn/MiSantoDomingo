// Utilidades de validación compartidas por los controladores.
// Objetivo: rechazar con 400 las entradas inválidas ANTES de llegar a la base de datos.

// Entero positivo dentro del rango de INTEGER de PostgreSQL
// ("12abc", "1.5", "-3" o 999999999999 => false)
export const esIdValido = (valor) =>
  /^\d+$/.test(String(valor)) &&
  Number(valor) > 0 &&
  Number(valor) <= 2147483647;

// Respuesta 400 uniforme: { ok: false, mensaje }
export const badRequest = (res, mensaje) =>
  res.status(400).json({ ok: false, mensaje });

// Contrato de entrada de los catalogos: { "nombre": "texto" }.
// Devuelve { nombre } si es valido o { error } con el motivo.
export const validarCuerpoCatalogo = (body) => {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { error: "El cuerpo de la petición debe ser un objeto JSON" };
  }

  // Lista explicita de campos permitidos: el cliente no controla nada mas
  const extras = Object.keys(body).filter((campo) => campo !== "nombre");
  if (extras.length > 0) {
    return { error: `Campos no permitidos: ${extras.join(", ")}` };
  }

  if (typeof body.nombre !== "string") {
    return { error: "El campo nombre es obligatorio y debe ser texto" };
  }

  const nombre = body.nombre.trim();
  if (nombre.includes("\u0000")) {
    return { error: "El nombre contiene caracteres no permitidos" };
  }
  if (nombre.length < 1 || nombre.length > 100) {
    return { error: "El nombre debe tener entre 1 y 100 caracteres" };
  }

  return { nombre };
};