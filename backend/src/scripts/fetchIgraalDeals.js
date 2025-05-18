import puppeteer from 'puppeteer';
import IgraalDeal from '../models/IgraalDeal.js';

export const fetchIgraalDeals = async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36'
    );

    await page.goto('https://es.igraal.com/seleccion/', {
      waitUntil: 'domcontentloaded',
      timeout: 0
    });

    await page.waitForSelector('.widget--sdj-wrapper', { timeout: 15000 });

    const deals = await page.evaluate(() => {
      const wrappers = Array.from(document.querySelectorAll('.widget--sdj-wrapper'));
      return wrappers.map(wrapper => {
        const alt = wrapper.querySelector('.widget--sdj-big__logo img')?.getAttribute('alt')?.trim() || '';
        const imageUrl = wrapper.querySelector('.widget--sdj-big__visual-img img')?.getAttribute('src') || '';

        const cbText = wrapper.querySelector('.widget__cb')?.innerText?.trim();
        const cbBoost = wrapper.querySelector('.cashback-boost-column--value--boosted')?.innerText?.trim();
        const cashback = cbText || cbBoost || '';

        return {
          title: alt,
          cashback,
          imageUrl,
          url: 'https://es.igraal.com/padrinazgo?padrino=AG_67ae2774a44af'
        };
      }).filter(deal => deal.title && deal.imageUrl);
    });

    await browser.close();

    await IgraalDeal.deleteMany({});
    await IgraalDeal.insertMany(deals);

    console.log(`✅ Se han guardado ${deals.length} chollos de iGraal.`);
  } catch (err) {
    console.error('❌ Error al obtener chollos de iGraal:', err.message);
  }
};
