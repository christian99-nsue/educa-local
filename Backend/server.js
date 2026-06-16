const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "secreto_lms";

// 🧪 USUARIO DE PRUEBA (luego irá en MySQL)
const users = [
  {
    id: 1,
    correo: "jose.nguema@test.com",
    contraseña: "Jose#78",
    rol: "Estudiante",
    nombre: "Jose Nguema",
    apellidos: "Ndong Nzang",
  },
  {
    id: 2,
    correo: "benjamin.nsue@test.com",
    contraseña: "Benja#38",
    rol: "Estudiante",
    nombre: "Benjamin Nsue",
    apellidos: "Nsue Nzang",
  },
];

// 🔐 LOGIN
app.post("/login", (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  const user = users.find((u) => u.correo === correo);

  if (!user) {
    return res.status(401).json({ message: "Correo incorrecto" });
  }

  if (user.contraseña !== contraseña) {
    return res.status(401).json({ message: "Contraseña incorrecta" });
  }

  const token = jwt.sign({ id: user.id, rol: user.rol }, SECRET, {
    expiresIn: "1h",
  });

  return res.json({
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      apellidos: user.apellidos,
      rol: user.rol,
    },
  });
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
