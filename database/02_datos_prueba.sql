BEGIN;

-- ====================================================================
-- CASOS DE PRUEBA: RECLAMOS CIUDADANOS PARA EVALUACION FINAL
-- 100% re-ejecutable y SIN IDs fijos
-- ====================================================================

-- Limpieza preventiva de datos de prueba si ya fueron ejecutados
DELETE FROM calificaciones WHERE id_reclamo IN (SELECT id_reclamo FROM reclamos WHERE folio IN ('SD-2026-000101', 'SD-2026-000088', 'SD-2026-000042'));
DELETE FROM historial_reclamos WHERE id_reclamo IN (SELECT id_reclamo FROM reclamos WHERE folio IN ('SD-2026-000101', 'SD-2026-000088', 'SD-2026-000042'));
DELETE FROM reclamos WHERE folio IN ('SD-2026-000101', 'SD-2026-000088', 'SD-2026-000042');

-- Caso 1: Reclamo Pendiente Reciente (Ingresado hace 3 dias)
INSERT INTO reclamos (folio, id_usuario, id_categoria, id_unidad_asignada, descripcion, ubicacion, estado, fecha_ingreso)
VALUES (
    'SD-2026-000101',
    (SELECT id_usuario FROM usuarios WHERE correo = 'vecino@correo.cl'),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Alumbrado público'),
    (SELECT id_unidad FROM unidades WHERE nombre = 'OIRS Central'),
    'Poste de alumbrado con luz intermitente frente a plaza central. Genera sensacion de inseguridad.',
    'Calle Los Aromos 450, Santo Domingo',
    'Pendiente',
    CURRENT_TIMESTAMP - INTERVAL '3 days'
);

INSERT INTO historial_reclamos (id_reclamo, id_usuario, estado, observacion, fecha)
VALUES (
    (SELECT id_reclamo FROM reclamos WHERE folio = 'SD-2026-000101'),
    (SELECT id_usuario FROM usuarios WHERE correo = 'vecino@correo.cl'),
    'Pendiente',
    'Reclamo ingresado mediante plataforma ciudadana.',
    CURRENT_TIMESTAMP - INTERVAL '3 days'
);

-- Caso 2: Reclamo Vencido fuera de plazo legal (Ingresado hace 26 dias -> Vencido)
INSERT INTO reclamos (folio, id_usuario, id_categoria, id_unidad_asignada, descripcion, ubicacion, estado, fecha_ingreso)
VALUES (
    'SD-2026-000088',
    (SELECT id_usuario FROM usuarios WHERE correo = 'vecino@correo.cl'),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Aseo y ornato'),
    (SELECT id_unidad FROM unidades WHERE nombre = 'Desarrollo comunitario'),
    'Microbasural clandestino formado en quebrada cercana a avenida principal. Requiere retiro urgente.',
    'Av. Santa Maria con Las Lilas',
    'Derivado',
    CURRENT_TIMESTAMP - INTERVAL '26 days'
);

INSERT INTO historial_reclamos (id_reclamo, id_usuario, estado, observacion, fecha)
VALUES (
    (SELECT id_reclamo FROM reclamos WHERE folio = 'SD-2026-000088'),
    (SELECT id_usuario FROM usuarios WHERE correo = 'vecino@correo.cl'),
    'Pendiente',
    'Reclamo recibido en oficina OIRS Central.',
    CURRENT_TIMESTAMP - INTERVAL '26 days'
);

INSERT INTO historial_reclamos (id_reclamo, id_usuario, id_unidad_destino, estado, observacion, fecha)
VALUES (
    (SELECT id_reclamo FROM reclamos WHERE folio = 'SD-2026-000088'),
    (SELECT id_usuario FROM usuarios WHERE correo = 'admin@correo.cl'),
    (SELECT id_unidad FROM unidades WHERE nombre = 'Desarrollo comunitario'),
    'Derivado',
    'Se deriva caso a cuadrilla de aseo para coordinar retiro de escombros en terreno.',
    CURRENT_TIMESTAMP - INTERVAL '20 days'
);

-- Caso 3: Reclamo Resuelto listo para probar calificacion de 1 a 5 estrellas
INSERT INTO reclamos (folio, id_usuario, id_categoria, id_unidad_asignada, descripcion, ubicacion, estado, fecha_ingreso, respuesta_formal)
VALUES (
    'SD-2026-000042',
    (SELECT id_usuario FROM usuarios WHERE correo = 'vecino@correo.cl'),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Calles y veredas'),
    (SELECT id_unidad FROM unidades WHERE nombre = 'Obras municipales'),
    'Bache pronunciado en calzada frente a consultorio que provoca daños a vehiculos.',
    'Av. El Golf frente a Consultorio Municipal',
    'Resuelto',
    CURRENT_TIMESTAMP - INTERVAL '15 days',
    'Se ejecutaron obras de bacheo asfaltico en frio el dia 12 del presente mes por cuadrilla de emergencia municipal.'
);

INSERT INTO historial_reclamos (id_reclamo, id_usuario, estado, observacion, fecha)
VALUES (
    (SELECT id_reclamo FROM reclamos WHERE folio = 'SD-2026-000042'),
    (SELECT id_usuario FROM usuarios WHERE correo = 'vecino@correo.cl'),
    'Pendiente',
    'Ingresado por ciudadana en portal municipal.',
    CURRENT_TIMESTAMP - INTERVAL '15 days'
);

INSERT INTO historial_reclamos (id_reclamo, id_usuario, estado, observacion, fecha)
VALUES (
    (SELECT id_reclamo FROM reclamos WHERE folio = 'SD-2026-000042'),
    (SELECT id_usuario FROM usuarios WHERE correo = 'admin@correo.cl'),
    'Resuelto',
    'Trabajo concluido en terreno conforme al plan de reparacion vial.',
    CURRENT_TIMESTAMP - INTERVAL '5 days'
);

COMMIT;