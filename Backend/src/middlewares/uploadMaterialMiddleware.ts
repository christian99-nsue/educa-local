import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: any, cb: any) => {
  const tiposPermitidos = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "video/mp4",
  ];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato de archivo no permitido"));
  }
};

export const uploadMaterial = multer({ storage, fileFilter });
