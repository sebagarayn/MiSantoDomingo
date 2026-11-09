-- ============================================================
-- 05_notificaciones.sql  (EF1: notificaciones al vecino)
-- Ejecutar sobre misantodomingo_db, DESPUES de schema.sql.
-- ============================================================

CREATE TABLE IF NOT EXISTS notificaciones (
    id_notificacion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    id_reclamo INTEGER NOT NULL REFERENCES reclamos(id_reclamo) ON DELETE RESTRICT,
    tipo VARCHAR(30) NOT NULL DEFAULT 'cambio_estado'
        CHECK (tipo IN ('cambio_estado')),
    mensaje VARCHAR(300) NOT NULL CHECK (btrim(mensaje) <> ''),
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Cubre la consulta principal: "mis notificaciones, no leidas primero, mas nuevas arriba"
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario
    ON notificaciones(id_usuario, leida, creado_en DESC);