import sharp from "sharp";
import path from "path";
import fs from "fs";
import archiver from "archiver";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const rotateImagesBatch = async (req, res) => {
  try {
    const { angle } = req.body;
    console.log("🧾 Archivos recibidos:", req.files?.images?.length || 0);
    console.log("🌀 Ángulo:", req.body.angle);
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No se han subido imágenes." });
    }

    const degrees = parseInt(angle);
    if (![90, 180, 270].includes(degrees)) {
      return res.status(400).json({ error: "Ángulo no válido." });
    }

    const zipFilename = `rotated-${Date.now()}-${uuidv4().slice(0, 8)}.zip`;
    const zipPath = path.join(__dirname, "../public/zip", zipFilename);

    if (!fs.existsSync(path.dirname(zipPath))) {
      fs.mkdirSync(path.dirname(zipPath), { recursive: true });
    }

    const archive = archiver("zip", { zlib: { level: 9 } });
    const output = fs.createWriteStream(zipPath);   
    archive.pipe(output);

    const images = req.files?.images || [];
        for (const file of images) {
        const ext = path.extname(file.originalname).toLowerCase();
        const name = path.basename(file.originalname, ext);
        const filename = `${name}_rotated${ext}`;
        const rotatedBuffer = await sharp(file.buffer)
            .rotate(degrees)
            .toFormat(ext === ".png" ? "png" : "jpeg")
            .toBuffer();
        archive.append(rotatedBuffer, { name: filename });
        }

    await archive.finalize();

    // Borrar tras 5 minutos
    setTimeout(() => {
      if (fs.existsSync(zipPath)) fs.unlink(zipPath, () => {});
    }, 5 * 60 * 1000);

    res.json({ success: true, downloadUrl: `/zip/${zipFilename}` });
  } catch (err) {
    console.error("❌ Error al girar imágenes:", err);
    res.status(500).json({ error: "Error interno al procesar imágenes." });
  }
};
