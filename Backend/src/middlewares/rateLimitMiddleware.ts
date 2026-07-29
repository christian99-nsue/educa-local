import rateLimit from "express-rate-limit";

// Limite general para toda la API (protege contra abuso general)
export const limiteGeneral = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // 300 peticiones por IP cada 15 min
  message: { error: "Demasiadas peticiones, intenta de nuevo mas tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite estricto para login (protege contra fuerza bruta)
export const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por IP cada 15 min
  message: {
    error:
      "Demasiados intentos de inicio de sesion. Intenta de nuevo en 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // solo cuenta los intentos fallidos
});

// Limite para registro (evita creacion masiva de cuentas)
export const limiteRegistro = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 registros por IP cada hora
  message: {
    error: "Demasiados intentos de registro. Intenta de nuevo mas tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite para subida de archivos (protege ancho de banda y Supabase)
export const limiteSubidaArchivos = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 20, // 20 subidas por IP cada 10 min
  message: {
    error: "Demasiadas subidas de archivos. Intenta de nuevo mas tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
