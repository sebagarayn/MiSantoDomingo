BEGIN;

-- ====================================================================
-- CASOS DE PRUEBA: RECLAMOS CIUDADANOS PARA EVALUACION EP2
-- Permite validar en vivo:
-- 1. Reclamo reciente dentro de plazo.
-- 2. Alerta roja del plazo legal de 20 dias (RF-04) con fecha antigua.
-- 3. Reclamo derivado a Obras Municipales (RF-07).
-- 4. Reclamo resuelto listo para probar la calificacion de estrellas (RF-09).
-- ====================================================================

-- Caso 1: Reclamo Pendiente Reciente (Ingresado hace 3 dias)
INSERT INTO reclamos (folio, id_usuario, id_categoria, id_unidad_asignada, descripcion, ubicacion, estado, fecha_ingreso)
VALUES (
    'SD-2026-000101',
    1,
    1, -- Alumbrado publico
    1, -- OIRS Central
    'Poste de alumbrado con luz intermitente frente a plaza central. Genera sensacion de inseguridad.',
    'Calle Los Aromos 450, Santo Domingo',
    'Pendiente',
    CURRENT_TIMESTAMP - INTERVAL '3 days'
);

INSERT INTO historial_reclamos (id_reclamo, id_usuario, estado, observacion, fecha)
VALUES (
    (SELECT id_reclamo FROM reclamos WHERE folio = 'SD-2026-000101'),
    1,
    'Pendiente',
    'Reclamo ingresado mediante plataforma ciudadana.',
    CURRENT_TIMESTAMP - INTERVAL '3 days'
);

-- Caso 2: Reclamo Vencido fuera de plazo legal (Ingresado hace 26 dias -> Vencido)
INSERT INTO reclamos (folio, id_usuario, id_categoria, id_unidad_asignada, descripcion, ubicacion, estado, fecha_ingreso)
VALUES (
    'SD-2026-000088',
    1,
    2, -- Aseo y ornato
    5, -- Desarrollo comunitario
    'Microbasural clandestino formado en quebrada cercana a avenida principal. Requiere retiro urgente.',
    'Av. Santa Maria con Las Lilas',
    'Derivado',
    CURRENT_TIMESTAMP - INTERVAL '26 days'
);

INSERT INTO historial_reclamos (id_reclamo, id_usuario, estado, observacion, fecha)
VALUES (
    (SELECT id_reclamo FROM reclamos WHERE folio = 'SD-2026-000088'),
    1,
    'Pendiente',
    'Reclamo recibido en oficina OIRS Central.',
    CURRENT_TIMESTAMP - INTERVAL '26 days'
);

INSERT INTO historial_reclamos (id_reclamo, id_usuario, id_unidad_destino, estado, observacion, fecha)
VALUES (
    (SELECT id_reclamo FROM reclamos WHERE folio = 'SD-2026-000088'),
    2, -- Admin Felipe
    5, -- Desarrollo comunitario
    'Derivado',
    'Se deriva caso a cuadrilla de aseo para coordinar retiro de escombros en terreno.',
    CURRENT_TIMESTAMP - INTERVAL '20 days'
);

-- Caso 3: Reclamo Resuelto listo para probar calificacion de 1 a 5 estrellas
INSERT INTO reclamos (folio, id_usuario, id_categoria, id_unidad_asignada, descripcion, ubicacion, estado, fecha_ingreso, respuesta_formal)
VALUES (
    'SD-2026-000042',
    1,
    3, -- Calles y veredas
    2, -- Obras municipales
    'Bache pronunciado en calzada frente a consultorio que provoca daños a vehiculos.',
    'Av. El Golf frente a Consultorio Municipal',
    'Resuelto',
    CURRENT_TIMESTAMP - INTERVAL '15 days',
    'Se ejecutaron obras de bacheo asfaltico en frio el dia 12 del presente mes por cuadrilla de emergencia municipal.'
);

INSERT INTO historial_reclamos (id_reclamo, id_usuario, estado, observacion, fecha)
VALUES (
    (SELECT id_reclamo FROM reclamos WHERE folio = 'SD-2026-000042'),
    1,
    'Pendiente',
    'Ingresado por ciudadana en portal municipal.',
    CURRENT_TIMESTAMP - INTERVAL '15 days'
);

INSERT INTO historial_reclamos (id_reclamo, id_usuario, estado, observacion, fecha)
VALUES (
    (SELECT id_reclamo FROM reclamos WHERE folio = 'SD-2026-000042'),
    2, -- Admin
    'Resuelto',
    'Trabajo concluido en terreno conforme al plan de reparacion vial.',
    CURRENT_TIMESTAMP - INTERVAL '5 days'
);

COMMIT;