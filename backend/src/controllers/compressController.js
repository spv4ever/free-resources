import sharp from "sharp";
import archiver from "archiver";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Paths compatibles con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, "../public/zip");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

export const compressImagesBatch = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No se recibieron imágenes." });
    }

    const zipId = uuidv4();
    const zipName = `compressed-${zipId}.zip`;
    const zipPath = path.join(outputDir, zipName);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);

    for (const file of req.files) {
        const ext = path.extname(file.originalname).toLowerCase();
        const name = path.basename(file.originalname, ext);
        const finalExt = ".jpg";
        const filename = `${name}_compressed${finalExt}`;

        const buffer = await sharp(file.buffer).jpeg({ quality: 75 }).toBuffer(); // <- aquí estaba el fallo

        archive.append(buffer, { name: filename });
        }

    await archive.finalize();
    // Después de await archive.finalize()
    setTimeout(() => {
    fs.unlink(zipPath, (err) => {
        if (!err) {
        console.log("ZIP eliminado automáticamente:", zipPath);
        }
    });
    }, 5 * 60 * 1000); // 5 minutos

    output.on("close", () => {
      res.json({
        success: true,
        downloadUrl: `/zip/${zipName}`,
        size: archive.pointer(),
      });
    });
  } catch (error) {
    console.error("Error al comprimir imágenes:", error);
    res.status(500).json({ error: "Error al procesar las imágenes." });
  }
};
