import sharp from "sharp";
import archiver from "archiver";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, "../public/zip");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

function generateTextSVG({
  text,
  fontFamily = "Arial",
  fontSize = 24,
  fontWeight = "normal",
  fontStyle = "normal",
  textDecoration = "none",
  fillColor = "#ffffff",
}) {
  const width = 600;
  const height = 120;

  return Buffer.from(`
    <svg width="${width}" height="${height}">
      <style>
        .text {
          fill: ${fillColor};
          font-family: ${fontFamily};
          font-size: ${fontSize}px;
          font-weight: ${fontWeight};
          font-style: ${fontStyle};
          text-decoration: ${textDecoration};
        }
      </style>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" class="text">${text}</text>
    </svg>
  `);
}

function getPositionCoords(position, imageWidth, imageHeight, overlayWidth, overlayHeight) {
  const margin = 10;
  switch (position) {
    case "top-left":
      return { left: margin, top: margin };
    case "top-right":
      return { left: imageWidth - overlayWidth - margin, top: margin };
    case "bottom-left":
      return { left: margin, top: imageHeight - overlayHeight - margin };
    case "bottom-right":
      return { left: imageWidth - overlayWidth - margin, top: imageHeight - overlayHeight - margin };
    case "center":
    default:
      return {
        left: Math.round((imageWidth - overlayWidth) / 2),
        top: Math.round((imageHeight - overlayHeight) / 2),
      };
  }
}

export const watermarkImagesBatch = async (req, res) => {
  try {
    const { watermarkText, position = "bottom-right" } = req.body;
    const watermarkFile = req.files?.find(f => f.fieldname === "watermarkImage");
    const imageFiles = req.files?.filter(f => f.fieldname === "images");

    if (!imageFiles || imageFiles.length === 0) {
      return res.status(400).json({ error: "No se recibieron imágenes para procesar." });
    }

    if (!watermarkText && !watermarkFile) {
      return res.status(400).json({ error: "Debes proporcionar texto o imagen de marca de agua." });
    }

    const zipId = uuidv4();
    const zipName = `watermarked-${zipId}.zip`;
    const zipPath = path.join(outputDir, zipName);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);

    for (const file of imageFiles) {
      const ext = path.extname(file.originalname).toLowerCase();
      const name = path.basename(file.originalname, ext);
      const original = sharp(file.buffer);
      const metadata = await original.metadata();

      let watermarkBuffer;

      if (watermarkText) {
        watermarkBuffer = generateTextSVG({
            text: watermarkText,
            fontFamily: req.body.fontFamily,
            fontSize: req.body.fontSize,
            fontWeight: req.body.fontWeight,
            fontStyle: req.body.fontStyle,
            textDecoration: req.body.textDecoration,
            fillColor: req.body.fillColor,
            });
      } else if (watermarkFile) {
        watermarkBuffer = watermarkFile.buffer;
      }

      let finalWatermarkBuffer = watermarkBuffer;

        if (!watermarkText) {
        const overlayMeta = await sharp(watermarkBuffer).metadata();
        const maxOverlayWidth = metadata.width * 0.3;

        if (overlayMeta.width > maxOverlayWidth) {
            const scale = maxOverlayWidth / overlayMeta.width;
            finalWatermarkBuffer = await sharp(watermarkBuffer)
            .resize({
                width: Math.round(overlayMeta.width * scale),
                height: Math.round(overlayMeta.height * scale),
            })
            .toBuffer();
        }
        }

        const resizedMeta = await sharp(finalWatermarkBuffer).metadata();
        const { left, top } = getPositionCoords(
        position,
        metadata.width,
        metadata.height,
        resizedMeta.width,
        resizedMeta.height
        );

        const composited = await original
        .composite([{ input: finalWatermarkBuffer, left, top }])
        .toFormat(ext === ".png" ? "png" : "jpeg")
        .toBuffer();

      archive.append(composited, { name: `${name}_watermarked${ext}` });
    }

    await archive.finalize();

    // Eliminación automática en 5 min
    setTimeout(() => fs.unlink(zipPath, () => {}), 5 * 60 * 1000);

    output.on("close", () => {
      res.json({
        success: true,
        downloadUrl: `/zip/${zipName}`,
        size: archive.pointer(),
      });
    });
  } catch (err) {
    console.error("Error al aplicar marca de agua:", err);
    res.status(500).json({ error: "Error al procesar imágenes." });
  }
};
