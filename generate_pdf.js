const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  const filePath = 'file:///' + path.resolve('C:/Users/yash/seo/kailash_proposal.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 30000 });

  await page.pdf({
    path: 'C:/Users/yash/seo/Kailash_Paper_Ads_Strategy_2026.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
  });

  await browser.close();
  console.log('PDF created: Kailash_Paper_Ads_Strategy_2026.pdf');
})();
