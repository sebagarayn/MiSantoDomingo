# MiSantoDomingo

![Municipalidad de Santo Domingo](public/logo-santodomingo.png)

**Plataforma Municipal de Atención y Seguimiento de Reclamos Vecinales**  
_Municipalidad de Santo Domingo — Región de Valparaíso_  
Proyecto académico de Ingeniería Web y Móvil — Entrega Parcial 2 (Backend API REST & Base de Datos Relacional)

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

**Sebastian Garay** (`sebagarayn`) - Arquitectura de Software, Desarrollo Frontend y Control de Calidad

**Benjamín Lazcano** (`benjaminlazcanor-hub` / `lazcanobenjamin83-arch`) - Líder de Requerimientos, Investigación y Documentación UX

**Vicente Olguin** (`Vichonoma`) - Diseño UI/UX y Prototipado Manual Figma (Versión Escritorio / Web)

**Ignacio Maureira** (`IgnacioMaureira`) - Diseño UI/UX y Prototipado Manual Figma (Versión Móvil)

---

## 2. Distribución de responsabilidades
 
### 2.1. Sebastián Garay
 
Responsabilidad: Desarrollo de la API REST y de la autenticación del backend.
 
Entregables: API REST con los métodos GET, POST, PUT, PATCH y DELETE; implementación de la autenticación con JWT y gestión de los tokens; validación de las entradas de datos y de los identificadores; arquitectura en tres capas (rutas, controladores y servicios); manejador global de errores y respuestas JSON para rutas inexistentes; redacción de las secciones del README correspondientes al trabajo que realizó.
 
### 2.2. Benjamín Lazcano
 
Responsabilidad: Apoyo en la creación de la base del servidor, diseño y scripts de la base de datos, y pruebas funcionales de la API.
 
Entregables: Diagrama de la base de datos; scripts SQL para la creación de la base de datos, de las cuentas de usuarios de prueba y de los datos de prueba; pruebas funcionales de la API en Postman, con la colección exportada en un archivo JSON y los pantallazos de cada prueba junto a sus códigos de respuesta.
 
### 2.3. Vicente Olguin
 
Responsabilidad: Redacción y estructuración del README del backend.
 
Entregables: README.md redactado según las exigencias de la segunda entrega, que cubre todos los puntos solicitados para la rama `backend`.
 
### 2.4. Ignacio Maureira
 
Responsabilidad: Validaciones del registro de usuarios, apoyo en la redacción del README y corrección del prototipo en Figma.
 
Entregables: Validaciones del registro (formato del correo, tipos de datos y largos máximos de nombre, teléfono y contraseña) y su documentación en el README; apoyo en la redacción del README del backend; corrección del prototipo en Figma (responsabilidad asignada al equipo, no exigida en esta entrega).
 
---

## 3. Descripción general del sistema y problema que aborda

### 3.1. Descripción general del sistema


**API REST** desarrollada con **Node.js**, **Express** y **PostgreSQL** que da soporte a la plataforma MiSantoDomingo. Este sistema reemplaza los servicios **mock** del frontend por datos reales y se encarga de:
 
- **Registro e inicio de sesión**: permite a los vecinos crear una cuenta e ingresar a la plataforma mediante un token **JWT**, que identifica el rol como vecino o admin.

- **Gestión de reclamos**: permite ingresar reclamos con una fotografía opcional, generar un folio único para cada reclamo, actualizar el estado, derivar el reclamo entre unidades municipales, registrar una respuesta formal al cerrar los reclamos, editar los datos de un reclamo mientras está pendiente y gestionar su cancelación.

- **Control de plazos**: calcula el tiempo restante del plazo legal de 20 días para responder los reclamos e identifica los que ya se encuentran vencidos.

- **Historial de cambios**: registra las modificaciones de estado de cada reclamo, manteniendo la trazabilidad de la gestión.

- **Calificación ciudadana**: permite que los usuarios califiquen la atención recibida en una escala de 1 a 5 estrellas, evitando que un mismo usuario vote más de una vez.

### 3.2. Problema o necesidad que aborda

Tiempos de respuesta prolongados o falta de soluciones efectivas a los reclamos y
solicitudes que los ciudadanos ingresan al municipio, generando frustración.

> La justificación completa del problema y la caracterización de usuarios se encuentra en el README de la rama `frontend`.

### 3.3. Objetivos del proyecto

- Disponer de un canal ciudadano digital accesible para ingresar reclamos en menos de 3 minutos con obtención inmediata de comprobante único de folio.
- Garantizar la trazabilidad completa del ciclo de vida del reclamo tanto para el vecino como para los funcionarios municipales.
- Proporcionar al municipio una herramienta administrativa para medir tiempos de respuesta frente al plazo legal de 20 días y priorizar la gestión mediante indicadores **KPI**.

### 3.4. Objetivos específicos del backend

- Exponer la **API REST** con operaciones **GET**, **POST**, **PATCH** y **DELETE** sobre una base de datos relacional **PostgreSQL**, con respuestas **JSON** consistentes y códigos **HTTP** adecuados.

- Autenticar y autorizar a vecinos y funcionarios mediante **JWT**, restringiendo las acciones de gestión al rol administrador.

- Garantizar la integridad y trazabilidad de los datos mediante restricciones en la base datos, transacciones y un historial inmutable.

## 4. Principales funcionalidades

### 4.1. Rol Vecino/Vecina

Los vecinos y vecinas pueden utilizar la plataforma para ingresar reclamos, consultar su estado y hacer seguimiento de su resolución. Las funcionalidades disponibles para este rol son las siguientes:
 
- **Registro e inicio de sesión**: permite crear una cuenta e ingresar a la plataforma. Al crearse una cuenta, el sistema le asigna automáticamente el rol de vecino.

- **RF-01. Ingreso de reclamos**: permite ingresar un reclamo indicando la categoría, descripción y ubicación, además de adjuntar una fotografía de forma opcional. Se aceptan imágenes en formato **JPEG**, **PNG** o **WebP**, con un tamaño máximo de 5 MB.

- **RF-02. Generación de folio**: al ingresar un reclamo, el sistema genera un folio único con el formato `SD-AAAA-XXXXXX`, que permite identificarlo y consultarlo posteriormente.

- **RF-04. Seguimiento de plazos**: permite conocer los días restantes del plazo legal de 20 días para la resolución del reclamo y verificar si este se encuentra vencido.

- **RF-05. Consulta de reclamos**: permite revisar el listado de reclamos ingresados por el propio usuario, acceder al detalle de cada uno y consultar su historial de cambios.

- **RF-09. Calificación del servicio**: permite calificar con una puntuación de 1 a 5 estrellas un reclamo que haya sido resuelto. **Solo** la persona que ingresó el reclamo puede calificar y se admite un único voto.

- **Edición de reclamos**: permite modificar la categoría, la descripción y la ubicación de un reclamo propio mientras se encuentre en estado **"Pendiente"**. El cambio queda registrado en el historial.

- **Cancelación de reclamos**: permite al vecino o vecina cancelar un reclamo propio mientras se encuentre en estado **"Pendiente"**, cambiando su estado a **"Rechazado"**.

### 4.2. Rol Funcionario municipal (OIRS)

El funcionario municipal encargado de la OIRS puede acceder a los reclamos ingresados por los vecinos y gestionar su seguimiento hasta su resolución. Para ello, cuenta con las siguientes funcionalidades:

- **Inicio de sesión**: Permite ingresar a la plataforma con una cuenta que tenga asignado el rol admin.

- **RF-05. Consulta del historial**: Permite revisar el historial completo de cada reclamo, incluyendo los cambios realizados y el responsable de cada acción, lo que le facilita al administrador el seguimiento de su gestión.

- **RF-06. Consulta y filtrado de reclamos**: Permite visualizar todos los reclamos registrados en el sistema y filtrarlos por estado, categoría o unidad municipal. También permite buscar casos específicos mediante su folio o descripción.

- **RF-07. Derivación de reclamos**: Permite derivar un reclamo a otra unidad municipal para que sea gestionado por el área correspondiente. Para realizar la derivación es obligatorio indicar la unidad de destino y un motivo de la derivación.

- **RF-08. Gestión y cierre de reclamos**: Permite actualizar el estado de un reclamo durante su gestión y marcarlo como **"Resuelto"**, siempre que se ingrese una respuesta formal.

### 4.3. Acceso público (sin sesión)

