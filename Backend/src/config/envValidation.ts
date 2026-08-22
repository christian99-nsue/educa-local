/**
 * Validación de variables de entorno críticas
 * Se ejecuta al iniciar el servidor
 * Soporta estructura con sufijos: DB_HOST_LOCAL, DB_HOST_RAILWAY, etc.
 */

export const validateEnvironment = (): void => {
  const missingVars: string[] = [];

  // 1. Validar DB_TARGET
  const dbTarget = (process.env.DB_TARGET || "local").toLowerCase();
  const validTargets = ["local", "railway"];
  if (!validTargets.includes(dbTarget)) {
    console.error(
      `❌ Error: DB_TARGET debe ser "local" o "railway", recibido: "${dbTarget}"`,
    );
    process.exit(1);
  }

  // 2. Validar variables de BD según el target
  const suffix = dbTarget === "railway" ? "RAILWAY" : "LOCAL";
  const dbVars = [
    `DB_HOST_${suffix}`,
    `DB_USER_${suffix}`,
    `DB_PASSWORD_${suffix}`,
    `DB_NAME_${suffix}`,
    `DB_PORT_${suffix}`,
  ];

  dbVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value || value.trim() === "") {
      missingVars.push(varName);
    }
  });

  // 3. Validar variables requeridas globales
  const requiredGlobalVars = [
    "JWT_SECRET",
    "EMAIL_USER",
    "EMAIL_PASS",
    "SUPABASE_URL",
    "SUPABASE_SECRET_KEY",
    "FRONTEND_URL",
  ];

  requiredGlobalVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value || value.trim() === "") {
      missingVars.push(varName);
    }
  });

  // 4. Si hay variables faltantes, detener el servidor
  if (missingVars.length > 0) {
    console.error(
      "❌ Error: Faltan las siguientes variables de entorno requeridas:",
    );
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error(
      "\n📝 Por favor, configura estas variables en tu archivo .env",
    );
    process.exit(1);
  }

  // 5. Advertencias para OAuth opcionales
  const optionalVars = [
    "GOOGLE_CLIENT_ID",
    "MICROSOFT_TENANT_ID",
    "MICROSOFT_CLIENT_ID",
  ];

  const missingOptional: string[] = [];
  optionalVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value || value.trim() === "") {
      missingOptional.push(varName);
    }
  });

  if (missingOptional.length > 0) {
    console.warn(
      "⚠️  Advertencia: Las siguientes variables de OAuth no están configuradas:",
    );
    missingOptional.forEach((varName) => {
      console.warn(
        `   - ${varName} (autenticación ${varName.split("_")[0]} deshabilitada)`,
      );
    });
  }

  console.log("✅ Variables de entorno validadas correctamente");
  console.log(`📊 Usando base de datos: ${dbTarget.toUpperCase()}`);
};
