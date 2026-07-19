import {
  faFolder,
  faFilePdf,
  faFileWord,
  faFilePowerpoint,
  faFileExcel,
  faFileImage,
  faFileVideo,
  faFile,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

export const getMaterialIcono = (
  extension: string,
): { icon: IconDefinition; bg: string; color: string } => {
  switch (extension) {
    case "pdf":
      return { icon: faFilePdf, bg: "#fee2e2", color: "#dc2626" };
    case "docx":
      return { icon: faFileWord, bg: "#dbeafe", color: "#2563eb" };
    case "pptx":
      return { icon: faFilePowerpoint, bg: "#ffedd5", color: "#ea580c" };
    case "xlsx":
      return { icon: faFileExcel, bg: "#dcfce7", color: "#16a34a" };
    case "jpg":
    case "jpeg":
    case "png":
      return { icon: faFileImage, bg: "#fef3c7", color: "#d97706" };
    case "mp4":
      return { icon: faFileVideo, bg: "#f3e8ff", color: "#9333ea" };
    default:
      return { icon: faFile, bg: "#f3f4f6", color: "#6b7280" };
  }
};

export const getCarpetaIcono = (): {
  icon: IconDefinition;
  bg: string;
  color: string;
} => ({
  icon: faFolder,
  bg: "#dbeafe",
  color: "#2563eb",
});

export const formatearTamano = (bytes: number | null) => {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${Math.round(bytes / 1024)} KB`;
  return `${mb.toFixed(1)} MB`;
};