- **RF-03. Consulta pública de reclamos**: Permite consultar un reclamo ingresando su número de folio. La información disponible incluye el estado actual del reclamo, la unidad municipal asignada, el plazo de respuesta, el historial de cambios y la calificación registrada.

- **Consulta de catálogos**: Permite acceder a los listados de categorías de reclamos y las unidades municipales que se encuentran disponibles actualmente en la plataforma.

- **Verificación del servidor**: Permite comprobar si el **backend** se encuentra operativo mediante el endpoint (`/api/health`).

---

## 5. Tecnologías y herramientas utilizadas

| Categoría                | Tecnología                                                                             | Versión          |
| ------------------------ | -------------------------------------------------------------------------------------- | ---------------- |
| Lenguaje / Runtime       | Node.js (módulos ES)                                                                   | 18.11 o superior |
| Framework backend        | Express                                                                                | 4.19.2           |
| Base de datos relacional | PostgreSQL (administrada con pgAdmin)                                                  |                  |
| Acceso a datos           | `pg` (consultas SQL parametrizadas, sin ORM)                                           | 8.12.0           |
| Autenticación            | JSON Web Token (`jsonwebtoken`)                                                        | 9.0.2            |
| Hash de contraseñas      | `bcryptjs`                                                                             | 2.4.3            |
| Carga de archivos        | `multer`                                                                               | 1.4.5-lts.1      |
| CORS                     | `cors`                                                                                 | 2.8.5            |
| Variables de entorno     | `dotenv`                                                                               | 16.4.5           |
| Validación de datos      | Validaciones manuales en los controladores y restricciones `CHECK` en la base de datos |                  |
| Pruebas de API           | Postman (escritorio)                                                                   |                  |
| Control de versiones     | Git y GitHub                                                                           |                  |

---

## 6. Arquitectura y estructura del backend

El backend sigue una arquitectura en tres capas. Cada petición pasa por `app.js` (CORS y lectura de JSON), por las **rutas** (`routes/`), que definen los endpoints, y por los **middlewares** (`middlewares/`), que verifican el JWT, el rol y la carga de archivos. Luego intervienen dos capas con responsabilidades separadas:
 
- **Controladores** (`controllers/`): capa HTTP. Validan los datos de la petición (campos obligatorios, tipos, largos e identificadores) y arman la respuesta con su código de estado.

- **Servicios** (`services/`): capa de datos. Ejecutan las consultas SQL sobre PostgreSQL a través de un pool de conexiones (`config/db.js`) y concentran las transacciones de las operaciones que modifican varias tablas.
Al final de `app.js` hay dos manejadores globales: uno responde en JSON las rutas que no existen y otro captura el JSON malformado y los errores no previstos, sin exponer trazas internas.

### 6.1. Estructura del proyecto

```
MiSantoDomingo/                 # rama backend
├── database/
│   ├── 00_crear_base.sql       # Crea la base de datos misantodomingo_db
│   ├── schema.sql              # Tablas, restricciones, índices, trigger y catálogos
│   ├── 01_usuarios_prueba.sql  # Cuentas de demostración
│   └── 02_datos_prueba.sql     # Reclamos de prueba con historial
├── pruebas/
│   ├── MiSantoDomingo.postman_collection.json
│   └── capturas/               # Evidencia de las pruebas en Postman
├── src/
│   ├── config/
│   │   └── db.js               # Pool de conexiones a PostgreSQL
│   ├── controllers/
│   │   ├── auth.controller.js      # Validación y respuestas de sesión
│   │   ├── catalogos.controller.js # Endpoints de categorías y unidades
│   │   └── reclamos.controller.js  # Controladores del ciclo de vida del reclamo
│   ├── services/
│   │   ├── auth.service.js         # Consultas SQL y lógica de usuarios
│   │   ├── catalogos.service.js    # Consultas SQL de categorías y unidades
│   │   └── reclamos.service.js     # Transacciones SQL, folios y estados
│   ├── middlewares/
│   │   ├── auth.middleware.js      # verificarToken y soloAdmin
│   │   └── upload.middleware.js    # Carga de fotografías (Multer)
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── catalogos.routes.js
│   │   └── reclamos.routes.js
│   └── app.js                  # Configuración de Express, CORS y captura de errores
├── uploads/                    # Fotografías subidas (se crea sola; ignorada por Git)
├── .env.example                # Plantilla de variables de entorno
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js                   # Punto de entrada: levanta el servidor y verifica la BD
```

### 6.2. Diagrama de arquitectura

```mermaid
flowchart LR
    C["Cliente<br/>Ionic + React / Postman"] --> A["app.js<br/>CORS y JSON"]
    A --> R["Rutas<br/>/api/auth, /api/reclamos, /api"]
    R --> M["Middlewares<br/>verificarToken, soloAdmin, upload"]
    M --> K["Controladores<br/>auth, catalogos, reclamos"]
    K --> S["Servicios<br/>auth, catalogos, reclamos"]
    S --> P[("PostgreSQL<br/>misantodomingo_db")]
    K --> U["uploads/<br/>fotografías"]
```

---

## 7. Base de Datos

### 7.1. Creación de la base

La base de datos se llama `misantodomingo_db`. Se crea ejecutando el script `database/00_crear_base.sql` conectado a la base `postgres` (Query Tool sobre `postgres`, abrir el archivo y presionar F5). También se puede crear a mano en pgAdmin: clic derecho sobre **Databases** → **Create** → **Database...** y escribir `misantodomingo_db`.

### 7.2. Scripts SQL y orden de ejecución

Los scripts están en la carpeta `database/` y **deben ejecutarse en este orden**. El primero se ejecuta sobre la base `postgres`; los otros tres, sobre `misantodomingo_db` (Query Tool, abrir el archivo y presionar F5):

| Orden | Archivo                  | Qué hace                                                                                         |
| :---- | :----------------------- | :----------------------------------------------------------------------------------------------- |
| 1     | `00_crear_base.sql`      | Crea la base de datos `misantodomingo_db`.                                                       |
| 2     | `schema.sql`             | Crea las tablas, restricciones y los catálogos (6 categorías y 5 unidades). No incluye usuarios. |
| 3     | `01_usuarios_prueba.sql` | Crea las cuentas de demostración (vecino y funcionario OIRS).                                    |
| 4     | `02_datos_prueba.sql`    | Carga 3 reclamos de prueba con su historial.                                                     |

**Justificación de `01_usuarios_prueba.sql`:** el `schema.sql` solo crea la estructura
y los catálogos, pero ningún usuario. Sin usuarios no se puede iniciar sesión ni probar
las rutas protegidas, y `02_datos_prueba.sql` falla porque sus reclamos referencian a los
usuarios con id 1 y 2 (llaves foráneas). Este script deja la base lista solo con scripts
SQL, sin registrar usuarios a mano por la API. Las contraseñas se almacenan hasheadas con
bcrypt.

### 7.3. Datos de prueba (`02_datos_prueba.sql`)

Permite validar en vivo los casos borde del sistema:

| Folio            | Estado    | Antigüedad | Caso que valida                                                                    |
| :--------------- | :-------- | :--------- | :--------------------------------------------------------------------------------- |
| `SD-2026-000101` | Pendiente | 3 días     | Reclamo reciente dentro de plazo                                                   |
| `SD-2026-000088` | Derivado  | 26 días    | Plazo legal de 20 días vencido y derivación a unidad                               |
| `SD-2026-000042` | Resuelto  | 15 días    | Reclamo con respuesta formal, listo para probar la calificación de 1 a 5 estrellas |

Cada reclamo incluye su registro en `historial_reclamos`.

### 7.4. Verificación

Ejecutar en el Query Tool:

```sql
SELECT folio, estado,
       CURRENT_DATE - fecha_ingreso::date AS dias_transcurridos
FROM reclamos
ORDER BY fecha_ingreso;
```

Deben aparecer 3 reclamos (26, 15 y 3 días).

### 7.5. Modelo relacional

