import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

app.listen(process.env.DB_PORT, () => {
  console.log(
    `🚀 Servidor corriendo en http://localhost:${process.env.DB_PORT}`,
  );
});
