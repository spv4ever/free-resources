import Articulo from '../models/Articulo.js';
import puppeteer from 'puppeteer';

const normalizePayload = (payload = {}) => ({
  ...payload,
  precioCoste: Number(payload.precioCoste),
  precioCosteMayorista: Number(payload.precioCosteMayorista),
  pvp: Number(payload.pvp),
  pvpMayorista: Number(payload.pvpMayorista),
  costeProtectora: Number(payload.costeProtectora),
  pvpProtectora: Number(payload.pvpProtectora),
  descripcionCorta: (payload.descripcionCorta || '').trim(),
  descripcionLarga: (payload.descripcionLarga || '').trim(),
});

export const getArticulosAdmin = async (req, res) => {
  try {
    const articulos = await Articulo.find().sort({ codigo: -1, createdAt: -1 });
    res.json(articulos);
  } catch (error) {
    res.status(500).json({ message: 'Error al cargar los artículos', error: error.message });
  }
};

export const createArticulo = async (req, res) => {
  try {
    const articulo = new Articulo(normalizePayload(req.body));
    const saved = await articulo.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el artículo', error: error.message });
  }
};

export const updateArticulo = async (req, res) => {
  try {
    const articulo = await Articulo.findById(req.params.id);
    if (!articulo) return res.status(404).json({ message: 'Artículo no encontrado' });

    Object.assign(articulo, normalizePayload(req.body));
    const saved = await articulo.save();
    res.json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el artículo', error: error.message });
  }
};

export const deleteArticulo = async (req, res) => {
  try {
    const articulo = await Articulo.findByIdAndDelete(req.params.id);
    if (!articulo) return res.status(404).json({ message: 'Artículo no encontrado' });
    res.json({ message: 'Artículo eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el artículo', error: error.message });
  }
};

const formatPrice = (value) => `${Number(value || 0).toFixed(2)} €`;
const escapeHtml = (text = '') => String(text)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export const downloadMayoristaPriceListPdf = async (req, res) => {
  let browser;
  try {
    const articulos = await Articulo.find({ precioCosteMayorista: { $gt: 0 } })
      .sort({ categoria: 1, codigo: 1, createdAt: -1 })
      .lean();

    const groupedByCategory = articulos.reduce((acc, articulo) => {
      const category = (articulo.categoria || 'Sin categoría').trim() || 'Sin categoría';
      if (!acc[category]) acc[category] = [];
      acc[category].push(articulo);
      return acc;
    }, {});

    const sortedCategories = Object.keys(groupedByCategory)
      .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

    const generatedAt = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });
    const sectionsHtml = sortedCategories.length
      ? sortedCategories.map((category) => `
          <section class="category">
            <h2>${escapeHtml(category)}</h2>
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Precio coste mayorista</th>
                </tr>
              </thead>
              <tbody>
                ${groupedByCategory[category].map((articulo) => `
                  <tr>
                    <td>#${escapeHtml(articulo.codigo)}</td>
                    <td>${escapeHtml(articulo.descripcionCorta || articulo.descripcionLarga || '—')}</td>
                    <td>${formatPrice(articulo.precioCosteMayorista)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </section>
        `).join('')
      : '<p>No hay artículos con precio coste mayorista.</p>';

    const html = `
      <!doctype html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #1e293b; margin: 24px; font-size: 12px; }
          h1 { margin: 0 0 6px; font-size: 22px; }
          .meta { margin-bottom: 16px; color: #475569; font-size: 11px; }
          h2 { font-size: 16px; margin: 18px 0 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
          thead { background: #f1f5f9; }
          .category { break-inside: avoid; }
        </style>
      </head>
      <body>
        <h1>Tarifa mayorista</h1>
        <p class="meta">Generado el ${escapeHtml(generatedAt)} · Incluye solo artículos con precio coste mayorista</p>
        ${sectionsHtml}
      </body>
      </html>
    `;

    const launchOptions = {
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };

    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', right: '16px', bottom: '20px', left: '16px' } });

    const today = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="tarifa-mayorista-${today}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error al generar PDF mayorista:', error);
    res.status(500).json({ message: 'No se pudo generar el PDF de tarifa mayorista', error: error.message });
  } finally {
    if (browser) await browser.close();
  }
};