```mermaid
erDiagram
    USUARIOS ||--o{ RECLAMOS : ingresa
    CATEGORIAS ||--o{ RECLAMOS : clasifica
    UNIDADES ||--o{ RECLAMOS : "tiene asignado"
    RECLAMOS ||--o{ HISTORIAL_RECLAMOS : registra
    USUARIOS ||--o{ HISTORIAL_RECLAMOS : realiza
    UNIDADES |o--o{ HISTORIAL_RECLAMOS : "destino de derivacion"
    RECLAMOS ||--o| CALIFICACIONES : recibe

    USUARIOS {
        int id_usuario PK
        string nombre
        string correo UK
        string password_hash
        string telefono
        string rol
        timestamptz fecha_registro
    }
    CATEGORIAS {
        int id_categoria PK
        string nombre UK
    }
    UNIDADES {
        int id_unidad PK
        string nombre UK
    }
    RECLAMOS {
        int id_reclamo PK
        string folio UK
        int id_usuario FK
        int id_categoria FK
        int id_unidad_asignada FK
        string descripcion
        string ubicacion
        string foto_url
        string estado
        timestamptz fecha_ingreso
        string respuesta_formal
    }
    HISTORIAL_RECLAMOS {
        int id_historial PK
        int id_reclamo FK
        int id_usuario FK
        int id_unidad_destino FK
        string estado
        string observacion
        timestamptz fecha
    }
    CALIFICACIONES {
        int id_calificacion PK
        int id_reclamo FK
        smallint puntaje
        string comentario
        timestamptz fecha
    }
```

### 7.6. Descripción de tablas

| Tabla                | Descripción                                                    | Clave primaria    | Claves foráneas                                                                                   |
| -------------------- | -------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------- |
| `usuarios`           | Cuentas de vecinos y funcionarios OIRS                         | `id_usuario`      | —                                                                                                 |
| `categorias`         | Catálogo de categorías de reclamo                              | `id_categoria`    | —                                                                                                 |
| `unidades`           | Catálogo de unidades municipales                               | `id_unidad`       | —                                                                                                 |
| `reclamos`           | Reclamos ingresados por los vecinos                            | `id_reclamo`      | `id_usuario` → `usuarios`; `id_categoria` → `categorias`; `id_unidad_asignada` → `unidades`       |
| `historial_reclamos` | Trazabilidad de cada cambio de estado y derivación (inmutable) | `id_historial`    | `id_reclamo` → `reclamos`; `id_usuario` → `usuarios`; `id_unidad_destino` → `unidades` (opcional) |
| `calificaciones`     | Calificación de 1 a 5 de un reclamo resuelto (voto único)      | `id_calificacion` | `id_reclamo` → `reclamos` (único)                                                                 |

### 7.7. Restricciones e integridad

| Tipo               | Detalle                                                                                                                                                                                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claves primarias   | Identificadores autogenerados (`GENERATED ALWAYS AS IDENTITY`) en todas las tablas                                                                                                                                                                                                                |
| `NOT NULL`         | Campos esenciales de cada tabla (nombre, correo, hash, folio, descripción, ubicación, estado, etc.)                                                                                                                                                                                               |
| `UNIQUE`           | `usuarios.correo`, `reclamos.folio`, nombres de `categorias` y `unidades`, y `calificaciones.id_reclamo` (garantiza el voto único)                                                                                                                                                                |
| `CHECK` de dominio | `rol` solo `vecino` o `admin`; `estado` solo `Pendiente`, `En Revisión`, `Derivado`, `Resuelto` o `Rechazado`; `puntaje` entre 1 y 5; textos obligatorios sin espacios vacíos                                                                                                                     |
| `CHECK` de negocio | `resuelto_con_respuesta` (un reclamo resuelto exige respuesta formal); `derivacion_completa` (una derivación exige unidad de destino y observación); `destino_solo_derivacion` (solo las derivaciones llevan unidad de destino); `correo_normalizado` (correo en minúsculas y con formato válido) |
| Claves foráneas    | Todas con `ON DELETE RESTRICT`: no se puede borrar un registro referenciado. No se define `ON UPDATE` (se usa el comportamiento por defecto, `NO ACTION`)                                                                                                                                         |
| Trigger            | `historial_inmutable` impide modificar o eliminar filas de `historial_reclamos`                                                                                                                                                                                                                   |
| Índices            | Por usuario, categoría y unidad en `reclamos`, y por reclamo y fecha en `historial_reclamos`                                                                                                                                                                                                      |

> **Aviso:** si las cuentas de demostración ya se crearon registrándolas por la API
> (`POST /api/auth/registro`), no ejecutar `01_usuarios_prueba.sql`, porque los
> correos ya existen y daría error de duplicado. Ese script es para bases nuevas.

---

## 8. Instrucciones de instalación y configuración

### 8.1. Requisitos previos

- **Node.js:** versión 18.11 o superior.
- **npm:** versión 9.x o superior.
- **PostgreSQL y pgAdmin:** instalados y con el servicio de PostgreSQL en ejecución.
- **Git:** instalado en el sistema operativo.
- **Postman** (opcional): para probar los endpoints.

### 8.2. Pasos de instalación

**En Visual studio**:

**Paso 1. Clonar el repositorio**

```bash
   git clone https://github.com/sebagarayn/MiSantoDomingo.git
```

**Paso 2. Entrar al directorio del proyecto**

```bash
   cd MiSantoDomingo
```

**Paso 3. Cambiar a la rama backend**

```bash
   git checkout backend
```

**Paso 4. Instalar las dependencias**

```bash
   npm install
```

**Paso 5. Crear la base de datos** _(pgAdmin 4)_

1. Conectarse al servidor de PostgreSQL (ícono del elefante).
2. Clic derecho sobre la base **postgres** → **Query Tool**.
3. Abrir el archivo `database/00_crear_base.sql` (ícono de carpeta, **Open File**) y presionar **F5**. Crea la base `misantodomingo_db`.
4. Actualizar el árbol (clic derecho sobre **Databases** → **Refresh**) y comprobar que aparece `misantodomingo_db`.
   Si no encuentras el archivo, se puede crear la base a mano: clic derecho sobre **Databases** → **Create** → **Database...**, escribir exactamente `misantodomingo_db` y presionar **Save**.

**Paso 6. Crear las tablas y cargar los datos** _(pgAdmin 4)_

Este paso se hace dentro de la base recién creada. Se abren y ejecutan **uno por uno** los tres archivos de la carpeta `database/`, en este orden:

| Orden | Archivo                  | Qué hace                                                                                         |
| :---- | :----------------------- | :----------------------------------------------------------------------------------------------- |
| 1     | `schema.sql`             | Crea las tablas, restricciones y los catálogos (6 categorías y 5 unidades). No incluye usuarios. |
| 2     | `01_usuarios_prueba.sql` | Crea las cuentas de demostración (vecino y funcionario OIRS).                                    |
| 3     | `02_datos_prueba.sql`    | Carga 3 reclamos de prueba con su historial.                                                     |

1. En el árbol de pgAdmin, abrir **Databases** y hacer clic derecho sobre **`misantodomingo_db`** (la que acabas de crear, no `postgres`) → **Query Tool**.
2. En la barra de la ventana del Query Tool, presionar el ícono de carpeta (**Open File**).
3. Buscar la carpeta `MiSantoDomingo/database/`, abrir `schema.sql` y presionar **F5**. Debe aparecer el mensaje _Query returned successfully_.
4. Repetir los pasos 2 y 3 con `01_usuarios_prueba.sql` y después con `02_datos_prueba.sql`.
   Si no sabes dónde quedó la carpeta del proyecto: en Visual Studio Code, clic derecho sobre la carpeta `database` → **Reveal in File Explorer**; o en la terminal, dentro de `MiSantoDomingo`, ejecutar `pwd` para ver la ruta.

> **Importante:** el orden no se puede alterar, porque `02_datos_prueba.sql` necesita las cuentas creadas por `01_usuarios_prueba.sql`. Si las cuentas de demostración ya se crearon registrándolas por la API (`POST /api/auth/registro`), no ejecutar `01_usuarios_prueba.sql`, porque los correos ya existen y daría error de duplicado.

Para comprobar que todo se cargó bien, en el mismo Query Tool abrir una pestaña nueva y ejecutar con **F5**:

```sql
SELECT folio, estado,
       CURRENT_DATE - fecha_ingreso::date AS dias_transcurridos
FROM reclamos
ORDER BY fecha_ingreso;
```

Deben aparecer 3 reclamos (26, 15 y 3 días).

**Paso 7. Crear el archivo de variables de entorno** _(Terminal, dentro de la carpeta `MiSantoDomingo`)_

Hay que crear una copia del archivo `.env.example` con el nombre `.env`. En la terminal, estando dentro de `MiSantoDomingo`:

