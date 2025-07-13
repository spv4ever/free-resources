import sharp from "sharp";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const pixelateImage = async (req, res) => {
  try {
    const file = req.file;
    const { x, y, width, height } = req.body;

    if (!file || !x || !y || !width || !height) {
      return res.status(400).json({ error: "Faltan datos requeridos." });
    }

    const left = parseInt(x);
    const top = parseInt(y);
    const w = parseInt(width);
    const h = parseInt(height);

    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const name = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    const uniqueId = Date.now() + "_" + uuidv4().slice(0, 8);
    const filename = `${name}_${uniqueId}__pixelated${ext}`;
    const outputDir = path.join(__dirname, "../public/pixelated");
    const filepath = path.join(outputDir, filename);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const inputBuffer = Buffer.from(file.buffer);

    console.log(`🟢 Extrayendo zona: x=${left}, y=${top}, w=${w}, h=${h}`);

    // Generar región pixelada como PNG visible (bloque uniforme)
    // Crea una imagen transparente con borde (marco) visible
    // Genera una capa gris semitransparente como SVG
    const overlaySVG = Buffer.from(`
        <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
            <rect 
            x="0" 
            y="0" 
            width="${w}" 
            height="${h}" 
            fill="rgba(0,0,0,0.95)" />
        </svg>
        `);
        const overlayBuffer = await sharp(overlaySVG).png().toBuffer();

    let image = sharp(inputBuffer)
        .ensureAlpha()
        .composite([{ input: overlayBuffer, left, top }]);

    // Mantener formato original
    if (ext === ".png") {
      image = image.png();
    } else {
      image = image.jpeg();
    }

    const finalBuffer = await image.toBuffer();
    fs.writeFileSync(filepath, finalBuffer);
    console.log(`💾 Guardado en: ${filepath}`);

    // Eliminar después de 5 minutos
    setTimeout(() => {
      if (fs.existsSync(filepath)) fs.unlink(filepath, () => {});
    }, 5 * 60 * 1000);

    res.json({ success: true, downloadUrl: `/pixelated/${filename}` });
  } catch (err) {
    console.error("❌ Error al aplicar pixelado:", err);
    res.status(500).json({ error: "Error interno al procesar imagen." });
  }
};
