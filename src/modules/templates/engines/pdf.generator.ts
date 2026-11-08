import puppeteer from 'puppeteer';

export const generatePdf = async (html: string, options: any = {}): Promise<Buffer> => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html);
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
    ...options
  });
  
  await browser.close();
  return Buffer.from(pdfBuffer);
};
