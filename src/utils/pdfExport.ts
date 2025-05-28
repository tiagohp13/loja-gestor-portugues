import html2pdf from 'html2pdf.js';

interface PdfExportOptions {
  filename: string;
  contentSelector?: string;
  margin?: number;
}

export const exportToPdf = async ({
  filename,
  contentSelector = '.pdf-content',
  margin = 10,
}: PdfExportOptions): Promise<void> => {
  const element = document.querySelector(contentSelector);
  
  if (!element) {
    console.error(`Element with selector "${contentSelector}" not found`);
    return;
  }

  const clone = element.cloneNode(true) as HTMLElement;

  const buttonsToRemove = clone.querySelectorAll('button, .no-print');
  buttonsToRemove.forEach(button => button.remove());

  const options = {
    margin,
    filename: `${filename}.pdf`,
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    // 👇 REMOVIDO: image: { type: 'jpeg', quality: 0.98 }
  };

  try {
    await html2pdf().set(options).from(clone).save();
    clone.remove();
    console.log(`PDF "${filename}.pdf" generated successfully`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
