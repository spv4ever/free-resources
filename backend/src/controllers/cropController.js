import sharp from "sharp";

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
