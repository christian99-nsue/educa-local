import { db } from "../config/db";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path/win32";

dotenv.config({ path: path.resolve("../.env") });

const seed = async () => {
  try {
    console.log("🚀 Iniciando seeder...");

    // 🔥 LIMPIAR TABLAS (opcional pero recomendado en pruebas)
    await db.query("SET FOREIGN_KEY_CHECKS = 0");
    await db.query("TRUNCATE TABLE centro_usuarios");
    await db.query("TRUNCATE TABLE usuarios");
    await db.query("TRUNCATE TABLE centros");
    await db.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("🧹 Tablas limpiadas");

    // 🏫 CREAR CENTROS
    const [centros]: any = await db.query(
      "INSERT INTO centros (nombre) VALUES ?",
      [
        [
          ["Colegio Privado Buen Pastor"],
          ["Colegio Claret"],
          ["Colegio Adventista"],
        ],
      ],
    );

    console.log("🏫 Centros creados");

    // 👤 CREAR USUARIOS
    const passwordHash = await bcrypt.hash("123456", 10);

    const [usuarios]: any = await db.query(
      "INSERT INTO usuarios (email, password, nombre, apellidos, code) VALUES ?",
      [
        [
          ["admin@test.com", passwordHash, "Admin", "Uno", "A001"],
          ["profe@test.com", passwordHash, "Profesor", "Uno", "P001"],
          ["alumno@test.com", passwordHash, "Alumno", "Uno", "S001"],
          [
            "christiannsue00@gmail.com",
            passwordHash,
            "Christian",
            "Nsue",
            "C001",
          ],
        ],
      ],
    );

    console.log("👤 Usuarios creados");

    // 🔗 CREAR RELACIONES (centro_usuarios)

    await db.query(
      "INSERT INTO centro_usuarios (user_id, centro_id, rol_en_centro) VALUES ?",
      [
        [
          [1, 1, "admin"],
          [2, 1, "profesor"],
          [3, 1, "alumno"],
          [4, 1, "alumno"],
          [2, 2, "profesor"],
          [3, 2, "alumno"],
        ],
      ],
    );

    console.log("🔗 Relaciones creadas");

    console.log("✅ SEED COMPLETADO CON ÉXITO");
    process.exit();
  } catch (error) {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  }
};

seed();
