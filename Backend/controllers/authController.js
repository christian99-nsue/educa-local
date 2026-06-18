import { db } from "../config/db.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email.toLowerCase();

    // 1. Buscar usuario
    const [users] = await db.query("SELECT * FROM usuarios WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "Usuario no existe" });
    }

    const user = users[0];

    // 2. Comparar password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Password incorrecto" });
    }

    // 3. Buscar centros del usuario
    const [centers] = await db.query(
      `SELECT 
        c.id,
        c.nombre,
        cu.rol_en_centro
       FROM centro_usuarios cu
       JOIN centros c ON c.id = cu.centro_id
       WHERE cu.user_id = ?`,
      [user.id],
    );

    // 4. Respuesta SIN TOKEN aún
    res.json({
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
      },
      centers,
    });
  } catch (error) {
    res.status(500).json({ message: "Error en login" });
  }
};

export const selectCenter = async (req, res) => {
  try {
    const { center_id } = req.body;
    const user_id = req.user.id;

    const [rows] = await db.query(
      `SELECT rol_en_centro 
       FROM centro_usuarios
       WHERE user_id = ? AND centro_id = ?`,
      [user_id, center_id],
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: "No pertenece a este centro" });
    }

    const rol = rows[0].rol_en_centro;

    const token = generateToken({
      id: user_id,
      center_id,
      rol,
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error al seleccionar centro" });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { access_token } = req.body;

    const googleUser = await getGoogleUser(access_token);

    const email = googleUser.email.toLowerCase();

    // Buscar usuario en DB
    const [users] = await db.query("SELECT * FROM usuarios WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(403).json({ message: "Usuario no registrado" });
    }

    const user = users[0];

    // Buscar centros
    const [centers] = await db.query(
      `SELECT c.id, c.nombre, cu.rol_en_centro
       FROM centro_usuarios cu
       JOIN centros c ON c.id = cu.centro_id
       WHERE cu.user_id = ?`,
      [user.id],
    );

    res.json({
      user,
      centers,
    });
  } catch (error) {
    res.status(500).json({ message: "Error Google login" });
  }
};
