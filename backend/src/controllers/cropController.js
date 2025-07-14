import sharp from "sharp";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const cropImage = async (req, res) => {
  try {
    const file = req.file;
    const { x, y, width, height } = req.body;

    if (!file || !x || !y || !width || !height) {
      return res.status(400).json({ error: "Faltan datos para recortar." });
    }

    const left = parseInt(x);
    const top = parseInt(y);
    const w = parseInt(width);
    const h = parseInt(height);

    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const name = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    const uniqueId = Date.now() + "_" + uuidv4().slice(0, 8);
    const filename = `${name}_${uniqueId}__cropped${ext}`;
    const outputDir = path.join(__dirname, "../public/cropped");
    const filepath = path.join(outputDir, filename);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const image = sharp(file.buffer).extract({ left, top, width: w, height: h });

    const finalBuffer = ext === ".png" ? await image.png().toBuffer() : await image.jpeg().toBuffer();
    fs.writeFileSync(filepath, finalBuffer);

    // Borrar después de 5 minutos
    setTimeout(() => {
      if (fs.existsSync(filepath)) fs.unlink(filepath, () => {});
    }, 5 * 60 * 1000);

    res.json({ success: true, downloadUrl: `/cropped/${filename}` });
  } catch (err) {
    console.error("❌ Error al recortar imagen:", err);
    res.status(500).json({ error: "Error interno al recortar imagen." });
  }
};
