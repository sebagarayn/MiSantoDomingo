import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

// TEST 1: Verificar que una ruta inexistente devuelva 404.
test("GET /api/ruta-inexistente debe responder 404", async () => {
  const respuesta = await request(app)
    .get("/api/ruta-inexistente");

  assert.equal(respuesta.status, 404);
  assert.equal(respuesta.body.ok, false);
  assert.match(
    respuesta.body.mensaje,
    /La ruta solicitada no existe/
  );
});

// TEST 2: Verificar que el servidor rechace JSON malformado.
test("POST /api/auth/login debe rechazar JSON malformado con 400", async () => {
  const respuesta = await request(app)
    .post("/api/auth/login")
    .set("Content-Type", "application/json")
    .send('{"correo": "prueba@ejemplo.cl",');

  assert.equal(respuesta.status, 400);
  assert.equal(respuesta.body.ok, false);
  assert.match(
    respuesta.body.mensaje,
    /JSON inválido o malformado/i
  );
});

// TEST 3: Verificar que no se pueda acceder al perfil sin autenticación.
test("GET /api/auth/perfil debe rechazar solicitudes sin token con 401", async () => {
  const respuesta = await request(app)
    .get("/api/auth/perfil");

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.ok, false);
  assert.match(
    respuesta.body.mensaje,
    /Acceso denegado/
  );
});


// TEST 4: Verificar que el sistema rechace un token inválido.
test("GET /api/auth/perfil debe rechazar un token inválido con 401", async () => {
  const respuesta = await request(app)
    .get("/api/auth/perfil")
    .set("Authorization", "Bearer token_invalido");

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.ok, false);
  assert.match(
    respuesta.body.mensaje,
    /Token inválido o expirado/
  );
});

// TEST 5: Verificar que no se pueda geocodificar una dirección vacía.
test("GET /api/geocodificar debe rechazar una dirección vacía con 400", async () => {
  const respuesta = await request(app)
    .get("/api/geocodificar")
    .query({ q: "" });

  assert.equal(respuesta.status, 400);
  assert.equal(respuesta.body.ok, false);
  assert.match(
    respuesta.body.mensaje,
    /Debe ingresar una dirección/
  );
});