import * as XLSX from 'xlsx';

/**
 * Clean Excel-compatible UTF-8 CSV exporter with BOM
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Header row
  csvRows.push(headers.map(header => `"${header.replace(/"/g, '""')}"`).join(','));

  // Data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      const str = String(val);
      return `"${str.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  // UTF-8 BOM (\uFEFF) ensures Excel reads Arabic/Urdu and special symbols properly
  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/\.csv$/, '')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Excel (.xlsx) exporter with SheetJS
 */
export function exportToExcel(data: Record<string, unknown>[], filename: string, sheetName: string = 'Records'): void {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, `${filename.replace(/\.xlsx$/, '')}.xlsx`);
}
