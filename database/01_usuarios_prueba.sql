BEGIN;

-- Usuarios de demostracion (clave de ambos: 123456)
-- Se insertan en este orden para que queden con id 1 (vecino) y id 2 (admin),
-- que es lo que asume 02_datos_prueba.sql
INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES
('María González', 'vecino@correo.cl', '$2a$10$8RmYxg1Ln252LM29A77pjOX5q8aO5bibBwE8fdSMw/W.Uv4cNKz2.', 'vecino'),
('Felipe Pérez',   'admin@correo.cl',  '$2a$10$8RmYxg1Ln252LM29A77pjOX5q8aO5bibBwE8fdSMw/W.Uv4cNKz2.', 'admin');

COMMIT;