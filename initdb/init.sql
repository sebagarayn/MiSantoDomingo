-- Se ejecuta UNA sola vez, cuando el volumen de Postgres esta vacio.
-- /sql es la carpeta backend/database montada por docker-compose.
-- 00_crear_base.sql NO se incluye: POSTGRES_DB ya crea la base.
--
-- IMPORTANTE: si se agrega un script nuevo (06_..., 07_...), agregar su linea aqui, en orden.
\i /sql/schema.sql
\i /sql/01_usuarios_prueba.sql
\i /sql/02_datos_prueba.sql
\i /sql/03_optimizacion_indices.sql
\i /sql/04_agregar_coordenadas_reclamos.sql
\i /sql/05_notificaciones.sql
