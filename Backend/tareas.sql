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
