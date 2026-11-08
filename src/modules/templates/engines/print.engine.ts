import Handlebars from './handlebars.helper';
// We might need a separate service for PDF generation using puppeteer
import { generatePdf } from './pdf.generator';
import { Template } from '../templates.schema';

export const renderPrintTemplate = async (template: Template, data: any): Promise<string> => {
  const compiled = Handlebars.compile(template.content);
  return compiled(data);
};

export const generatePrintPdf = async (template: Template, data: any): Promise<Buffer> => {
  const html = await renderPrintTemplate(template, data);
  return generatePdf(html, template.metadata);
};
