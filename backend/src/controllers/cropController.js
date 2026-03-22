import sharp from "sharp";

export const cropImage = async (req, res) => {
  try {
    const file = req.file;
    const { x, y, width, height } = req.body;

    if (!file || [x, y, width, height].some((value) => value === undefined)) {
      return res.status(400).json({ error: "Faltan datos para recortar." });
    }

    const left = Number.parseInt(x, 10);
    const top = Number.parseInt(y, 10);
    const w = Number.parseInt(width, 10);
    const h = Number.parseInt(height, 10);

    if ([left, top, w, h].some(Number.isNaN) || w <= 0 || h <= 0) {
      return res.status(400).json({ error: "Coordenadas de recorte inválidas." });
    }

    const ext = file.mimetype === "image/png" ? "png" : "jpeg";

    const buffer = await sharp(file.buffer)
      .extract({ left, top, width: w, height: h })
      .toFormat(ext)
      .toBuffer();

    res.set("Content-Type", `image/${ext}`);
    res.set("Cache-Control", "no-store");
    res.send(buffer);
  } catch (err) {
    console.error("❌ Error al recortar imagen:", err);
    res.status(500).json({ error: "Error interno al recortar imagen." });
  }
};
