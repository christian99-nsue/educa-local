/**
 * Almacenamiento seguro para datos sensibles (usuario, centro activo)
 * Encripta los datos antes de guardarlos en localStorage
 * Desencripta al recuperarlos
 */

// Nota: Para máxima seguridad, se podría usar sessionStorage en lugar de localStorage
// sessionStorage se limpia al cerrar la pestaña (más seguro ante XSS)

// Tipos para datos seguros
type SecureStorageData = Record<string, unknown>;

const SECURE_USER_KEY = "user_secure";
const SECURE_CENTRO_KEY = "centro_secure";

/**
 * Codifica datos de forma segura usando base64
 * NOTA: Base64 no es encriptación real, solo obfuscación
 * Para máxima seguridad, considera usar crypto-js o similar
 * En producción, se recomienda usar encriptación AES real
 */
const encodeData = (data: unknown): string => {
  try {
    const json = JSON.stringify(data);
    return btoa(json); // Base64 encoding
  } catch (error) {
    console.error("Error al codificar datos:", error);
    return "";
  }
};

/**
 * Decodifica datos del almacenamiento seguro
 */
const decodeData = (encoded: string): SecureStorageData | null => {
  try {
    if (!encoded) return null;
    const json = atob(encoded); // Base64 decoding
    return JSON.parse(json) as SecureStorageData;
  } catch (error) {
    console.error("Error al decodificar datos:", error);
    return null;
  }
};

/**
 * Guarda el usuario encriptado en localStorage
 */
export const setSecureUser = (user: unknown): void => {
  try {
    const encoded = encodeData(user);
    if (encoded) {
      localStorage.setItem(SECURE_USER_KEY, encoded);
    }
  } catch (error) {
    console.error("Error al guardar usuario seguro:", error);
  }
};

/**
 * Recupera el usuario desencriptado de localStorage
 */
export const getSecureUser = (): SecureStorageData | null => {
  try {
    const encoded = localStorage.getItem(SECURE_USER_KEY);
    return decodeData(encoded || "");
  } catch (error) {
    console.error("Error al recuperar usuario seguro:", error);
    return null;
  }
};

/**
 * Guarda el centro activo encriptado
 */
export const setSecureCentro = (centro: unknown): void => {
  try {
    const encoded = encodeData(centro);
    if (encoded) {
      localStorage.setItem(SECURE_CENTRO_KEY, encoded);
    }
  } catch (error) {
    console.error("Error al guardar centro seguro:", error);
  }
};

/**
 * Recupera el centro activo desencriptado
 */
export const getSecureCentro = (): SecureStorageData | null => {
  try {
    const encoded = localStorage.getItem(SECURE_CENTRO_KEY);
    return decodeData(encoded || "");
  } catch (error) {
    console.error("Error al recuperar centro seguro:", error);
    return null;
  }
};

/**
 * Limpia todos los datos sensibles del almacenamiento
 */
export const clearSecureStorage = (): void => {
  try {
    localStorage.removeItem(SECURE_USER_KEY);
    localStorage.removeItem(SECURE_CENTRO_KEY);
    localStorage.removeItem("token"); // También limpiar token
  } catch (error) {
    console.error("Error al limpiar almacenamiento seguro:", error);
  }
};

/**
 * Verifica si hay usuario almacenado
 */
export const hasSecureUser = (): boolean => {
  return !!localStorage.getItem(SECURE_USER_KEY);
};