- En Windows (PowerShell o terminal de Visual Studio Code):

```powershell
  Copy-Item .env.example .env
```

- En Linux / macOS:

```bash
  cp .env.example .env
```

También se puede hacer a mano en Visual Studio Code: clic derecho sobre `.env.example` → **Copy**, clic derecho en un espacio vacío del panel → **Paste**, y renombrar la copia a `.env`.

**Paso 8. Completar el archivo `.env`** _(Visual Studio Code o editor de texto)_

Abrir la carpeta `MiSantoDomingo` en Visual Studio Code (**File → Open Folder...**), abrir el archivo `.env` y dejarlo así, cambiando solo `PGPASSWORD`

```env
PORT=3000
PGHOST=localhost
PGPORT=5432
PGDATABASE=misantodomingo_db
PGUSER=postgres
PGPASSWORD=tu_contraseña_de_postgres
JWT_SECRET=una_cadena_larga_y_aleatoria
```

- `PGPASSWORD`: la contraseña que configuraste al instalar PostgreSQL.
- `JWT_SECRET`: obligatoria. Si falta, el servidor no inicia y muestra un mensaje en la terminal.
- El archivo `.env` está en `.gitignore`: no se sube al repositorio.

Guardar el archivo (Ctrl + S).

**Paso 9. Comprobar la instalación** _(Terminal y navegador)_

En la terminal, dentro de `MiSantoDomingo`:

```bash
npm run dev
```

En la terminal debe aparecer la confirmación de la conexión con PostgreSQL, y el servidor queda disponible en `http://localhost:3000`. En el navegador, abrir `http://localhost:3000/api/health`: debe responder con un JSON de estado correcto.

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

En la terminal de Visual Studio Code, dentro de la carpeta `MiSantoDomingo`:

```bash
npm run dev     # desarrollo, con reinicio automático
npm start       # producción
```

El servidor queda en `http://localhost:3000` y, al iniciar, confirma la conexión con
PostgreSQL en la consola. En modo `dev` el servidor se reinicia solo al detectar
cambios en archivos; si una petición falla con `ECONNRESET` justo en ese momento, basta
reenviarla.

### 10.2. Cuentas de demostración

Cuentas creadas con `database/01_usuarios_prueba.sql` y alineadas con las proto-personas definidas para el proyecto:

| Rol                          | Nombre         | Correo electrónico | Contraseña | Permisos y capacidades                                                                                                                |
| :--------------------------- | :------------- | :----------------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **Vecina (ciudadana)**       | Maria Gonzalez | `vecino@correo.cl` | `123456`   | Ingresar reclamos, consultar "Mis Reclamos", calificar con estrellas casos resueltos y cancelar reclamos propios en estado Pendiente. |
| **Funcionario OIRS (admin)** | Felipe Perez   | `admin@correo.cl`  | `123456`   | Bandeja general con filtros combinados, derivación a unidades técnicas y cierre formal con respuesta oficial.                         |

El inicio de sesión valida la contraseña contra el hash guardado en la base de datos: no acepta cualquier clave.

- Estas cuentas existen solo si se cargó `01_usuarios_prueba.sql` en la base de datos.
- También se puede crear un vecino nuevo desde la pantalla de registro del frontend o con `POST /api/auth/registro`; queda guardado en PostgreSQL con la contraseña cifrada.
- El rol `admin` no se puede obtener por el registro: solo se asigna directamente en la base de datos.

### 10.3. Uso de la API

1. Iniciar sesión: `POST /api/auth/login` con body JSON `{ "correo": "vecino@correo.cl", "password": "123456" }`. Devuelve un token JWT.
2. Para rutas protegidas, enviar el header `Authorization: Bearer <token>` (el token expira a las 8 horas).
3. Ejemplos rápidos:
   - Público (sin token): `GET /api/reclamos/folio/SD-2026-000101`
   - Con token: `GET /api/reclamos`
   - Calificar un reclamo resuelto (solo su dueño): `POST /api/reclamos/:id/calificacion`
     con body `{ "puntaje": 5 }`. La calificación es de voto único.

---

### 10.4. Levantar la aplicación frontend (Ionic + React)
 
El frontend está en la rama `frontend` del mismo repositorio. Para probar la plataforma completa con su interfaz, el backend debe seguir corriendo (secciones 8 y 10.1) y el frontend se levanta **en una carpeta distinta**, porque cambiar de rama dentro de la carpeta del backend reemplazaría sus archivos.
 
En una **terminal nueva** (PowerShell o la terminal de Visual Studio Code), ubicada fuera de la carpeta `MiSantoDomingo` del backend:
 
1. Clonar el repositorio en una carpeta nueva:
```bash
   git clone https://github.com/sebagarayn/MiSantoDomingo.git MiSantoDomingo-frontend
```
 
2. Entrar a la carpeta y cambiar a la rama `frontend`:
```bash
   cd MiSantoDomingo-frontend
   git checkout frontend
```
 
3. Instalar las dependencias e iniciar el cliente web:
```bash
   npm install
   npm run dev
```
 
4. Abrir en el navegador la dirección que muestra la terminal (por defecto `http://localhost:5173`). La aplicación se conecta a esta API en `http://localhost:3000/api`.

5. Iniciar sesión con las cuentas de la sección 10.2 (`vecino@correo.cl` o `admin@correo.cl`, con contraseña `123456`). Si el backend está apagado, el frontend muestra un mensaje de conexión.
---

## 11. Documentación de la API REST

URL base: `http://localhost:3000`. Todas las respuestas son JSON con el campo `ok` (`true` o `false`) y, en los errores, un `mensaje`. Las rutas protegidas requieren el header `Authorization: Bearer <token>`.

### 11.1. Resumen de endpoints

| Método | Ruta                             | Descripción                                                   | Autenticación | Rol requerido             |
| ------ | -------------------------------- | ------------------------------------------------------------- | ------------- | ------------------------- |
| GET    | `/api/health`                    | Verifica que la API esté funcionando                          | No            | Público                   |
| POST   | `/api/auth/registro`             | Registra un nuevo vecino                                      | No            | Público                   |
| POST   | `/api/auth/login`                | Inicia sesión y entrega el token JWT                          | No            | Público                   |
| GET    | `/api/auth/perfil`               | Devuelve los datos del usuario del token                      | Sí            | Cualquiera                |
| GET    | `/api/categorias`                | Lista las categorías de reclamo                               | No            | Público                   |
| GET    | `/api/unidades`                  | Lista las unidades municipales                                | No            | Público                   |
| GET    | `/api/reclamos/folio/:folio`     | Consulta pública de un reclamo por folio                      | No            | Público                   |
| GET    | `/api/reclamos`                  | Lista reclamos (vecino: los suyos; admin: todos, con filtros) | Sí            | Vecino / Admin            |
| POST   | `/api/reclamos`                  | Ingresa un nuevo reclamo (foto opcional)                      | Sí            | Usuario autenticado       |
| GET    | `/api/reclamos/:id`              | Detalle de un reclamo con historial y calificación            | Sí            | Dueño del reclamo / Admin |
| PATCH  | `/api/reclamos/:id/estado`       | Actualiza estado, deriva o cierra un reclamo                  | Sí            | Admin                     |
| DELETE | `/api/reclamos/:id`              | Cancela un reclamo en estado `Pendiente`                      | Sí            | Dueño del reclamo / Admin |
| POST   | `/api/reclamos/:id/calificacion` | Califica de 1 a 5 un reclamo resuelto                         | Sí            | Dueño del reclamo         |
| PUT    | `/api/reclamos/:id`              | Edita antecedentes de un reclamo en estado `Pendiente`        | Sí            | Dueño del reclamo         |

### 11.2. Detalle de endpoints
 
#### `POST /api/auth/registro`
 
- **Descripción:** crea una cuenta de vecino. El rol se asigna siempre como `vecino`.
- **Autenticación:** no requiere.
- **Body (JSON):** `nombre`, `correo` y `password` son obligatorios; `telefono` es opcional. Validaciones: todos los campos deben ser texto; el nombre no puede estar vacío ni superar 100 caracteres; la contraseña debe tener entre 6 y 72 caracteres; el teléfono no puede superar 20 caracteres; el correo debe tener un formato válido (por ejemplo, `usuario@correo.cl`) y no superar 254 caracteres. El correo se guarda en minúsculas y sin espacios.
```json
{ "nombre": "Usuario Prueba", "correo": "prueba@correo.cl", "password": "123456" }
```
 
