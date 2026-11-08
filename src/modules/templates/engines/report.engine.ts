import { generateExcel } from './excel.generator';
import { Template } from '../templates.schema';

export const generateReportExcel = async (template: Template, data: any): Promise<Buffer> => {
  // In a real scenario, template.content might define the mapping/layout
  return generateExcel(data, template.config);
};
