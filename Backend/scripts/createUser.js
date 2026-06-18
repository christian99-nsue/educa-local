import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

async function createUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const hashedPassword = await bcrypt.hash("123456", 10);

  await connection.execute(
    "INSERT INTO usuarios (id, code, nombre, apellidos, email, password, telefono) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      "1",
      "CODE1",
      "Christian",
      "Nsue",
      "christiannsue00@gmail.com",
      hashedPassword,
      "222783320",
    ],
  );

  console.log("Usuario creado");
  await connection.end();
}

createUser();
