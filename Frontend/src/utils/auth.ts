import { getSecureUser, getSecureCentro } from "./secureStorage";

/**
 * Obtiene el usuario autenticado desde almacenamiento seguro
 */
export const getUser = () => {
  return getSecureUser();
};

/**
 * Obtiene el centro activo desde almacenamiento seguro
 */
export const getCentroActivo = () => {
  return getSecureCentro() || {};
};
