# MiSantoDomingo

<div align="center">
  <img src="public/logo-santodomingo.png" alt="Municipalidad de Santo Domingo" width="220" />
  <p><b>Plataforma Municipal de Atención y Seguimiento de Reclamos Vecinales</b></p>
</div>

---

## Índice

1. [Identificación de los integrantes del equipo y sus roles](#1-identificación-de-los-integrantes-del-equipo-y-sus-roles)
2. [Distribución de responsabilidades](#2-distribución-de-responsabilidades)
3. [Descripción general del sistema y problema que aborda](#3-descripción-general-del-sistema-y-problema-que-aborda)
4. [Principales funcionalidades](#4-principales-funcionalidades)
5. [Tecnologías y herramientas utilizadas](#5-tecnologías-y-herramientas-utilizadas)
6. [Arquitectura y estructura del backend](#6-arquitectura-y-estructura-del-backend)
7. [Base de datos](#7-base-de-datos)
8. [Instrucciones de instalación y configuración](#8-instrucciones-de-instalación-y-configuración)
9. [Variables de entorno](#9-variables-de-entorno)
10. [Instrucciones de ejecución y uso](#10-instrucciones-de-ejecución-y-uso)
11. [Documentación de la API REST](#11-documentación-de-la-api-rest)
12. [Autenticación y roles (JWT)](#12-autenticación-y-roles-jwt)
13. [Seguridad y validaciones](#13-seguridad-y-validaciones)
14. [Pruebas funcionales](#14-pruebas-funcionales)
15. [Integración frontend y backend](#15-integración-frontend-y-backend)
16. [Gestión del proyecto y evidencia de contribuciones](#16-gestión-del-proyecto-y-evidencia-de-contribuciones)
17. [Enlaces](#17-enlaces)
18. [Bibliografía y uso de IA](#18-bibliografía-y-uso-de-ia)

---

## 1. Identificación de los integrantes del equipo y sus roles

**Sebastian Garay** -

**Benjamín Lazcano** -

**Vicente Olguin** -

**Ignacio Maureira** -

---

## 2. Distribución de responsabilidades

### 2.1. Sebastián Garay

Responsabilidad:

Entregables:

### 2.2. Benjamin Lazcano

Responsabilidad:

Entregables:

### 2.3. Vicente Olguin

Responsabilidad:

Entregables:

### 2.4. Ignacio Maureira

Responsabilidad:

Entregables:

---

## 3. Descripción general del sistema y problema que aborda

### 3.1. Descripción general del sistema

<!-- Que hace el backend -->

### 3.2. Problema o necesidad que aborda

Tiempos de respuesta prolongados o falta de soluciones efectivas a los reclamos y
solicitudes que los ciudadanos ingresan al municipio, generando frustración.

### 3.3. Objetivos del proyecto

- Disponer de un canal ciudadano digital accesible para ingresar reclamos en menos de 3 minutos con obtención inmediata de comprobante único de folio.
- Garantizar la trazabilidad completa del ciclo de vida del reclamo tanto para el vecino como para los funcionarios municipales.
- Proporcionar al municipio una herramienta administrativa para medir tiempos de respuesta frente al plazo legal de 20 días y priorizar la gestión mediante indicadores KPI.

### 3.4. Objetivos específicos del backend

-
-
-

## 4. Principales funcionalidades

<!-- Funcionalidades que implementa el backend, por rol. Referenciar los RF del frontend desde el RF-01 al RF-11-->

### 4.1. Rol Vecino/Vecina

-

### 4.2. Rol Funcionario municipal (OIRS)

-

### 4.3. Acceso público (sin sesión)

-

---

## 5. Tecnologías y herramientas utilizadas

| Categoría                | Tecnología   | Versión |
| ------------------------ | ------------ | ------- |
| Lenguaje / Runtime       |              |         |
| Framework backend        |              |         |
| Base de datos relacional |              |         |
| ORM (opcional)           |              |         |
| Autenticación            |              |         |
| Hash de contraseñas      |              |         |
| Validación de datos      |              |         |
| Pruebas de API           |              |         |
| Control de versiones     | Git y GitHub |         |

---

## 6. Arquitectura y estructura del backend

<!-- Explicacion sobre la separacion de las rutas, controladores, servicios-->

### 6.1. Estructura del proyecto

```
MiSantoDomingo/
├──
├──
└──
```

### 6.2. Diagrama de arquitectura

<!-- El diagrama de arquitectura-->

---

## 7. Base de Datos

### 7.1. Creación de la base

Crear en PostgreSQL (pgAdmin) una base de datos llamada `misantodomingo_db`

### 7.2. Scripts SQL y orden de ejecución

Los scripts están en la carpeta `database/` y **deben ejecutarse en este orden**
(Query Tool sobre `misantodomingo_db`, abrir el archivo y presionar F5):

| Orden | Archivo                  | Qué hace                                                                                         |
| :---- | :----------------------- | :----------------------------------------------------------------------------------------------- |
| 1     | `schema.sql`             | Crea las tablas, restricciones y los catálogos (6 categorías y 5 unidades). No incluye usuarios. |
| 2     | `01_usuarios_prueba.sql` | Crea las cuentas de demostración (vecino y funcionario OIRS).                                    |
| 3     | `02_datos_prueba.sql`    | Carga 3 reclamos de prueba con su historial.                                                     |

el `schema.sql` solo crea la estructura
y los catálogos, pero ningún usuario. Sin usuarios no se puede iniciar sesión ni probar
las rutas protegidas

el `02_datos_prueba.sql` falla porque sus reclamos referencian a los
usuarios con id 1 y 2 (llaves foráneas). Este script deja la base lista solo con scripts
SQL, sin registrar usuarios a mano por la API. Las contraseñas se almacenan hasheadas con
bcrypt (no en texto plano).

### 7.3. Datos de prueba (`02_datos_prueba.sql`)

| Tabla | Descripción | Clave primaria | Claves foráneas |
| ----- | ----------- | -------------- | --------------- |
|       |             |                |                 |
|       |             |                |                 |

### 7.4. Restricciones e integridad

<!-- Lo que vimos en taller de BD ---- NOT NULL, UNIQUE, CHECK, ON DELETE, / ON UPDATE -->

### 7.5. Archivo `.sql`

El script que crea la base de datos, las tablas, atributos, claves primarias, claves foreanas y relaciones se encuentra en:

```
ruta/del/archivo.sql
```

Para ejecutarlo:

```bash


```

### 7.6. Datos iniciales o de prueba

<!-- Aqui van los datos iniciales o de prueba del INSERT -->

## 8. Instrucciones de instalación y configuración

### 8.1. Requisitos previos

-Node.js: Versión 18.x o superior recomendada.

- Motor de base de datos:
  -npm: Versión 9.x o superior.
  -Git: Instalado en el sistema operativo.

### 8.2. Pasos de instalación

1. Clonar el repositorio:

```bash
   git clone https://github.com/sebagarayn/MiSantoDomingo.git
```

2. Entrar al directorio del proyecto:

```bash
   cd MiSantoDomingo
```

3. Cambiar a la rama backend:

```bash
   git checkout backend
```

4. Instalar dependencias:

```bash

```

5. Crear la base de datos con el archivo `.sql`:

```bash

```

6. Configurar las variables de entorno (ver sección 9).

---

## 9. Variables de entorno

El archivo `.env` se encuentra protegido y excluido del repositorio mediante `.gitignore` para cumplir con la rúbrica de no exponer credenciales ni secretos en GitHub.

Para configurar el entorno local, se debe copiar la plantilla de ejemplo:

- **En Windows PowerShell:**
  ```powershell
  Copy-Item .env.example .env
  ```
- **En Linux / macOS:**
  ```bash
  cp .env.example .env
  ```

| Variable     | Descripción                                              | Valor recomendado / Ejemplo                     |
| :----------- | :------------------------------------------------------- | :---------------------------------------------- |
| `PORT`       | Puerto local en el que escucha el servidor Express       | `3000`                                          |
| `PGHOST`     | Servidor o host de la base de datos PostgreSQL           | `localhost`                                     |
| `PGPORT`     | Puerto de conexión a PostgreSQL                          | `5432`                                          |
| `PGDATABASE` | Nombre de la base de datos relacional creada en pgAdmin  | `misantodomingo_db`                             |
| `PGUSER`     | Usuario administrador de PostgreSQL                      | `postgres`                                      |
| `PGPASSWORD` | Contraseña local configurada en pgAdmin / PostgreSQL     | _Tu contraseña local_                           |
| `JWT_SECRET` | Clave secreta para la firma y verificación de tokens JWT | `secreto_jwt_super_seguro_para_evaluacion_2026` |

> **Nota de Seguridad (Criterio 2.5):** La variable `JWT_SECRET` es estrictamente obligatoria. El servidor implementa validación al inicio (`Fail-Fast`); si la variable no existe en el archivo `.env`, el servidor aborta el arranque con un mensaje claro en la terminal para impedir la ejecución con secretos por defecto vulnerables.

---

## 10. Instrucciones de ejecución y uso

### 10.1. Levantar el servidor

```bash

```

Una vez iniciado, la API queda disponible en:

```

```

### 10.2. Cuentas de prueba

Cuentas de demostración sembradas mediante `database/01_usuarios_prueba.sql` y alineadas directamente con las proto-personas definidas para el proyecto:

| Rol                          | Nombre         | Correo Electrónico | Contraseña | Permisos y Capacidades                                                                                                                |
| :--------------------------- | :------------- | :----------------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **Vecina (Ciudadana)**       | María González | `vecino@correo.cl` | `123456`   | Ingresar reclamos, consultar "Mis Reclamos", calificar con estrellas casos resueltos y cancelar reclamos propios en estado Pendiente. |
| **Funcionario OIRS (Admin)** | Felipe Pérez   | `admin@correo.cl`  | `123456`   | Acceso a bandeja general tabular, filtros combinados, derivación a unidades técnicas y cierre formal con respuesta oficial.           |

---

## 11. Documentación de la API REST

<!-- Documentar cada endpoint: metodo, ruta, parametro, autenticacion, respuesta esperada, y casos de error. y repetir el bloque de detalle por cada endpoint -->

### 11.1. Resumen de endpoints

| Método | Ruta | Descripción | Autenticación | Rol requerido |
| ------ | ---- | ----------- | ------------- | ------------- |
|        |      |             |               |               |
|        |      |             |               |               |
|        |      |             |               |               |
|        |      |             |               |               |

### 11.2. Detalle de endpoints

#### `MÉTODO /ruta`

- **Descripción:**
- **Autenticación:**
- **Parámetros / Body:**

```json

```

- **Respuesta exitosa (código):**

```json

```

- **Casos de error:**

| Código | Situación | Respuesta |
| ------ | --------- | --------- |
|        |           |           |

### 11.3. Códigos HTTP utilizados

| Código | Uso |
| ------ | --- |
| 200    |     |
| 201    |     |
| 400    |     |
| 401    |     |
| 403    |     |
| 404    |     |
| 500    |     |

---

## 12. Autenticación y roles (JWT)

### 12.1. Flujo de autenticación

1. **Credenciales:** El cliente envía `correo` y `password` al endpoint `POST /api/auth/login`.
2. **Validación:** El servidor busca el usuario en PostgreSQL y compara la contraseña contra el hash almacenado mediante `bcrypt.compare()`.
3. **Generación de Token:** Si las credenciales coinciden, se firma un token JWT con algoritmo HS256 utilizando la clave obligatoria `process.env.JWT_SECRET`.
4. **Almacenamiento y Envío:** El cliente almacena el token en `localStorage["msd_token"]` y lo adjunta en cada petición protegida mediante la cabecera `Authorization: Bearer <token>`.
5. **Middlewares de Control:**
   - `verificarToken`: Valida la firma del token y vigencia temporal.
   - `soloAdmin`: Verifica que `req.usuario.rol === 'admin'` antes de autorizar derivaciones o cierres formales.

### 12.2. Estructura del token (payload)

```json
{
  "id_usuario": 1,
  "nombre": "María González",
  "correo": "vecino@correo.cl",
  "rol": "vecino",
  "iat": 1792080000,
  "exp": 1792108800
}
```

### 12.3. Tiempo de expiración

Los tokens emitidos cuentan con una validez estricta de **8 horas** (`expiresIn: '8h'`).

### 12.4. Roles y permisos

| Rol                      | Endpoints / Acciones permitidas                                                                                                                                                                |
| :----------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vecino/Vecina**        | `POST /api/reclamos` (crear), `GET /api/reclamos` (solo sus propios reclamos), `DELETE /api/reclamos/:id` (cancelar pendiente), `POST /api/reclamos/:id/calificacion` (votar 1 a 5 estrellas). |
| **Funcionario OIRS**     | `GET /api/reclamos` (bandeja completa con filtros de estado/unidad), `PATCH /api/reclamos/:id/estado` (derivar casos a otras unidades y cerrar formalmente).                                   |
| **Público (Sin sesión)** | `GET /api/reclamos/folio/:folio` (consulta anónima de estado y trazabilidad), `GET /api/categorias`, `GET /api/unidades`, `POST /api/auth/login`, `POST /api/auth/registro`.                   |

---

## 13. Seguridad y validaciones

| Medida                                       | Implementación técnica en el sistema                                                                                                                                                                               |
| :------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hash de contraseñas con bcrypt**           | Cifrado con `bcryptjs` y 10 rondas de salt antes de insertar en la base de datos. Ninguna contraseña se almacena ni viaja en texto plano.                                                                          |
| **Validación de entradas**                   | Sanitización de cadenas (`btrim()`), validación de longitud mínima de clave ($\ge$ 6 caracteres) y validación de tipos numéricos.                                                                                  |
| **Prevención de inyección SQL**              | 100% de las consultas a PostgreSQL utilizan consultas parametrizadas con marcadores de posición (`$1, $2, $3...`) mediante `pg.Pool`.                                                                              |
| **Manejo seguro de secretos (Criterio 2.5)** | Se eliminó cualquier valor por defecto (_fallback secret_) del código fuente. `JWT_SECRET` se lee exclusivamente desde `process.env`; si la variable no existe, el servidor se detiene de inmediato (_Fail-Fast_). |
| **Protección de rutas por rol**              | Middlewares `verificarToken` y `soloAdmin` que rechazan con `401 Unauthorized` peticiones anónimas y con `403 Forbidden` intentos de escalada de privilegios.                                                      |
| **Manejo de errores seguro**                 | Respuestas HTTP consistentes en formato JSON (`400`, `401`, `403`, `404`, `409`, `500`) sin filtrar trazas de la base de datos ni detalles internos de la infraestructura.                                         |

---

## 14. Pruebas funcionales

### 14.1. Herramienta utilizada

Postman (versión de escritorio), usada para probar los endpoints de la API REST
contra el servidor local en `http://localhost:3000`.

<!-- Postman o Insomnia -->

### 14.2. Colección de pruebas

```
pruebas/MiSantoDomingo.postman_collection.json
```

### 14.3. Evidencia

<!-- Capturas de los casos exitosos y casos de error -->
<!-- Captura de la prueba de login -->

---

## 15. Integración frontend y backend

<!-- AQUI FALTAN COSAS REVISAR, FALTA POR RELLENAR -->

- **Cliente HTTP utilizado (fetch / Axios):**
- **Manejo de JWT (almacenamiento e interceptores):**
- **Manejo de errores y sesiones:**
- **Flujos principales funcionando con datos reales:**
- **Servicios mock reemplazados (`auth.service.ts`, `report.service.ts`):**

---

## 16. Gestión del proyecto y evidencia de contribuciones

 <!-- AQUI TAMBIEN FALTA POR RELLENAR-->

- **Ramas utilizadas:** `frontend` y `backend`
- **Convención de commits:**
- **Evidencia de trabajo colaborativo:**

---

## 17. Enlaces

| Recurso                            | Enlace                                                                                               |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Repositorio GitHub                 | https://github.com/sebagarayn/MiSantoDomingo                                                         |
| Prototipo Figma (Web / Escritorio) | https://www.figma.com/design/g226BWBCK7VZ2fzl9aj8at/Sin-título?node-id=0-1&t=OWk7vIgmDlFjNYgl-1      |
| Prototipo Figma (Móvil)            | https://www.figma.com/design/APracKRLzJMMzqzsLFHSXx/Sin-t%C3%ADtulo?node-id=0-1&t=x8JV6gNCCvaOFn40-1 |
| Colección Postman / Insomnia       |                                                                                                      |

---

## 18. Bibliografía y uso de IA

- **BIBLIOGRAFÍA**

- **USO DE IA**

En el desarrollo de este trabajo se utilizó inteligencia artificial como una herramienta de apoyo: orientación en el diseño del código y su estructura, auditoría del código y clarificación de conceptos. Todo el código fue analizado, adaptado y validado por los autores.
