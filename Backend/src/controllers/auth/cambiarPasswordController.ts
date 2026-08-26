import { db } from "../../config/db";
import bcrypt from "bcrypt";

export const CambiarPassword = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { passwordActual, passwordNueva } = req.body;

  if (!passwordActual || !passwordNueva) {
    return res.status(400).json({ error: "Faltan datos requerido<" });
  }
  if (passwordNueva.length < 6) {
    return res
      .status(400)
      .json({ error: "La nueva contraseña debe tener al menos 6 caracteres" });
  }

  try {
    const [rows]: any = await db.query(
      `SELECT password FROM usuarios WHERE id = ?`,
      [usuarioId],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const coincide = await bcrypt.compare(passwordActual, rows[0].password);
    if (!coincide) {
      return res
        .status(401)
        .json({ error: "La contraseña actual es incorrecta" });
    }

    const nuevaHash = await bcrypt.hash(passwordNueva, 10);
    await db.query(`UPDATE usuarios SET password = ? WHERE id = ?`, [
      nuevaHash,
      usuarioId,
    ]);

    res.json({ mensaje: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al cambiar la contraseña" });
  }
};
