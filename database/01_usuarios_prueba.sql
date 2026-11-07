BEGIN;

-- Usuarios de demostración (clave de ambos: 123456)
INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES
('Maria Gonzalez', 'vecino@correo.cl', '$2a$10$8RmYxg1Ln252LM29A77pjOX5q8aO5bibBwE8fdSMw/W.Uv4cNKz2.', 'vecino'),
('Felipe Perez',   'admin@correo.cl',  '$2a$10$8RmYxg1Ln252LM29A77pjOX5q8aO5bibBwE8fdSMw/W.Uv4cNKz2.', 'admin')
ON CONFLICT (correo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    password_hash = EXCLUDED.password_hash,
    rol = EXCLUDED.rol;

COMMIT;