import { Injectable, inject } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private platform = inject(Platform);

  constructor() { }

  /**
   * Genera un PDF desde contenido HTML
   * @param htmlContent Contenido HTML para convertir a PDF
   * @param fileName Nombre del archivo PDF
   * @returns Promise con el resultado
   */
  async generatePdfFromHtml(htmlContent: string, fileName: string): Promise<any> {
    try {
      if (this.platform.is('capacitor')) {
        // Para plataformas móviles, usar jsPDF como alternativa
        return this.generateWithJsPDF(htmlContent, fileName);
      } else {
        // Para web, usar window.print() o download
        return this.generateForWeb(htmlContent, fileName);
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw error;
    }
  }

  /**
   * Genera PDF usando jsPDF (para móviles)
   */
  private async generateWithJsPDF(htmlContent: string, fileName: string): Promise<any> {
    // Implementación con jsPDF si se instala
    // npm install jspdf html2canvas
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = await import('html2canvas');
      
      const pdf = new jsPDF();
      
      // Crear elemento temporal
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas.default(tempDiv);
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Limpiar elemento temporal
      document.body.removeChild(tempDiv);

      return {
        success: true,
        data: pdf.output('blob'),
        fileName: fileName
      };
    } catch (error) {
      console.error('Error con jsPDF:', error);
      return this.generateForWeb(htmlContent, fileName);
    }
  }

  /**
   * Genera PDF para web usando window.print()
   */
  private generateForWeb(htmlContent: string, fileName: string): Promise<any> {
    return new Promise((resolve) => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${fileName}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                @media print {
                  body { margin: 0; }
                }
              </style>
            </head>
            <body>
              ${htmlContent}
            </body>
          </html>
        `);
        printWindow.document.close();
        
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          resolve({
            success: true,
            message: 'PDF generado para impresión'
          });
        }, 500);
      } else {
        resolve({
          success: false,
          message: 'No se pudo abrir ventana de impresión'
        });
      }
    });
  }

  /**
   * Abre un PDF desde una URL
   * @param url URL del PDF
   */
  async openPdf(url: string): Promise<void> {
    try {
      if (this.platform.is('capacitor')) {
        // Para móviles, abrir en navegador externo
        const { Browser } = await import('@capacitor/browser');
        await Browser.open({ url });
      } else {
        // Para web, abrir en nueva pestaña
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error abriendo PDF:', error);
      // Fallback: abrir en nueva pestaña
      window.open(url, '_blank');
    }
  }

  /**
   * Descargar PDF desde blob
   * @param blob Blob del PDF
   * @param fileName Nombre del archivo
   */
  downloadPdfBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
