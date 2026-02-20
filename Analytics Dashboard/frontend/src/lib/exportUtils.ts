import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Analytics } from '@/types'

export class ExportUtils {
  static toCSV(data: any[], filename: string = 'analytics-export') {
    const csv = Papa.unparse(data)
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.href = url
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  static toExcel(data: any[], filename: string = 'analytics-export') {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    
    // Auto-size columns
    const colWidths = []
    for (let i = 0; i < Object.keys(data[0] || {}).length; i++) {
      colWidths.push({ wch: 15 })
    }
    ws['!cols'] = colWidths
    
    XLSX.utils.book_append_sheet(wb, ws, 'Analytics')
    XLSX.writeFile(wb, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  static toPDF(data: any[], columns: { header: string; dataKey: string }[], filename: string = 'analytics-export') {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
    })

    // Title
    doc.setFontSize(16)
    doc.text('Analytics Report', 14, 15)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22)

    // Table
    autoTable(doc, {
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => this.formatValue(row[col.dataKey as keyof typeof row]))),
      startY: 25,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })

    doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  private static formatValue(value: any): string {
    if (value instanceof Date) {
      return value.toLocaleDateString()
    }
    if (typeof value === 'number') {
      if (value > 1000) {
        return value.toLocaleString()
      }
      return value.toString()
    }
    return String(value || '')
  }
}