- **Respuesta exitosa (201):**
```json
{
  "ok": true,
  "mensaje": "Usuario registrado exitosamente",
  "usuario": { "id_usuario": 3, "nombre": "Usuario Prueba", "correo": "prueba@correo.cl", "rol": "vecino", "fecha_registro": "2026-10-19T01:14:20.531Z" }
}
```
 
- **Casos de error:**
| Código | Situación |
|---|---|
| 400 | Faltan campos obligatorios, los datos no son texto, o no se cumple alguna validación (nombre vacío o de más de 100 caracteres, contraseña de menos de 6 o más de 72 caracteres, teléfono de más de 20 caracteres, correo con formato inválido) |
| 409 | Ya existe una cuenta con ese correo |
| 500 | Error interno del servidor |
 
#### `POST /api/auth/login`
 
- **Descripción:** valida las credenciales y entrega un token JWT con vigencia de 8 horas.
- **Autenticación:** no requiere.
- **Body (JSON):**
```json
{ "correo": "vecino@correo.cl", "password": "123456" }
```
 
- **Respuesta exitosa (200):**
```json
{
  "ok": true,
  "mensaje": "Inicio de sesion exitoso",
  "token": "<token JWT>",
  "usuario": { "id_usuario": 1, "nombre": "Maria Gonzalez", "correo": "vecino@correo.cl", "rol": "vecino" }
}
```
 
- **Casos de error:**
| Código | Situación |
|---|---|
| 400 | Falta el correo o la contraseña |
| 401 | Credenciales inválidas (el mensaje es el mismo si falla el correo o la clave) |
| 500 | Error interno del servidor |
 
#### `GET /api/reclamos/folio/:folio`
 
- **Descripción:** consulta pública de un reclamo por su folio, sin iniciar sesión (RF-03).
- **Autenticación:** no requiere.
- **Ejemplo:** `GET /api/reclamos/folio/SD-2026-000101`
- **Respuesta exitosa (200):**
```json
{
  "ok": true,
  "reclamo": {
    "id_reclamo": 1, "folio": "SD-2026-000101", "estado": "Pendiente",
    "fecha_ingreso": "2026-10-15T12:00:00.000Z", "respuesta_formal": null,
    "categoria": "Alumbrado público", "unidad_asignada": "OIRS Central",
    "dias_restantes": 17, "vencido": false
  },
  "historial": [
    { "estado": "Pendiente", "observacion": "Reclamo ingresado mediante plataforma ciudadana.", "fecha": "2026-10-15T12:00:00.000Z", "unidad_destino": null }
  ],
  "calificacion": null
}
```
 
- **Nota:** las fechas y los `dias_restantes` dependen del día en que se cargaron los datos de prueba (este reclamo se carga con 3 días de antigüedad).
- **Casos de error:**
| Código | Situación |
|---|---|
| 404 | No existe un reclamo con ese folio |
| 500 | Error interno del servidor |
 
#### `GET /api/reclamos`
 
- **Descripción:** lista reclamos. El vecino recibe solo los suyos; el administrador recibe todos y puede filtrar.
- **Autenticación:** requiere token.
- **Parámetros de consulta (opcionales):** `estado`, `id_categoria`, `id_unidad`, `busqueda` (texto que se busca en el folio, la descripción o la ubicación).
- **Respuesta exitosa (200):** `{ "ok": true, "total": 3, "reclamos": [ ... ] }`, ordenados del más reciente al más antiguo. Cada reclamo incluye:
  - `id_reclamo`, `id_usuario`, `folio`, `descripcion`, `ubicacion`, `foto_url`, `estado`, `fecha_ingreso` y `respuesta_formal`.
  - `categoria`, `unidad_asignada` y `nombre_vecino` (nombres, no solo identificadores).
  - `dias_restantes` y `vencido`, calculados con el plazo legal de 20 días.
  - `calificacion`: el puntaje de 1 a 5, o `null` si todavía no fue calificado.
  - `historial`: la lista de cambios del reclamo en orden cronológico, con `estado`, `fecha`, `observacion`, `unidad_destino` y `nombre_responsable` de cada uno.
- **Casos de error:**
| Código | Situación |
|---|---|
| 401 | No se envió el token |
| 403 | Token inválido o expirado |
| 500 | Error interno del servidor |
 
#### `POST /api/reclamos`
 
- **Descripción:** ingresa un reclamo con estado `Pendiente`, genera su folio único (`SD-AAAA-XXXXXX`) y crea el primer registro del historial en una transacción.
- **Autenticación:** requiere token.
- **Body (`multipart/form-data`):** `id_categoria`, `descripcion` y `ubicacion` son obligatorios; `foto` es opcional (JPEG, PNG o WebP, máximo 5 MB).
- **Ejemplo de body (`form-data`):** `id_categoria` = `1`, `descripcion` = `Reclamo de prueba`, `ubicacion` = `Calle Los Aromos 100`.
- **Respuesta exitosa (201):**
```json
{
  "ok": true,
  "mensaje": "Reclamo ingresado exitosamente",
  "reclamo": {
    "id_reclamo": 4,
    "folio": "SD-2026-DN98KM",
    "id_usuario": 1,
    "id_categoria": 1,
    "id_unidad_asignada": 1,
    "descripcion": "Reclamo de prueba",
    "ubicacion": "Calle Los Aromos 100",
    "foto_url": null,
    "estado": "Pendiente",
    "fecha_ingreso": "2026-10-19T01:21:14.861Z",
    "respuesta_formal": null
  }
}
```
 
- **Casos de error:**
| Código | Situación |
|---|---|
| 400 | Faltan categoría, descripción o ubicación |
| 401 / 403 | Token ausente, o inválido o expirado |
| 500 | Error interno del servidor |
 
#### `GET /api/reclamos/:id`
 
- **Descripción:** detalle completo de un reclamo, con historial (incluye el responsable de cada acción) y calificación.
- **Autenticación:** requiere token. El vecino solo puede ver sus propios reclamos.
- **Casos de error:**
| Código | Situación |
|---|---|
| 400 | El `id` del reclamo no es un número entero válido |
| 401 / 403 | Token ausente, o inválido o expirado |
| 403 | Un vecino intenta ver un reclamo ajeno |
| 404 | Reclamo no encontrado |
| 500 | Error interno del servidor |
 
#### `PUT /api/reclamos/:id`
 
- **Descripción:** reemplaza la categoría, la descripción y la ubicación de un reclamo mientras esté en estado `Pendiente`, y deja constancia en el historial ("Antecedentes del reclamo actualizados por el usuario (PUT)"). La operación se ejecuta en una transacción.
- **Autenticación:** requiere token. Un vecino solo puede editar sus propios reclamos; el administrador puede editar cualquier reclamo que esté pendiente.
- **Body (JSON):** `id_categoria`, `descripcion` y `ubicacion` son obligatorios.
```json
{
  "id_categoria": 2,
  "descripcion": "Basura acumulada hace una semana en la esquina",
  "ubicacion": "Av. Libertad 123"
}
```
 
- **Respuesta exitosa (200):**
```json
{
  "ok": true,
  "mensaje": "Reclamo actualizado exitosamente (PUT)",
  "reclamo": {
    "id_reclamo": 5,
    "folio": "SD-2026-TLKCQ5",
    "id_usuario": 1,
    "id_categoria": 2,
    "id_unidad_asignada": 1,
    "descripcion": "Basura acumulada hace una semana en la esquina",
    "ubicacion": "Av. Libertad 123",
    "foto_url": null,
    "estado": "Pendiente",
    "fecha_ingreso": "2026-10-25T02:03:58.804Z",
    "respuesta_formal": null
  }
}
```
 
- **Casos de error:**
| Código | Situación |
|---|---|
| 400 | El `id` no es un número entero válido, o falta la categoría, la descripción o la ubicación |
| 401 / 403 | Token ausente, o inválido o expirado |
| 403 | Un vecino intenta editar un reclamo ajeno |
| 404 | Reclamo no encontrado |
| 409 | El reclamo no está en estado `Pendiente` |
| 500 | Error interno del servidor |
 
#### `PATCH /api/reclamos/:id/estado`
 
