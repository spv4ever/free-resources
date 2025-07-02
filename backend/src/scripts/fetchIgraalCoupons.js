import puppeteer from 'puppeteer';
import IgraalCoupon from '../models/IgraalCoupon.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');

export const fetchIgraalCoupons = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false, // 🧪 Lanzamos en modo visible para depurar
      defaultViewport: null,
    });
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36'
    );

    await page.goto('https://es.igraal.com/codigos-promocionales/', {
      waitUntil: 'domcontentloaded',
      timeout: 0,
    });
    // ⛔ Intenta cerrar el popup de cookies si está presente
    try {
    await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 5000 });
    await page.click('#onetrust-accept-btn-handler');
    console.log('✅ Popup de cookies aceptado');
    } catch (err) {
    console.log('ℹ️ No se mostró popup de cookies');
    }
    // Esperamos tarjetas visibles
    await page.waitForSelector('.widget--merchant-column', { timeout: 20000 });

    // Scroll lento
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 300;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight - window.innerHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 300);
      });
    });

    // Esperamos manualmente para asegurar carga
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Dump de HTML para depurar si hiciera falta
    const fullHtml = await page.content();
    fs.writeFileSync('debug_igraal_coupon.html', fullHtml);

    // Extraemos cupones
    const coupons = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.widget--merchant-wrap'));

      return cards.map(card => {
        const img = card.querySelector('figure img');
        const title = img?.alt?.replace('Código descuento ', '').trim() || '';
        const imageUrl = img?.src || '';

        const description = card.querySelector('.widget__description-title')?.innerText.trim() || '';
        const cashback = card.querySelector('.widget__cb-txt')?.innerText.trim() || '';
        const code = card.querySelector('.widget__cb button span')?.innerText.trim() || '';

        return {
          title,
          description,
          code,
          cashback,
          imageUrl,
          url: 'https://es.igraal.com/padrinazgo?padrino=AG_67ae2774a44af'
        };
      }).filter(c => c.title && c.code);
    });

    // console.log('🧪 Ejemplo de cupones extraídos:', coupons.slice(0, 3));

    await browser.close();

    await IgraalCoupon.deleteMany({});
    await IgraalCoupon.insertMany(coupons);

    console.log(`✅ Se han guardado ${coupons.length} cupones de iGraal.`);
  } catch (err) {
    console.error('❌ Error al obtener cupones de iGraal:', err.message);
  }
};
