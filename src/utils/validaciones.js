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