- **Descripción:** el funcionario actualiza el estado, deriva o cierra un reclamo y deja constancia en el historial.
- **Autenticación:** requiere token con rol `admin`.
- **Body (JSON):** `nuevo_estado` es obligatorio. Si es `Derivado`, se exigen `id_unidad_destino` y `observacion`. Si es `Resuelto`, se exige `respuesta_formal`.
```json
{ "nuevo_estado": "Derivado", "id_unidad_destino": 2, "observacion": "Corresponde a Obras municipales" }
```
 
- **Respuesta exitosa (200):** `{ "ok": true, "mensaje": "Reclamo actualizado exitosamente al estado: Derivado" }`
- **Casos de error:**
| Código | Situación |
|---|---|
| 400 | El `id` no es un número entero válido, falta el nuevo estado, falta la unidad de destino o el motivo (derivación) o falta la respuesta formal (cierre) |
| 401 / 403 | Token ausente, inválido o expirado, o el usuario no es administrador |
| 404 | Reclamo no encontrado |
| 409 | El reclamo ya está cerrado (`Resuelto` o `Rechazado`) |
| 500 | Error interno del servidor |
 
#### `DELETE /api/reclamos/:id`
 
- **Descripción:** cancela un reclamo en estado `Pendiente`. Es una baja lógica: el estado pasa a `Rechazado` y se registra en el historial.
- **Autenticación:** requiere token. Un vecino solo puede cancelar sus propios reclamos.
- **Respuesta exitosa (200):** `{ "ok": true, "mensaje": "Reclamo cancelado exitosamente" }`
- **Casos de error:**
| Código | Situación |
|---|---|
| 400 | El `id` del reclamo no es un número entero válido |
| 401 / 403 | Token ausente, o inválido o expirado |
| 403 | Un vecino intenta cancelar un reclamo ajeno |
| 404 | Reclamo no encontrado |
| 409 | El reclamo no está en estado `Pendiente` |
| 500 | Error interno del servidor |
 
#### `POST /api/reclamos/:id/calificacion`
 
- **Descripción:** registra la calificación ciudadana de un reclamo resuelto (RF-09). Es de voto único.
- **Autenticación:** requiere token. Solo puede calificar quien ingresó el reclamo.
- **Body (JSON):** `puntaje` entero entre 1 y 5; `comentario` es opcional.
```json
{ "puntaje": 5 }
```
 
- **Respuesta exitosa (201):** `{ "ok": true, "mensaje": "Gracias por calificar la respuesta municipal" }`
- **Casos de error:**
| Código | Situación |
|---|---|
| 400 | El `id` no es un número entero válido, o el puntaje no es un entero entre 1 y 5 |
| 401 / 403 | Token ausente, o inválido o expirado |
| 403 | El usuario no es quien ingresó el reclamo |
| 404 | Reclamo no encontrado |
| 409 | El reclamo no está `Resuelto`, o ya tiene una calificación (voto único) |
| 500 | Error interno del servidor |

---

### 11.3. Códigos HTTP utilizados
 
| Código | Uso |
|---|---|
| 200 | Consultas y actualizaciones exitosas (incluye PUT, PATCH y DELETE) |
| 201 | Recurso creado: registro de usuario, reclamo y calificación |
| 400 | Datos faltantes o inválidos, identificador que no es un número o JSON malformado |
| 401 | Falta el token o las credenciales son inválidas |
| 403 | Token inválido o expirado, o sin permisos para la acción |
| 404 | Recurso no encontrado o ruta inexistente |
| 409 | Conflicto: correo repetido, estado que no permite la acción o voto duplicado |
| 500 | Error interno del servidor |

### 11.4. Errores generales del servidor
 
Además de las respuestas de cada endpoint, `app.js` define dos manejadores globales que siempre responden en formato JSON, sin páginas HTML ni trazas de Node.js:
 
| Código | Situación | Mensaje |
|---|---|---|
| 404 | Se llama a una ruta que no existe | `La ruta solicitada no existe en este servidor: <MÉTODO> <ruta>` |
| 400 | El cuerpo de la petición es un JSON malformado | `El cuerpo de la petición contiene un formato JSON inválido o malformado` |
| 500 | Cualquier otro error no previsto, por ejemplo, subir una fotografía que no es JPEG, PNG o WebP, o que pesa más de 5 MB | `Ocurrió un error interno en el servidor` |
 
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
 
| Rol | Endpoints / acciones permitidas |
| :-- | :------------------------------ |
| **Vecino/Vecina** | `GET /api/auth/perfil`; `POST /api/reclamos` (crear); `GET /api/reclamos` (solo sus reclamos); `GET /api/reclamos/:id` (solo el detalle de sus reclamos); `PUT /api/reclamos/:id` (editar un reclamo pendiente); `DELETE /api/reclamos/:id` (cancelar pendiente); `POST /api/reclamos/:id/calificacion` (votar de 1 a 5 estrellas). |
| **Funcionario OIRS** | `GET /api/reclamos` (bandeja completa con filtros de estado, categoría, unidad y búsqueda); `GET /api/reclamos/:id` (detalle de cualquier reclamo); `PATCH /api/reclamos/:id/estado` (derivar casos a otras unidades y cerrar formalmente); `PUT /api/reclamos/:id` y `DELETE /api/reclamos/:id` (sobre cualquier reclamo en estado pendiente). |
| **Público (sin sesión)** | `GET /api/health`; `GET /api/reclamos/folio/:folio` (consulta anónima de estado y trazabilidad); `GET /api/categorias`; `GET /api/unidades`; `POST /api/auth/login`; `POST /api/auth/registro`. |
 
---

## 13. Seguridad y validaciones

| Medida | Implementación técnica en el sistema |
| :----- | :----------------------------------- |
| **Hash de contraseñas con bcrypt** | Cifrado con `bcryptjs` y 10 rondas de salt antes de insertar en la base de datos. Ninguna contraseña se almacena ni viaja en texto plano, y el hash nunca se devuelve en las respuestas. |
| **Validación de entradas** | Campos obligatorios en registro, login, reclamos y cambios de estado. En el registro se valida además que los datos sean texto, que el nombre no esté vacío (máximo 100 caracteres), que la contraseña tenga entre 6 y 72 caracteres, que el teléfono no supere 20 caracteres y que el correo tenga un formato válido (máximo 254 caracteres) y se guarde normalizado. Los identificadores de reclamo de la URL deben ser números enteros, el puntaje es un entero de 1 a 5 y las fotografías se limitan a JPEG, PNG o WebP de hasta 5 MB. La base de datos refuerza las reglas con restricciones `CHECK`, incluida la validación de textos sin espacios vacíos (`btrim()`). |
| **Prevención de inyección SQL** | Todas las consultas a PostgreSQL usan parámetros (`$1`, `$2`, `$3`...) mediante `pg.Pool`. Los filtros dinámicos agregan solo marcadores de posición, nunca valores concatenados. |
| **Manejo seguro de secretos (criterio 2.5)** | No hay valores por defecto (*fallback*) para el secreto en el código fuente. `JWT_SECRET` se lee solo desde `process.env`; si no existe, el servidor se detiene al iniciar con el mensaje "Falta la variable de entorno JWT_SECRET en el archivo .env". |
| **Protección de rutas por rol** | Los middlewares `verificarToken` y `soloAdmin` rechazan con `401 Unauthorized` las peticiones sin token y con `403 Forbidden` los tokens inválidos o los intentos de acceder a acciones de otro rol. Los controladores verifican además que el vecino solo acceda a sus propios reclamos. |
| **Manejo de errores seguro** | Respuestas HTTP consistentes en formato JSON (`400`, `401`, `403`, `404`, `409`, `500`). Un manejador global captura el JSON malformado (400), las rutas inexistentes (404) y cualquier error no previsto (500, con el mensaje genérico "Ocurrió un error interno en el servidor"), sin filtrar trazas de la base de datos ni rutas de archivos. El login entrega el mismo mensaje si falla el correo o la contraseña. |
| **Integridad de los datos** | Operaciones multi-tabla dentro de transacciones (`BEGIN`, `COMMIT`, `ROLLBACK`) con bloqueo de fila (`FOR UPDATE`) e historial inmutable mediante un trigger. |
 
---                     |

### 13.1. Validaciones en el Registro de Usuarios (Backend)

Se implementaron validaciones de seguridad y formato en el controlador de autenticación (`src/controllers/auth.controller.js`):

