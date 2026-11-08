import ExcelJS from 'exceljs';

export const generateExcel = async (data: any[], config: any = {}): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  // Simple mapping, can be complex based on config
  if (data.length > 0) {
    const columns = Object.keys(data[0]).map(key => ({ header: key, key: key }));
    worksheet.columns = columns;
    worksheet.addRows(data);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as unknown as Buffer;
};
