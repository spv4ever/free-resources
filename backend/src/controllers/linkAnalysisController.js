import axios from 'axios';
import LinkAnalysis from '../models/LinkAnalysis.js';
import { analyzeWithAI } from '../services/analyzeWithAI.js';

export const analyzeLink = async (req, res) => {
  const { url } = req.body;
  const ip = req.ip;
  const userAgent = req.headers['user-agent'] || 'desconocido';
  const user = req.user || null;

  if (!url || !/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: 'URL inválida o no proporcionada.' });
  }

  try {
    const apiKey = process.env.GOOGLE_SAFE_BROWSING_KEY;
    const gsbUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;

    const body = {
      client: { clientId: 'free-resources', clientVersion: '1.0' },
      threatInfo: {
        threatTypes: [
          'MALWARE',
          'SOCIAL_ENGINEERING',
          'UNWANTED_SOFTWARE',
          'POTENTIALLY_HARMFUL_APPLICATION'
        ],
        platformTypes: ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries: [{ url }]
      }
    };

    const gsbResponse = await axios.post(gsbUrl, body);
    const isDangerous = gsbResponse.data && gsbResponse.data.matches;
    const resultado = isDangerous ? 'peligroso' : 'seguro';

    // Determinar nivel según el usuario
    const nivel = user?.role === 'pro' ? 3 : user ? 2 : 1;

    // Detalles básicos
    const detalles = {
      origen: 'Google Safe Browsing',
      respuesta: gsbResponse.data || {}
    };

    // Análisis técnico para free y pro
    if (user?.role === 'free' || user?.role === 'pro') {
      const domain = new URL(url).hostname;
      detalles.tecnicos = {
        ssl: url.startsWith('https') ? 'válido' : 'no seguro',
        dominio: domain,
        whois: `https://who.is/whois/${domain}`,
        reputacion: `https://urlscan.io/search/#${domain}`
      };
      console.log('🧪 Detalles técnicos generados:', detalles.tecnicos);
    }

    // Construcción del documento
    const nuevo = new LinkAnalysis({
      urlOriginal: url,
      urlFinal: url,
      nivel,
      resultado,
      detalles,
      ip,
      userAgent,
      usuarioId: user?._id || null
    });

    // Análisis con IA si es PRO
    if (user?.role === 'pro') {
      try {
        const aiResult = await analyzeWithAI(url);
        nuevo.aiAnalysis = aiResult;
      } catch (err) {
        console.warn('⚠️ Análisis IA fallido, se continúa sin IA:', err.message);
      }
    }

    await nuevo.save();

    const resumen = resultado === 'peligroso'
      ? 'Detectado como peligroso por Google Safe Browsing.'
      : 'No se detectaron amenazas en Google Safe Browsing. Este análisis es básico y no garantiza la ausencia de riesgo.';

    console.log('📤 Respuesta enviada al frontend:', {
      resultado,
      nivel,
      resumen,
      detalles,
      aiAnalysis: nuevo.aiAnalysis || null
    });

    res.json({
      resultado,
      nivel,
      resumen,
      id: nuevo._id,
      urlOriginal: nuevo.urlOriginal,
      urlFinal: nuevo.urlFinal,
      ip,
      userAgent,
      detalles,
      aiAnalysis: nuevo.aiAnalysis || null
    });

  } catch (err) {
    console.error('❌ Error al analizar con GSB:', err.message);
    res.status(500).json({ error: 'Error interno al consultar Google Safe Browsing.' });
  }
};



export const analyzeLinkWithAI = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  if (!user || (user.role !== 'pro' && user.role !== 'admin')) {
    return res.status(403).json({ error: 'Acceso restringido a usuarios PRO o ADMIN.' });
  }

  try {
    const link = await LinkAnalysis.findById(id);
    if (!link) {
      return res.status(404).json({ error: 'Análisis no encontrado.' });
    }

    // Si ya tiene análisis IA, lo evitamos (opcional)
    if (link.aiAnalysis && link.aiAnalysis.summary) {
      return res.status(409).json({ error: 'Este análisis ya contiene un resultado IA.' });
    }

    const aiResult = await analyzeWithAI(link.urlFinal || link.urlOriginal);
    link.aiAnalysis = aiResult;
    await link.save();

    res.json({
      message: 'Análisis IA completado.',
      aiAnalysis: aiResult
    });
  } catch (error) {
    console.error('❌ Error en análisis IA:', error.message);
    res.status(500).json({ error: 'Error al realizar el análisis con IA.' });
  }
};

export const getUserLinkHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { riskLevel, threatType, desde, hasta } = req.query;

    const query = { usuarioId: userId };

    if (riskLevel) query['aiAnalysis.riskLevel'] = riskLevel;
    if (threatType) query['aiAnalysis.threatType'] = threatType;
    if (desde || hasta) {
      query.fecha = {};
      if (desde) query.fecha.$gte = new Date(`${desde}T00:00:00Z`);
      if (hasta) query.fecha.$lte = new Date(`${hasta}T23:59:59Z`);
    }

    const resultados = await LinkAnalysis.find(query)
      .sort({ fecha: -1 });

    res.json(resultados);
  } catch (err) {
    console.error('❌ Error al obtener historial del usuario:', err.message);
    res.status(500).json({ error: 'Error al obtener el historial de análisis.' });
  }
};

export const deleteBulkUserLinkAnalyses = async (req, res) => {
  try {
    const userId = req.user._id;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Se requiere una lista de IDs.' });
    }

    const result = await LinkAnalysis.deleteMany({
      _id: { $in: ids },
      usuarioId: userId
    });

    res.json({ message: `${result.deletedCount} análisis eliminados.` });
  } catch (err) {
    console.error('❌ Error al borrar historial del usuario:', err.message);
    res.status(500).json({ error: 'Error al eliminar los registros.' });
  }
};

export const getOneUserLinkAnalysis = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const link = await LinkAnalysis.findOne({ _id: id, usuarioId: userId });

    if (!link) {
      return res.status(404).json({ error: 'Análisis no encontrado.' });
    }

    res.json(link);
  } catch (err) {
    console.error('❌ Error al obtener análisis por ID:', err.message);
    res.status(500).json({ error: 'Error al consultar el análisis.' });
  }
};