- **Tipos de datos y saneamiento:** Se asegura que los campos de entrada sean de tipo texto y se limpian espacios en blanco (`trim()`) y mayúsculas en el correo (`toLowerCase()`).
- **Formato de correo:** Validación estricta con expresiones regulares y un límite máximo de 254 caracteres.
- **Largos máximos:**
  - Nombre: máximo 100 caracteres.
  - Contraseña: máximo 72 caracteres (límite técnico considerado por bcrypt).
  - Teléfono: máximo 20 caracteres (opcional).

---

## 14. Pruebas funcionales

### 14.1. Herramienta utilizada

Postman (versión de escritorio), usada para probar los endpoints de la API REST
contra el servidor local en `http://localhost:3000`.

### 14.2. Colección de pruebas
 
```
pruebas/MiSantoDomingo.postman_collection.json
```
 
La colección tiene 16 peticiones que cubren los métodos GET, POST, PUT, PATCH y DELETE, casos exitosos y casos de error:
 
| N° | Método | Endpoint | Caso probado | Resultado esperado |
| :-- | :----- | :------- | :----------- | :----------------- |
| 1 | GET | `/api/health` | Verificación del servidor | 200 OK |
| 2 | POST | `/api/auth/login` | Login del vecino | 200 OK + token JWT |
| 3 | POST | `/api/auth/login` | Login del administrador | 200 OK + token JWT |
| 4 | GET | `/api/categorias` | Listado de categorías | 200 OK (6 categorías) |
| 5 | GET | `/api/reclamos` | Listado con token del vecino | 200 OK (reclamos del vecino) |
| 6 | POST | `/api/auth/login` | Clave errónea | 401 Credenciales inválidas |
| 7 | POST | `/api/auth/login` | Sin contraseña | 400 Datos incompletos |
| 8 | GET | `/api/reclamos/folio/SD-2026-999999` | Folio inexistente | 404 No encontrado |
| 9 | PATCH | `/api/reclamos/1/estado` | Cambio de estado con token de vecino | 403 Permiso denegado |
| 10 | POST | `/api/auth/registro` | Registro de un usuario nuevo | 201 Created |
| 11 | POST | `/api/auth/registro` | Mismo correo por segunda vez | 409 Conflict |
| 12 | POST | `/api/reclamos` | Creación de un reclamo (form-data) | 201 Created + folio |
| 13 | PATCH | `/api/reclamos/1/estado` | Derivación como administrador | 200 OK |
| 14 | DELETE | `/api/reclamos/4` | Cancelación del reclamo propio | 200 OK |
| 15 | DELETE | `/api/reclamos/9999` | Reclamo inexistente | 404 No encontrado |
| 16 | PUT | `/api/reclamos/5` | Edición de un reclamo propio pendiente | 200 OK + reclamo actualizado |
 
Cómo ejecutarla:
 
1. Dejar la base lista (`00_crear_base.sql` → `schema.sql` → `01_usuarios_prueba.sql` → `02_datos_prueba.sql`) y el servidor corriendo.
2. En Postman: Import → seleccionar `pruebas/MiSantoDomingo.postman_collection.json`.
3. Ejecutar los logins (peticiones 2 y 3) y copiar cada token.
4. En las peticiones protegidas, reemplazar el marcador que está después de `Bearer ` en el header `Authorization` por el token correspondiente. Los marcadores no son todos iguales, y el de las peticiones 5, 13, 14 y 15 es el mismo texto, por lo que hay que pegar el token que indica la tabla:
   | Petición | Marcador que se reemplaza | Token que va |
   | :------- | :------------------------ | :----------- |
   | 5 | `<pega_aqui_el_token>` | Vecino |
   | 9 | `<pega_aqui_el_tokenvecino>` | Vecino |
   | 12 | `<token_vecino>` | Vecino |
   | 13 | `<pega_aqui_el_token>` | Administrador |
   | 14 y 15 | `<pega_aqui_el_token>` | Vecino |
   | 16 | `<pega_aqui_el_token vecino>` | Vecino |
5. Ejecutar las peticiones en el orden de la tabla siguiente y comparar con los resultados esperados. **La petición 12 se ejecuta dos veces**: de lo contrario, la 16 responde 404.
   | Orden | Petición | Esperado |
   | :---- | :------- | :------- |
   | 1 a 5 | Health, login vecino, login admin, categorías, listar reclamos | 200 |
   | 6 | Login con clave errónea | 401 |
   | 7 | Login sin contraseña | 400 |
   | 8 | Folio inexistente | 404 |
   | 9 | Cambio de estado sin ser administrador | 403 |
   | 10 | Registro de un usuario nuevo | 201 |
   | 11 | Registro con correo duplicado | 409 |
   | 12 | Crear reclamo (crea el id 4) | 201 |
   | 12 otra vez | Crear reclamo (crea el id 5) | 201 |
   | 13 | Derivar reclamo como administrador | 200 |
   | 14 | Cancelar reclamo propio (id 4) | 200 |
   | 15 | Cancelar reclamo inexistente | 404 |
   | 16 | Actualizar reclamo (id 5) | 200 |
Consideraciones para repetir las pruebas:
 
- La petición 11 depende de la 10: el correo `prueba@correo.cl` debe haberse registrado antes. Si se repite la petición 10, responde 409 porque el correo ya existe.

- La petición 14 cancela el reclamo con id 4, que es el que crea la petición 12 en una base recién cargada con los 3 reclamos de prueba. Por eso la 12 debe ejecutarse antes.

- **Ejecutar la petición 12 dos veces.** La petición 16 edita el reclamo con id 5, que debe existir, estar en estado `Pendiente` y pertenecer al vecino. En una base recién cargada, la primera ejecución de la 12 crea el reclamo con id 4 (el que cancela la 14) y la segunda crea el id 5 (el que edita la 16). Si se omite la segunda ejecución, la petición 16 responde 404.

- La petición 13 deriva el reclamo con id 1, que debe seguir abierto.
Por seguridad, la colección no incluye ningún token real guardado.

### 14.3. Evidencia

Capturas de Postman con los códigos HTTP obtenidos. Están en la carpeta `pruebas/capturas/`.

**1. Health check — 200 OK**

![Health check](pruebas/capturas/01-health-200.png)

**2. Login del vecino — 200 OK**

![Login del vecino](pruebas/capturas/02-login-vecino-200.png)

**3. Login del administrador — 200 OK**

![Login del administrador](pruebas/capturas/03-login-admin-200.png)

**4. Listado de categorías — 200 OK**

![Listado de categorías](pruebas/capturas/04-categorias-200.png)

**5. Listado de reclamos con token — 200 OK**

![Listado de reclamos con token](pruebas/capturas/05-reclamos-200.png)

**6. Login con clave errónea — 401 Unauthorized**

![Login con clave errónea](pruebas/capturas/06-login-clave-erronea-401.png)

**7. Login sin contraseña — 400 Bad Request**

![Login sin contraseña](pruebas/capturas/07-login-sin-password-400.png)

**8. Consulta de un folio inexistente — 404 Not Found**

![Consulta de un folio inexistente](pruebas/capturas/08-folio-inexistente-404.png)

**9. Cambio de estado sin ser administrador — 403 Forbidden**

![Cambio de estado sin ser administrador](pruebas/capturas/09-estado-sin-admin-403.png)

**10. Registro de un usuario nuevo — 201 Created**

![Registro de un usuario nuevo](pruebas/capturas/10-registro-201.png)

**11. Registro con un correo repetido — 409 Conflict**

![Registro con un correo repetido](pruebas/capturas/11-registro-duplicado-409.png)

**12. Creación de un reclamo — 201 Created**

![Creación de un reclamo](pruebas/capturas/12-crear-reclamo-201.png)

**13. Derivación de un reclamo como administrador — 200 OK**

![Derivación de un reclamo como administrador](pruebas/capturas/13-derivar-reclamo-200.png)

**14. Cancelación de un reclamo propio — 200 OK**

![Cancelación de un reclamo propio](pruebas/capturas/14-cancelar-reclamo-200.png)

**15. Cancelación de un reclamo inexistente — 404 Not Found**

![Cancelación de un reclamo inexistente](pruebas/capturas/15-cancelar-inexistente-404.png)

**16. Actualización de un reclamo (PUT) — 200 OK**
 
![Actualización de un reclamo (PUT)](pruebas/capturas/16%20ActualizarReclamo.png)

---

## 15. Integración frontend y backend

