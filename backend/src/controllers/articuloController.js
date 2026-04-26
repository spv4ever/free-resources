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

const escapePdfText = (text = '') => String(text)
  .replaceAll('\\', '\\\\')
  .replaceAll('(', '\\(')
  .replaceAll(')', '\\)');

const buildSimplePdfBuffer = (lines = []) => {
  const pageWidth = 595;
  const pageHeight = 842;
  const marginX = 42;
  const marginTop = 52;
  const lineHeight = 14;
  const maxLinesPerPage = Math.floor((pageHeight - 100) / lineHeight);
  const normalizedLines = lines.length ? lines : ['Sin datos para exportar.'];
  const pages = [];

  for (let index = 0; index < normalizedLines.length; index += maxLinesPerPage) {
    pages.push(normalizedLines.slice(index, index + maxLinesPerPage));
  }

  const objects = [];
  const addObject = (content) => {
    objects.push(content);
    return objects.length;
  };

  const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const contentObjectIds = [];
  const pageObjectIds = [];

  pages.forEach((pageLines) => {
    const textOps = ['BT', '/F1 10 Tf'];
    let y = pageHeight - marginTop;
    pageLines.forEach((line) => {
      textOps.push(`1 0 0 1 ${marginX} ${Math.max(30, y)} Tm (${escapePdfText(line)}) Tj`);
      y -= lineHeight;
    });
    textOps.push('ET');

    const stream = textOps.join('\n');
    const streamObjectId = addObject(`<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`);
    contentObjectIds.push(streamObjectId);
  });

  const pagesId = addObject('<< /Type /Pages /Kids [] /Count 0 >>');

  contentObjectIds.forEach((contentObjectId) => {
    const pageObjectId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`);
    pageObjectIds.push(pageObjectId);
  });

  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`;
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, idx) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${idx + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'utf8');
};

const buildMayoristaPdfLines = (groupedByCategory = {}, sortedCategories = [], generatedAt = '') => {
  const lines = [
    'Tarifa mayorista',
    `Generado el ${generatedAt}`,
    'Incluye solo artículos con precio coste mayorista',
    '',
  ];

  if (!sortedCategories.length) {
    lines.push('No hay artículos con precio coste mayorista.');
    return lines;
  }

  sortedCategories.forEach((category) => {
    lines.push(`=== ${category} ===`);
    lines.push('Código | Descripción | Precio coste mayorista');
    groupedByCategory[category].forEach((articulo) => {
      const code = `#${articulo.codigo ?? '—'}`;
      const description = (articulo.descripcionCorta || articulo.descripcionLarga || '—').replaceAll(/\s+/g, ' ').trim();
      const compactDescription = description.length > 70 ? `${description.slice(0, 67)}...` : description;
      lines.push(`${code} | ${compactDescription} | ${formatPrice(articulo.precioCosteMayorista)}`);
    });
    lines.push('');
  });

  return lines;
};

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

    let pdfBuffer;
    try {
      browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', right: '16px', bottom: '20px', left: '16px' } });
    } catch (renderError) {
      console.warn('No se pudo generar el PDF con Chromium, usando fallback simple:', renderError.message);
      const lines = buildMayoristaPdfLines(groupedByCategory, sortedCategories, generatedAt);
      pdfBuffer = buildSimplePdfBuffer(lines);
    }

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
