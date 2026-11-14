import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import pool from "../src/config/db.js";

// ID del reclamo creado en el TEST 11.
let idReclamoCreadoParaNotificacion;

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

 // TEST 6: Verificar que un vecino pueda iniciar sesión correctamente.
test("POST /api/auth/login debe permitir login válido con 200", async () => {
  const respuesta = await request(app)
    .post("/api/auth/login")
    .send({
      correo: "vecino@correo.cl",
      password: "123456",
    });

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.ok, true);
  assert.equal(respuesta.body.usuario.rol, "vecino");
  assert.equal(typeof respuesta.body.token, "string");
  assert.ok(respuesta.body.token.length > 0);
});

 // TEST 7: Verificar que el login rechace una contraseña incorrecta.
test("POST /api/auth/login debe rechazar credenciales incorrectas con 401", async () => {
  const respuesta = await request(app)
    .post("/api/auth/login")
    .send({
      correo: "vecino@correo.cl",
      password: "contrasena_incorrecta",
    });

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.ok, false);
  assert.match(
    respuesta.body.mensaje,
    /Credenciales invalidas/
  );
  assert.equal(respuesta.body.token, undefined);
});

 // TEST 8: Verificar que un vecino no pueda realizar acciones de administrador.
test("PATCH /api/reclamos/:id/estado debe rechazar a un vecino con 403", async () => {
  // Primero iniciamos sesión como vecino.
  const login = await request(app)
    .post("/api/auth/login")
    .send({
      correo: "vecino@correo.cl",
      password: "123456",
    });

  assert.equal(login.status, 200);
  assert.equal(login.body.usuario.rol, "vecino");

  const tokenVecino = login.body.token;

  // Intentamos cambiar el estado de un reclamo.
  const respuesta = await request(app)
    .patch("/api/reclamos/1/estado")
    .set("Authorization", `Bearer ${tokenVecino}`)
    .send({
      estado: "Derivado",
    });

  // Un vecino no debe tener permisos de administrador.
  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.ok, false);
});

 // TEST 9: Verificar que no se pueda crear un reclamo sin ubicación.
test("POST /api/reclamos debe rechazar un reclamo sin ubicación con 400", async () => {
  // Iniciar sesión como vecino.
  const login = await request(app)
    .post("/api/auth/login")
    .send({
      correo: "vecino@correo.cl",
      password: "123456",
    });

  assert.equal(login.status, 200);

  // Intentar crear un reclamo sin ubicación.
  const respuesta = await request(app)
    .post("/api/reclamos")
    .set("Authorization", `Bearer ${login.body.token}`)
    .send({
      id_categoria: 1,
      descripcion: "Reclamo de prueba sin ubicación",
    });

  assert.equal(respuesta.status, 400);
  assert.equal(respuesta.body.ok, false);
  assert.match(
    respuesta.body.mensaje,
    /Categoria, descripcion y ubicacion son obligatorios/
  );
});

 // TEST 10: Verificar que se rechace un estado inválido.
test("PATCH /api/reclamos/:id/estado debe rechazar un estado inválido con 400", async () => {
  // Iniciar sesión como administrador.
  const login = await request(app)
    .post("/api/auth/login")
    .send({
      correo: "admin@correo.cl",
      password: "123456",
    });

  assert.equal(login.status, 200);
  assert.equal(login.body.usuario.rol, "admin");

  // Intentar asignar un estado inexistente.
  const respuesta = await request(app)
    .patch("/api/reclamos/1/estado")
    .set("Authorization", `Bearer ${login.body.token}`)
    .send({
      nuevo_estado: "Estado Inventado",
    });

  assert.equal(respuesta.status, 400);
  assert.equal(respuesta.body.ok, false);
  assert.equal(
    respuesta.body.mensaje,
    "El estado enviado no es válido"
  );
});

 // TEST 11: Verificar que un vecino pueda crear un reclamo válido.
test("POST /api/reclamos debe crear un reclamo válido con 201", async () => {
  // Iniciar sesión como vecino.
  const login = await request(app)
    .post("/api/auth/login")
    .send({
      correo: "vecino@correo.cl",
      password: "123456",
    });

  assert.equal(login.status, 200);
  assert.equal(login.body.usuario.rol, "vecino");

  // Crear un reclamo válido.
  const respuesta = await request(app)
    .post("/api/reclamos")
    .set("Authorization", `Bearer ${login.body.token}`)
    .send({
      id_categoria: 1,
      descripcion: "Reclamo de prueba automatizada para verificar la creación válida",
      ubicacion: "Calle de prueba 123, Santo Domingo",
    });

  // Comprobar la creación.
  assert.equal(respuesta.status, 201);
  assert.equal(respuesta.body.ok, true);

  assert.equal(
    respuesta.body.mensaje,
    "Reclamo ingresado exitosamente"
  );

  assert.equal(
    respuesta.body.reclamo.estado,
    "Pendiente"
  );

  assert.equal(
    typeof respuesta.body.reclamo.id_reclamo,
    "number"
  );

  assert.ok(respuesta.body.reclamo.folio);
  // Guardar el ID para utilizarlo en el TEST 12.
  idReclamoCreadoParaNotificacion =
    respuesta.body.reclamo.id_reclamo;
});

 // TEST 12: Verificar que se genere una notificación al cambiar el estado.
test("PATCH /api/reclamos/:id/estado debe generar una notificación para el vecino", async () => {

  assert.ok(
    idReclamoCreadoParaNotificacion,
    "Debe existir el reclamo creado en el TEST 11"
  );

  // 1. Iniciar sesión como administrador.
  const loginAdmin = await request(app)
    .post("/api/auth/login")
    .send({
      correo: "admin@correo.cl",
      password: "123456",
    });

  assert.equal(loginAdmin.status, 200);

  // 2. Cambiar el estado del reclamo.
  const actualizacion = await request(app)
    .patch(
      `/api/reclamos/${idReclamoCreadoParaNotificacion}/estado`
    )
    .set("Authorization", `Bearer ${loginAdmin.body.token}`)
    .send({
      nuevo_estado: "En Revisión",
      observacion: "Actualización para prueba automatizada",
    });

  assert.equal(actualizacion.status, 200);
  assert.equal(actualizacion.body.ok, true);

  // 3. Iniciar sesión como vecino.
  const loginVecino = await request(app)
    .post("/api/auth/login")
    .send({
      correo: "vecino@correo.cl",
      password: "123456",
    });

  assert.equal(loginVecino.status, 200);

  // 4. Consultar las notificaciones del vecino.
  const respuesta = await request(app)
    .get("/api/notificaciones")
    .set("Authorization", `Bearer ${loginVecino.body.token}`);

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.ok, true);

  // 5. Buscar la notificación correspondiente al reclamo.
  const notificacion = respuesta.body.notificaciones.find(
    (n) =>
      n.id_reclamo === idReclamoCreadoParaNotificacion &&
      n.tipo === "cambio_estado"
  );

  assert.ok(
    notificacion,
    "Debe existir una notificación por el cambio de estado"
  );

  assert.match(notificacion.mensaje, /está en revisión/i);
});