El frontend (rama `frontend`, Ionic + React + TypeScript) consume esta API desde `http://localhost:3000/api`. La URL base se define en un solo lugar (`src/services/api.ts`) y puede cambiarse con la variable `VITE_API_URL`. La API admite peticiones desde el navegador porque el servidor tiene CORS habilitado.

- **Cliente HTTP utilizado (fetch / Axios):** `fetch` nativo del navegador, encapsulado en un helper central llamado `apiFetch` (`src/services/api.ts`). No se usa Axios. Ningún componente ni servicio hace `fetch` directo: todas las peticiones pasan por `apiFetch`.
- **Autenticación real (registro e inicio de sesión):** el frontend ya no usa cuentas simuladas. `RegistroPage` llama a `authService.registrar` (`POST /api/auth/registro`), que crea la cuenta con rol `vecino` y guarda la contraseña cifrada con bcrypt en PostgreSQL. `LoginPage` llama a `AuthContext.login`, que usa `authService.login` (`POST /api/auth/login`). El nombre, el correo y el **rol** que muestra la aplicación son los que devuelve la base de datos; el rol `admin` solo se asigna directamente en la base. Si las credenciales son incorrectas, o el servidor no responde, no se inicia sesión y se muestra el mensaje de error.
- **Manejo de JWT (almacenamiento e interceptor):** al iniciar sesión se guarda el token en `localStorage["msd_token"]` y los datos del usuario en `localStorage["msd_session_user"]`. `apiFetch` actúa como interceptor: adjunta automáticamente la cabecera `Authorization: Bearer <token>` en cada petición y revisa cada respuesta de error. Si la API responde `401`, o `403` con el mensaje de token inválido o expirado, limpia ambas claves y redirige a `/login` con el aviso "Tu sesión expiró. Inicia sesión nuevamente." Esta revisión no se aplica a `/auth/login` ni `/auth/registro`, para no confundir una contraseña incorrecta con una sesión vencida, y un `403` por falta de rol (por ejemplo, un vecino que intenta una ruta de administrador) solo muestra el error sin cerrar la sesión. El tiempo de vida del token está descrito en la sección 12.3.
- **Manejo de errores y sesiones:** cuando la API responde con error, `apiFetch` lanza una excepción con el campo `mensaje` que entrega el backend (por ejemplo, "Ya existe una cuenta registrada con este correo" o "Reclamo no encontrado"), y las pantallas la muestran en un modal. Si el servidor está apagado o inalcanzable, se muestra un mensaje de conexión. Las rutas privadas del frontend (`ProtectedRoute`) redirigen a `/login` si no hay sesión o si el rol del usuario no tiene permiso. La sesión se mantiene al recargar la página, porque se restaura desde `localStorage`.
- **Autoría de los reclamos:** el frontend identifica al creador de cada reclamo con el `id_usuario` que entrega la API, no con el usuario de la sesión. La restricción real la aplica el backend: un vecino solo recibe sus propios reclamos en `GET /api/reclamos`, y solo puede calificar o cancelar los suyos.
- **Flujos principales funcionando con datos reales:** todas las operaciones de `src/services/auth.service.ts` y `src/services/report.service.ts` usan la API:
  | Operación en el frontend | Endpoint del backend |
  | :----------------------- | :------------------- |
  | Registrar una cuenta de vecino | `POST /api/auth/registro` |
  | Iniciar sesión | `POST /api/auth/login` |
  | Listar reclamos ("Mis Reclamos" y bandeja del funcionario) | `GET /api/reclamos` |
  | Consulta pública por folio | `GET /api/reclamos/folio/:folio` |
  | Ingresar un reclamo | `POST /api/reclamos` |
  | Derivar o cerrar un reclamo (funcionario) | `PATCH /api/reclamos/:id/estado` |
  | Calificar un reclamo resuelto | `POST /api/reclamos/:id/calificacion` |
  | Cancelar un reclamo propio | `DELETE /api/reclamos/:id` |
  | Editar antecedentes de un reclamo pendiente | `PUT /api/reclamos/:id` |

- **Servicios mock reemplazados (`auth.service.ts`, `report.service.ts`):** ambos servicios ya no usan datos simulados: toda su lógica pasa por la API a través de `apiFetch`. El cálculo de los 20 días del plazo legal (RF-04) se hace en el cliente a partir de la fecha de ingreso. El dashboard de indicadores se calcula en el frontend a partir del listado de reclamos que entrega `GET /api/reclamos`.

---

## 16. Gestión del proyecto y evidencia de contribuciones

* **Ramas utilizadas:** Separación estricta en ramas `frontend` (aplicación móvil y web en Ionic React) y `backend` (servidor Express, PostgreSQL y pruebas), cumpliendo con la sección 3.2 de las bases.

* **Convención de commits:** Mensajes descriptivos en español que identifican con precisión la tarea o corrección efectuada (ej: *"Inclusión de trazabilidad histórica"*, *"Validar largos máximos en registro"*).

* **Evidencia de trabajo colaborativo:** Repositorio público con desarrollo continuo y aportes distribuidos entre los 4 integrantes. Para verificar la participación de cada miembro directamente en GitHub:

| Integrante | Usuario de GitHub | Enlace directo al historial |
| :--------- | :---------------- | :-------------------------- |
| **Sebastián Garay** | `sebagarayn` | [Ver commits de Sebastián](https://github.com/sebagarayn/MiSantoDomingo/commits?author=sebagarayn) |
| **Benjamín Lazcano** | `benjaminlazcanor-hub` / `lazcanobenjamin83-arch` | [Ver commits (cuenta 1)](https://github.com/sebagarayn/MiSantoDomingo/commits?author=benjaminlazcanor-hub) y [Ver commits (cuenta 2)](https://github.com/sebagarayn/MiSantoDomingo/commits?author=lazcanobenjamin83-arch) |
| **Vicente Olguín** | `Vichonoma` | [Ver commits de Vicente](https://github.com/sebagarayn/MiSantoDomingo/commits?author=Vichonoma) |
| **Ignacio Maureira** | `IgnacioMaureira` | [Ver commits de Ignacio](https://github.com/sebagarayn/MiSantoDomingo/commits?author=IgnacioMaureira) |

> **Nota sobre Benjamín Lazcano:** Los alias `benjaminlazcanor-hub` y `lazcanobenjamin83-arch` corresponden al mismo estudiante, debido a configuraciones locales en diferentes computadores (escritorio y laptop).

## 17. Enlaces

| Recurso                            | Enlace                                                                                               |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Repositorio GitHub                 | https://github.com/sebagarayn/MiSantoDomingo                                                         |
| Prototipo Figma (Web / Escritorio) | https://www.figma.com/design/g226BWBCK7VZ2fzl9aj8at/Sin-título?node-id=0-1&t=OWk7vIgmDlFjNYgl-1      |
| Prototipo Figma (Móvil)            | https://www.figma.com/design/APracKRLzJMMzqzsLFHSXx/Sin-t%C3%ADtulo?node-id=0-1&t=x8JV6gNCCvaOFn40-1 |
| Colección Postman                  | [pruebas/MiSantoDomingo.postman_collection.json](pruebas/MiSantoDomingo.postman_collection.json)     |
| Capturas de las pruebas            | [pruebas/capturas](pruebas/capturas)                                                                 |

---

## 18. Bibliografía y uso de IA

- **Bibliografía:**
  - Biblioteca del Congreso Nacional de Chile (BCN). _Reportes Comunales: Santo Domingo_. [https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2026&idcom=5606](https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2026&idcom=5606](https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2026&idcom=5606](https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2026&idcom=5606)
  - Instituto Nacional de Estadísticas (INE). _Censo de Población y Vivienda 2017 y 2024_.
  - Ley N° 19.880, que establece las Bases de los Procedimientos Administrativos que rigen los Actos de los Órganos de la Administración del Estado (Plazo legal de respuesta de 20 días en OIRS municipal).
  - Contraloría General de la República de Chile (CGR). _Dictámenes e informes de fiscalización sobre plazos de respuesta ciudadana y trazabilidad en municipalidades_.

- **Uso de IA:**  
  En el desarrollo de este trabajo se utilizó inteligencia artificial como una herramienta de apoyo: orientación en el diseño de la arquitectura modular, optimización de consultas SQL parametrizadas y clarificación de buenas prácticas de seguridad. Todo el código fuente, diseño de base de datos y documentación técnica fue revisado, probado, adaptado e integrado directamente por los integrantes del equipo.
