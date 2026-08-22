import app from "./app";
import dotenv from "dotenv";
import { validateEnvironment } from "./config/envValidation";

dotenv.config();

// Validar variables de entorno requeridas
validateEnvironment();

const PORT = process.env.PORT || 3000;

if (!PORT) {
  console.error("❌ Error: PORT no está definida en las variables de entorno");
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `❌ Error: El puerto ${PORT} ya está en uso. Usa otro puerto.`,
    );
  } else {
    console.error(`❌ Error del servidor: ${error.message}`);
  }
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promesa rechazada sin manejar:", promise, "Razón:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Excepción no capturada:", error);
  process.exit(1);
});
