import sharp from "sharp";
import path from "path";

export const pixelateImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No se recibió imagen." });

    const zonas = JSON.parse(req.body.zonas || "[]");
    const blurAmount = parseInt(req.body.blur || "10");
    if (!Array.isArray(zonas) || zonas.length === 0) {
      return res.status(400).json({ error: "No se recibieron zonas válidas." });
    }

    const ext = path.extname(file.originalname).toLowerCase() === ".png" ? "png" : "jpeg";
    const inputBuffer = Buffer.from(file.buffer);
    const metadata = await sharp(inputBuffer).metadata();

    // ✅ Acumulador de capas
    const composites = [];

    for (const zona of zonas) {
      const x = Math.max(0, parseInt(zona.x));
      const y = Math.max(0, parseInt(zona.y));
      const w = Math.max(1, parseInt(zona.width));
      const h = Math.max(1, parseInt(zona.height));
      const shape = zona.shape || "cuadrado";

      if (x + w > metadata.width || y + h > metadata.height) continue;

      // Extrae la zona y aplica blur
      const zonaRecortada = await sharp(inputBuffer)
        .extract({ left: x, top: y, width: w, height: h })
        .blur(blurAmount)
        .toBuffer();

      // Crea máscara SVG según forma
      let maskSVG = `
        <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="${w}" height="${h}" fill="white" />
        </svg>
      `;

      if (shape === "redondo") {
        const r = Math.min(w, h) / 2;
        maskSVG = `
          <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${w / 2}" cy="${h / 2}" r="${r}" fill="white" />
          </svg>
        `;
      } else if (shape === "redondeado") {
        maskSVG = `
          <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="${w}" height="${h}" rx="20" ry="20" fill="white" />
          </svg>
        `;
      }

      const mask = await sharp(Buffer.from(maskSVG)).toBuffer();

      const zonaMasked = await sharp(zonaRecortada)
        .composite([{ input: mask, blend: "dest-in" }])
        .png()
        .toBuffer();

      // ✅ Añadir al array de composiciones
      composites.push({ input: zonaMasked, top: y, left: x });
    }

    // ✅ Aplicar todas las zonas en una sola imagen
    const finalBuffer = await sharp(inputBuffer)
      .ensureAlpha()
      .composite(composites)
      [ext === "png" ? "png" : "jpeg"]()
      .toBuffer();

    res.set("Content-Type", `image/${ext}`);
    res.set("Cache-Control", "no-store");
    return res.send(finalBuffer);
  } catch (err) {
    console.error("❌ Error al aplicar pixelado:", err);
    res.status(500).json({ error: err.message || "Error interno al procesar imagen." });
  }
};
