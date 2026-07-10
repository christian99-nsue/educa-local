ALTER TABLE asignaturas ADD COLUMN codigo VARCHAR(20) DEFAULT NULL;

INSERT INTO profesor_asignaturas (centro_usuario_id, curso_id, asignatura_id)
VALUES 
(10, 42, 9),
(10, 42, 11),
(10, 42, 12),
(7, 42, 10),
(7, 42, 3);

UPDATE ramas SET nombre = 'Ciencias de la Naturaleza y salud' WHERE id = 1;


INSERT INTO usuarios (id, code, nombre, apellidos, email, password)
VALUES 
(16, 'CC0912', 'Jose Antonio', 'Oyono Abang', 'jose.antonio@gmail.com', 123456),
(17, 'CC0724', 'Mardoqueo', 'Sabana Tobileri', 'mardoqueo.sabana@gmail.com', 123456),
(18, 'CC0095', 'Minerva Rosabel Ngui', 'Ondo Andeme', 'minerva.rosabel@gmail.com', 123456),
(19, 'CC0007', 'Pergentino', 'Segura Bodipo', 'pergentino.segura@gmail.com', 123456),
(20, 'CC3201', 'Maria Auxiliadora Angue', 'Ekua Esidang', 'maria.auxiliadora@gmail.com', 123456);


INSERT INTO centro_usuarios (id, user_id, centro_id, rol_en_centro, curso_id, rama_id)
VALUES (22, 16, 2, 'alumno', 42, 1),
(23, 17, 2, 'alumno', 42, 2),
(24, 18, 2, 'alumno', 42, 2),
(25, 19, 2, 'alumno', 42, 3),
(26, 20, 2, 'alumno', 42, 3);


INSERT INTO asignaturas (id, nombre, centro_id, codigo)
VALUES (14, 'Tecnologia Industrial II', 2, 'TEC-02'),
(15, 'Dibujo Tecnico', 2, 'DIB-02'),
(16, 'Matematicas Aplicadas', 2, 'MTA-02'),
(17, 'Historia del Arte', 2, 'HIA-02'),
(18, 'Latin', 2, 'LAT-02'),
(19, 'Griego', 2, 'GRI-02');

INSERT INTO curso_asignaturas (id, curso_id, asignatura_id, rama_id)
VALUES (15, 42, 14, 2),
(21, 42, 9, 2),
(16, 42, 15, 2),
(17, 42, 16, 3),
(18, 42, 17, 3),
(19, 42, 18, 3),
(20, 42, 19, 3);


ALTER TABLE profesor_asignaturas ADD COLUMN curso_asignatura_id INT NULL;

ALTER TABLE profesor_asignaturas
DROP FOREIGN KEY profesor_asignaturas_ibfk_2,
DROP FOREIGN KEY profesor_asignaturas_ibfk_3,
DROP COLUMN curso_id,
DROP COLUMN asignatura_id;

TRUNCATE TABLE profesor_asignaturas;

ALTER TABLE profesor_asignaturas
MODIFY COLUMN curso_asignatura_id INT NOT NULL,
ADD CONSTRAINT profesor_asignaturas_ibfk_ca
FOREIGN KEY (curso_asignatura_id) REFERENCES curso_asignaturas(id);

INSERT INTO profesor_asignaturas (centro_usuario_id, curso_asignatura_id)
VALUES ( 7, 3),
(7, 10),
(7, 14),
(10, 9),
(10, 11),
(10, 12),
(10, 21);

UPDATE usuarios 
SET password = '$2b$10$4bMd9SzbEX6WUmMsXVcr6.YiUyt7na53chxpK/C.pM6Z4o78S/URC'
WHERE id IN (16, 17, 18, 19, 20);