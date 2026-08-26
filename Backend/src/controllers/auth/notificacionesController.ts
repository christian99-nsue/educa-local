import { db } from "../../config/db";

export const ObtenerNotificaciones = async (req: any, res: any) => {
  const usuarioId = req.user.id;

  try {
    const [rows]: any = await db.query(
      `SELECT id, tipo, titulo, mensaje, enlace, leida, created_at
       FROM notificaciones
       WHERE usuario_id = ?
       ORDER BY created_at DESC
       LIMIT 30`,
      [usuarioId],
    );

    const [noLeidasRows]: any = await db.query(
      `SELECT COUNT(*) AS total FROM notificaciones WHERE usuario_id = ? AND leida = 0`,
      [usuarioId],
    );

    res.json({
      notificaciones: rows.map((n: any) => ({
        id: n.id,
        tipo: n.tipo,
        titulo: n.titulo,
        mensaje: n.mensaje,
        enlace: n.enlace,
        leida: !!n.leida,
        createdAt: n.created_at,
      })),
      totalNoLeidas: noLeidasRows[0].total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener las notificaciones" });
  }
};

export const MarcarComoLeida = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { notificacionId } = req.params;

  try {
    await db.query(
      `UPDATE notificaciones SET leida = 1 WHERE id = ? AND usuario_id = ?`,
      [notificacionId, usuarioId],
    );
    res.json({ mensaje: "Notificacion marcada como leida" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar la notificacion" });
  }
};

export const MarcarTodasComoLeidas = async (req: any, res: any) => {
  const usuarioId = req.user.id;

  try {
    await db.query(`UPDATE notificaciones SET leida = 1 WHERE usuario_id = ?`, [
      usuarioId,
    ]);
    res.json({ mensaje: "Todas las notificaciones marcadas como leidas" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar las notificaciones" });
  }
};
