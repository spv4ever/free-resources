import sharp from "sharp";
import archiver from "archiver";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, "../public/zip");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

export const resizeImagesBatch = async (req, res) => {
  try {
    const { percent } = req.body;
    const scale = parseFloat(percent) / 100;

    if (!req.files || req.files.length === 0 || isNaN(scale)) {
      return res.status(400).json({ error: "Faltan imágenes o porcentaje inválido." });
    }

    const zipId = uuidv4();
    const zipName = `resized-${zipId}.zip`;
    const zipPath = path.join(outputDir, zipName);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);

    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase();
      if (![".jpg", ".jpeg", ".png"].includes(ext)) continue;

      const name = path.basename(file.originalname, ext);
      const metadata = await sharp(file.buffer).metadata();
      const resized = sharp(file.buffer).resize({
        width: Math.round(metadata.width * scale),
      });

      const buffer =
        ext === ".png"
          ? await resized.png().toBuffer()
          : await resized.jpeg({ quality: 90 }).toBuffer();

      const filename = `${name}_resized${ext}`;
      archive.append(buffer, { name: filename });
    }

    await archive.finalize();

    // eliminar ZIP a los 5 min
    setTimeout(() => {
      fs.unlink(zipPath, () => {});
    }, 5 * 60 * 1000);

    output.on("close", () => {
      res.json({
        success: true,
        downloadUrl: `/zip/${zipName}`,
        size: archive.pointer(),
      });
    });
  } catch (err) {
    console.error("Error al redimensionar:", err);
    res.status(500).json({ error: "Error al procesar imágenes." });
  }
};
