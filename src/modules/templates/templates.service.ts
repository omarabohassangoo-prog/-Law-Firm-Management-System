import { Template } from './templates.schema';
import { renderPrintTemplate, generatePrintPdf } from './engines/print.engine';
import { generateReportExcel } from './engines/report.engine';

export const TemplateService = {
  async renderTemplate(template: Template, data: any) {
    switch (template.type) {
      case 'print':
        return await renderPrintTemplate(template, data);
      case 'notification':
        // Implement notification rendering
        return ""; 
      default:
        throw new Error('Unsupported template type');
    }
  },
  
  async exportTemplate(template: Template, data: any, format: 'pdf' | 'excel' = 'pdf') {
    if (template.type === 'print' && format === 'pdf') {
      return await generatePrintPdf(template, data);
    }
    if (template.type === 'report' && format === 'excel') {
      return await generateReportExcel(template, data);
    }
    throw new Error('Unsupported export');
  }
};
