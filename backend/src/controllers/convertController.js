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

export const convertImagesBatch = async (req, res) => {
  try {
    const { format } = req.body;
    const targetFormat = format?.toLowerCase();

    if (!req.files || req.files.length === 0 || !["jpg", "jpeg", "png", "webp"].includes(targetFormat)) {
      return res.status(400).json({ error: "Faltan imágenes o formato no válido." });
    }

    const zipId = uuidv4();
    const zipName = `converted-${zipId}.zip`;
    const zipPath = path.join(outputDir, zipName);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);

    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase();
      const name = path.basename(file.originalname, ext);

      const transformer = sharp(file.buffer);
      let buffer;

      if (targetFormat === "png") {
        buffer = await transformer.png().toBuffer();
      } else if (targetFormat === "jpg" || targetFormat === "jpeg") {
        buffer = await transformer.jpeg({ quality: 90 }).toBuffer();
      } else if (targetFormat === "webp") {
        buffer = await transformer.webp({ quality: 90 }).toBuffer();
      }

      const filename = `${name}.${targetFormat}`;
      archive.append(buffer, { name: filename });
    }

    await archive.finalize();

    setTimeout(() => fs.unlink(zipPath, () => {}), 5 * 60 * 1000);

    output.on("close", () => {
      res.json({
        success: true,
        downloadUrl: `/zip/${zipName}`,
        size: archive.pointer(),
      });
    });
  } catch (err) {
    console.error("Error al convertir imágenes:", err);
    res.status(500).json({ error: "Error al procesar imágenes." });
  }
};
