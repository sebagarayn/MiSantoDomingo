import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Aseguramos que la carpeta uploads exista en la raiz
const carpetaUploads = path.join(__dirname, "../../uploads");
if (!fs.existsSync(carpetaUploads)) {
  fs.mkdirSync(carpetaUploads, { recursive: true });
}

// Configuracion de almacenamiento: nombre unico con fecha y extension original
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, carpetaUploads);
  },
  filename: (req, file, cb) => {
    const sufijoUnico = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `reclamo-${sufijoUnico}${extension}`);
  },
});

// Filtro basico para aceptar solo imagenes (jpg, png, webp)
const filtroImagenes = (req, file, cb) => {
  const tiposPermitidos = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Solo se permiten archivos de imagen (JPEG, PNG, WebP)"),
      false,
    );
  }
};

// Limite de 5MB por fotografia
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: filtroImagenes,
});

export default upload;
