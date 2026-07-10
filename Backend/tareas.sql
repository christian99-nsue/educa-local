INSERT INTO tareas (titulo, descripcion, asignatura_id, curso_id, fecha_entrega)
VALUES ('Ejercicios de integrales', 'Resolver los ejercicios del tema 5', 9, 42, '2026-10-15'),
('Estequimetria', 'Practica de calculos estequiometricos', 11, 42, '2026-09-07'),
('Ejercicios de funciones', 'Resuelve los ejercicios de funciones con los metodos aprendidos en clase', 9, 42, '2026-06-15'),
('Ejercicios de MRU', 'Resuelve los ejercicios de movimiento rectilineo uniforme', 12, 42, '2026-07-13'),
('Resumen de la vida de Antonio Machado', 'Investiga la vida de Antonio Machado', 1, 42, '2026-06-30'),
('Exposicion sobre la primera Guerra Mundial', 'Investiga la primera Guerra Mundia y prepara una presentacion sobre ello', 2, 42, '2026-07-13'),
('Mito de las Cabernas de Platon', 'Investiga la obra del mito de las cabernas de Platon', 3, 42, '2026-08-21'),
('ADN', 'Realiza un trabajo de investigacion sobre el ADN', 4, 42, '2026-07-09'),
('Teoria de la moneda de Karl Max', 'Investiga la que opina o lo que dice Karl Max sobre la moneda', 5, 42, '2026-07-15'),
('Trabajo sobre Jacob', 'Investiga y haz un resumen de la vida de Jacob', 6, 42, '2026-05-09'),
('Vervo étre', 'Conjuba el verbo étre en todos los tiempos', 7, 42, '2026-06-05'),
('Verbo Get', 'Investiga 15 Phrasal Verbs que se pueden usar con el verbo Get', 8, 42, '2026-09-09'),
('Corriente alterna', 'Completa estos ejercicios de corriente alterna', 10, 42, '2026-08-05'),
('Quimica organica', 'Investiga sobre la quimica organica y los diferentes tipos de compuestos organicos', 11, 42, '2026-07-10'),
('La Fuerza', 'Investiga sobre los diferentes tipos de fuerzas que existen', 12, 42, '2026-06-05'),
('Placas tectonicas', 'Haz un resumen sobre la teoria tectonica de placas', 13, 42, '2026-07-15');

INSERT INTO tarea_entregas (tarea_id, usuario_id, estado, fecha_entrega_real, nota)
VALUES (14, 3, 'calificada', '2026-05-04 10:00:00', 9.0),
(15, 3, 'calificada', '2026-06-01 12:34:05', 7.3),
(19, 3, 'calificada', '2026-05-30 13:40:30', 8.5);
INSERT INTO tarea_entregas (tarea_id, usuario_id, estado, fecha_entrega_real)
VALUES (7, 3, 'entregada', '2026-06-10 09:25:34');

ALTER TABLE tarea_entregas MODIFY COLUMN nota VARCHAR(10) DEFAULT NULL;

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