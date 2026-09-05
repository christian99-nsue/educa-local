import { db } from "../config/db";
import { crearNotificacionesMasivas } from "./notificacionesUtils";

type TipoActividad =
  | "alumno_registrado"
  | "alumno_removido"
  | "profesor_registrado"
  | "asignatura_creada"
  | "tarea_publicada"
  | "asignatura_editada"
  | "profesor_asignado"
  | "profesor_removido"
  | "curso_creado"
  | "curso_editado"
  | "horario_editado"
  | "password_reset"
  | "calificaciones_registradas"
  | "anuncio_publicado";

type Categoria =
  | "Creacion"
  | "Actualizacion"
  | "Asignacion"
  | "Eliminacion"
  | "Publicacion"
  | "Registro"
  | "Seguridad";

const categoriaPorTipo: Record<TipoActividad, Categoria> = {
  alumno_registrado: "Creacion",
  alumno_removido: "Eliminacion",
  profesor_registrado: "Creacion",
  asignatura_creada: "Creacion",
  curso_creado: "Creacion",
  tarea_publicada: "Publicacion",
  anuncio_publicado: "Publicacion",
  asignatura_editada: "Actualizacion",
  curso_editado: "Actualizacion",
  horario_editado: "Actualizacion",
  profesor_asignado: "Asignacion",
  profesor_removido: "Eliminacion",
  calificaciones_registradas: "Registro",
  password_reset: "Seguridad",
};

const moduloPorTipo: Record<TipoActividad, string> = {
  alumno_registrado: "Alumnos",
  alumno_removido: "Alumnos",
  profesor_registrado: "Profesores",
  asignatura_creada: "Asignaturas",
  curso_creado: "Cursos",
  tarea_publicada: "Tareas",
  anuncio_publicado: "Anuncios",
  asignatura_editada: "Asignaturas",
  curso_editado: "Cursos",
  horario_editado: "Horarios",
  profesor_asignado: "Asignaciones",
  profesor_removido: "Asignaciones",
  calificaciones_registradas: "Calificaciones",
  password_reset: "Ajustes",
};

const enlacePorModulo: Record<string, string> = {
  Alumnos: "/admin/alumnos",
  Profesores: "/admin/profesores",
  Asignaturas: "/admin/cursos",
  Cursos: "/admin/cursos",
  Tareas: "/admin/tareas",
  Anuncios: "/admin/anuncios",
  Horarios: "/admin/horarios",
  Asignaciones: "/admin/profesores",
  Calificaciones: "/admin/reportes",
  Ajustes: "/admin/ajustes",
};

interface RegistrarActividadParams {
  centroId: number;
  usuarioId?: number | null;
  tipo: TipoActividad;
  titulo: string;
  descripcion: string;
  ip?: string | null;
}

export const registrarActividad = async ({
  centroId,
  usuarioId,
  tipo,
  titulo,
  descripcion,
  ip,
}: RegistrarActividadParams) => {
  try {
    await db.query(
      `INSERT INTO actividad_log (centro_id, usuario_id, tipo, categoria, modulo, titulo, descripcion, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        centroId,
        usuarioId || null,
        tipo,
        categoriaPorTipo[tipo],
        moduloPorTipo[tipo],
        titulo,
        descripcion,
        ip || null,
      ],
    );

    const [adminRows]: any = await db.query(
      `SELECT user_id FROM centro_usuarios WHERE centro_id = ? AND rol_en_centro = 'admin'`,
      [centroId],
    );

    if (adminRows.length > 0) {
      const modulo = moduloPorTipo[tipo];
      await crearNotificacionesMasivas(
        adminRows.map((a: any) => a.user_id),
        {
          tipo,
          titulo,
          mensaje: descripcion,
          enlace: enlacePorModulo[modulo]
            ? `${process.env.FRONTEND_URL}${enlacePorModulo[modulo]}`
            : undefined,
        },
      );
    }
  } catch (error) {
    console.log("Error al registrar actividad:", error);
  }
};

export const getIpDeRequest = (req: any): string | null => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress ?? null;
};
