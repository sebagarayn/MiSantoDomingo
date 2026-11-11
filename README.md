# MiSantoDomingo con Docker

Con esto levantas todo el sistema (base de datos + API + aplicación) con un solo comando.

## Antes de empezar

Necesitas tener instalado:

1. **Docker Desktop**, y **abierto** (abajo a la izquierda debe decir "Engine running").
2. **Git**.
3. **Visual Studio Code** (o cualquier terminal). En VS Code abre una carpeta vacía y una terminal con `Ctrl + ñ`.

## Pasos

Hazlos en una **carpeta vacía**, desde la terminal (PowerShell):

```
git clone -b docker-v1 https://github.com/sebagarayn/MiSantoDomingo.git .
git clone -b backend https://github.com/sebagarayn/MiSantoDomingo.git backend
git clone -b frontend https://github.com/sebagarayn/MiSantoDomingo.git frontend
copy .env.example .env
```

Abre el archivo `.env` y cambia estos tres valores (los demás déjalos igual):

- `PGPASSWORD`: la clave que quieras para la base de datos.
- `JWT_SECRET`: un texto largo cualquiera (mínimo 32 caracteres).
- `NOMINATIM_CONTACT`: tu correo.

Luego levanta todo:

```
docker compose up --build
```

La primera vez demora varios minutos. Cuando termine verás un cartel que dice **LISTO**.

## Usar la aplicación

Abre **http://localhost:8080**

- Administrador: `admin@correo.cl` / `123456`
- Vecino: `vecino@correo.cl` / `123456`

(`localhost:3000` es solo la API: ahí no hay página.)

## Apagar

En la terminal: `Ctrl + C`, y después:

```
docker compose down
```

## Si algo falla

**"The container name ... is already in use" (el contenedor ya existe)**
Es porque ya tenías contenedores creados de una prueba anterior. Bórralos y vuelve a levantar:

```
docker rm -f msd_db msd_backend msd_frontend msd_aviso
docker compose up --build
```

**"ports are not available" (puerto 5432 ocupado)**
Tu PC ya usa ese puerto. Agrega esta línea al final de tu `.env` y vuelve a ejecutar `docker compose up --build`:

```
DB_PORT=5433
```

**"Docker Desktop ... virtualization" o "cannot connect to the Docker daemon"**
Abre Docker Desktop y espera a que diga "Engine running". Si pide virtualización, actívala en la BIOS (SVM Mode en AMD, Intel VT-x en Intel).

**Quiero empezar de cero (borra los datos de la base)**

```
docker compose down -v
docker compose up --build
```
