-- Permite guardar las notificaciones generadas por las acciones administrativas.
ALTER TABLE notificaciones
  MODIFY COLUMN tipo ENUM(
    'tarea_publicada',
    'tarea_calificada',
    'material_publicado',
    'tarea_entregada',
    'alumno_registrado',
    'alumno_removido',
    'profesor_registrado',
    'asignatura_creada',
    'asignatura_editada',
    'profesor_asignado',
    'profesor_removido',
    'curso_creado',
    'curso_editado',
    'horario_editado',
    'password_reset',
    'calificaciones_registradas',
    'anuncio_publicado'
  ) NOT NULL;