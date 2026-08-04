import { db } from "../config/db";

type TipoActividad =
  | "alumno_registrado"
  | "profesor_registrado"
  | "asignatura_creada"
  | "tarea_publicada";

export const registrarActividad = async (
  centroId: number,
  tipo: TipoActividad,
  titulo: string,
  descripcion: string,
) => {
  try {
    await db.query(
      `INSERT INTO actividad_log (centro_id, tipo, titulo, descripcion) VALUES (?, ?, ?, ?)`,
      [centroId, tipo, titulo, descripcion],
    );
  } catch (error) {
    console.log("Error al registrar actividad:", error);
  }
};
