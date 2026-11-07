-- ====================================================================
-- TAREA S3: OPTIMIZACIÓN Y EVIDENCIA DE ÍNDICES (EF4)
-- ====================================================================

-- 1. Índices adicionales para filtros reales de la bandeja administrativa
CREATE INDEX IF NOT EXISTS idx_reclamos_estado ON reclamos(estado);
CREATE INDEX IF NOT EXISTS idx_reclamos_fecha ON reclamos(fecha_ingreso DESC);
CREATE INDEX IF NOT EXISTS idx_reclamos_compuesto_busqueda ON reclamos(estado, id_categoria, fecha_ingreso DESC);

-- ====================================================================
-- EVIDENCIA DE RENDIMIENTO: EXPLAIN ANALYZE
-- Ejecuta estas consultas en pgAdmin para obtener los tiempos de respuesta
-- ====================================================================

-- Consulta 1: Búsqueda filtrada con ordenamiento y paginación
EXPLAIN ANALYZE
SELECT r.id_reclamo, r.folio, r.estado, r.fecha_ingreso, c.nombre AS categoria
FROM reclamos r
JOIN categorias c ON r.id_categoria = c.id_categoria
WHERE r.estado = 'Pendiente'
ORDER BY r.fecha_ingreso DESC
LIMIT 10 OFFSET 0;