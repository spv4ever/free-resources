import { generarImagenConFlux } from '../services/generarImagenService.js';
import { consultarImagenGenerada } from '../services/resultadoImagenService.js';
import ImagenGenerada from '../models/ImagenGenerada.js';
import { getComfyUrl } from '../services/comfyService.js';
import axios from 'axios';

export const generarImagen = async (req, res) => {
  try {
    const { prompt, ratio, seed, steps} = req.body;
    const filename_prefix = req.user.nickname || 'keiko';

    const resultado = await generarImagenConFlux({
        prompt: `aidmaHyperrealism , ${prompt}`,
        ratio,
        seed,
        steps,
        filename_prefix,
        });

        await ImagenGenerada.create({
        user: req.user._id,
        prompt_id: resultado.prompt_id,
        prompt,
        });

    res.json({ prompt_id: resultado.prompt_id });
  } catch (error) {
    console.error('Error al generar imagen:', error.message);
    res.status(500).json({ error: 'No se pudo generar la imagen' });
  }
};



export const obtenerImagen = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Obteniendo imagen para prompt_id:', id);
    const resultado = await consultarImagenGenerada(id);
    await ImagenGenerada.findOneAndUpdate(
    { prompt_id: id },
    {
        filename: resultado.filename,
        url: resultado.imageUrl,
        status: 'completada',
    }
    );
    console.log('Resultado:', resultado);
    res.json(resultado);
  } catch (error) {
    console.error('Error al consultar imagen:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const obtenerImagenesDelUsuario = async (req, res) => {
  try {
    const imagenes = await ImagenGenerada.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(imagenes);
  } catch (error) {
    console.error('Error al obtener imágenes:', error.message);
    res.status(500).json({ error: 'No se pudieron obtener las imágenes del usuario' });
  }
};

export const verificarImagen = async (req, res) => {
  try {
    const { id } = req.params;
    const comfyUrl = await getComfyUrl('flux');

    const { data } = await axios.get(`${comfyUrl}/history/${id}`);
    const entry = data[id] || data;
    const nodoSalida = entry.outputs?.['30'];

    if (nodoSalida && nodoSalida.images?.length > 0) {
      const { filename } = nodoSalida.images[0];
      const imageUrl = `${comfyUrl}/view?filename=output/${filename}`;

      return res.json({ found: true, filename, imageUrl });
    }

    return res.json({ found: false });
  } catch (err) {
    console.warn(`🔍 Verificación fallida: ${err.message}`);
    return res.status(200).json({ found: false });
  }
};
