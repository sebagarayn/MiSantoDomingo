BEGIN;

-- 1. TABLA USUARIOS
CREATE TABLE usuarios (
    id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL CHECK (btrim(nombre) <> ''),
    correo VARCHAR(254) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL CHECK (btrim(password_hash) <> ''),
    telefono VARCHAR(20),
    rol VARCHAR(10) NOT NULL DEFAULT 'vecino' CHECK (rol IN ('vecino', 'admin')),
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT correo_normalizado CHECK (correo = lower(btrim(correo)) AND correo LIKE '%_@_%._%')
);

-- 2. TABLA CATEGORIAS
CREATE TABLE categorias (
    id_categoria INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE CHECK (btrim(nombre) <> '')
);

-- 3. TABLA UNIDADES MUNICIPALES
CREATE TABLE unidades (
    id_unidad INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE CHECK (btrim(nombre) <> '')
);

-- 4. TABLA RECLAMOS
CREATE TABLE reclamos (
    id_reclamo INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    folio VARCHAR(30) NOT NULL UNIQUE CHECK (btrim(folio) <> ''),
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    id_categoria INTEGER NOT NULL REFERENCES categorias(id_categoria) ON DELETE RESTRICT,
    id_unidad_asignada INTEGER NOT NULL REFERENCES unidades(id_unidad) ON DELETE RESTRICT,
    descripcion VARCHAR(500) NOT NULL CHECK (btrim(descripcion) <> ''),
    ubicacion VARCHAR(250) NOT NULL CHECK (btrim(ubicacion) <> ''),
    foto_url TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    fecha_ingreso TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    respuesta_formal TEXT,
    CONSTRAINT estado_reclamo_valido CHECK (
        estado IN ('Pendiente', 'En Revisión', 'Derivado', 'Resuelto', 'Rechazado')
    ),
    CONSTRAINT resuelto_con_respuesta CHECK (
        estado <> 'Resuelto' OR
        (respuesta_formal IS NOT NULL AND btrim(respuesta_formal) <> '')
    )
);

-- 5. TABLA HISTORIAL (Trazabilidad)
CREATE TABLE historial_reclamos (
    id_historial INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_reclamo INTEGER NOT NULL REFERENCES reclamos(id_reclamo) ON DELETE RESTRICT,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    id_unidad_destino INTEGER REFERENCES unidades(id_unidad) ON DELETE RESTRICT,
    estado VARCHAR(20) NOT NULL CHECK (
        estado IN ('Pendiente', 'En Revisión', 'Derivado', 'Resuelto', 'Rechazado')
    ),
    observacion TEXT,
    fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT derivacion_completa CHECK (
        estado <> 'Derivado' OR
        (id_unidad_destino IS NOT NULL AND observacion IS NOT NULL AND btrim(observacion) <> '')
    ),
    CONSTRAINT destino_solo_derivacion CHECK (
        estado = 'Derivado' OR id_unidad_destino IS NULL
    )
);

-- 6. TABLA CALIFICACIONES
CREATE TABLE calificaciones (
    id_calificacion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_reclamo INTEGER NOT NULL UNIQUE REFERENCES reclamos(id_reclamo) ON DELETE RESTRICT,
    puntaje SMALLINT NOT NULL CHECK (puntaje BETWEEN 1 AND 5),
    comentario TEXT,
    fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- INDICES
CREATE INDEX idx_reclamos_usuario ON reclamos(id_usuario);
CREATE INDEX idx_reclamos_categoria ON reclamos(id_categoria);
CREATE INDEX idx_reclamos_unidad ON reclamos(id_unidad_asignada);
CREATE INDEX idx_historial_reclamo_fecha ON historial_reclamos(id_reclamo, fecha, id_historial);

-- TRIGGER DE INMUTABILIDAD
CREATE FUNCTION proteger_historial() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION 'El historial no se puede modificar ni eliminar' USING ERRCODE = '23514';
END;
$$;
CREATE TRIGGER historial_inmutable
BEFORE UPDATE OR DELETE ON historial_reclamos
FOR EACH ROW EXECUTE FUNCTION proteger_historial();

-- SEMILLA INICIAL (CATÁLOGOS)
INSERT INTO categorias (nombre) VALUES
    ('Alumbrado público'),
    ('Aseo y ornato'),
    ('Calles y veredas'),
    ('Seguridad ciudadana'),
    ('Transporte y tránsito'),
    ('Otros');

INSERT INTO unidades (nombre) VALUES
    ('OIRS Central'),
    ('Obras municipales'),
    ('Salud'),
    ('Educación'),
    ('Desarrollo comunitario');

COMMIT;