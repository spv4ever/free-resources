import axios from 'axios';

export const capturarDesdeUrl = async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: 'URL no proporcionada' });

  try {
    const apiKey = process.env.APIFLASH_KEY;

    const captura = await axios.get('https://api.apiflash.com/v1/urltoimage', {
      params: {
        access_key: apiKey,
        url,
        full_page: true,
        format: 'png',
      },
      responseType: 'arraybuffer',
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="captura.png"');
    res.send(captura.data);
  } catch (error) {
    res.status(500).json({ error: 'Error al capturar la URL', detalles: error.message });
  }
};
