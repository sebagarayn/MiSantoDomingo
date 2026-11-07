import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { fileTypeFromFile } from "file-type";

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

// Filtro inicial por cabecera MIME
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
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: filtroImagenes,
});

// Middleware de seguridad avanzada: valida la firma binaria real (magic bytes)
export const validarMagicBytes = async (req, res, next) => {
  // Si no se adjuntó archivo, continuamos normalmente (la foto es opcional)
  if (!req.file) {
    return next();
  }

  try {
    const tipoReal = await fileTypeFromFile(req.file.path);
    const tiposValidos = ["image/jpeg", "image/png", "image/webp"];

    if (!tipoReal || !tiposValidos.includes(tipoReal.mime)) {
      // Si el contenido real no es una imagen válida, borramos el archivo falso
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        ok: false,
        mensaje:
          "El archivo enviado no corresponde a una imagen real o está dañado",
      });
    }

    next();
  } catch (error) {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({
      ok: false,
      mensaje: "Error al validar la autenticidad de la imagen",
    });
  }
};

export default upload;
