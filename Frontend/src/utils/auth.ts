export const getUser = () => {
  return JSON.parse(localStorage.getItem("user") || "null");
};

export const getCentroActivo = () => {
  return JSON.parse(localStorage.getItem("centroActivo") || "{}");
};
