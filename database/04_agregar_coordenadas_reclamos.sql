
-- Migración 04: Agregar coordenadas geográficas a los reclamos.
-- Permite guardar la ubicación seleccionada en el mapa.

ALTER TABLE reclamos
ADD COLUMN IF NOT EXISTS latitud DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitud DOUBLE PRECISION;

-- Validar los rangos permitidos para las coordenadas.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_reclamos_latitud'
          AND conrelid = 'reclamos'::regclass
    ) THEN
        ALTER TABLE reclamos
        ADD CONSTRAINT chk_reclamos_latitud
        CHECK (latitud BETWEEN -90 AND 90);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_reclamos_longitud'
          AND conrelid = 'reclamos'::regclass
    ) THEN
        ALTER TABLE reclamos
        ADD CONSTRAINT chk_reclamos_longitud
        CHECK (longitud BETWEEN -180 AND 180);
    END IF;
END $$;
