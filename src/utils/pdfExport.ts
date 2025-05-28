
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
  // Get the content element to export
  const element = document.querySelector(contentSelector);
  
  if (!element) {
    console.error(`Element with selector "${contentSelector}" not found`);
    return;
  }

  // Create a clone of the element to modify for PDF export
  const clone = element.cloneNode(true) as HTMLElement;
  
  // Remove any buttons or interactive elements that shouldn't appear in PDF
  const buttonsToRemove = clone.querySelectorAll('button, .no-print');
  buttonsToRemove.forEach(button => button.remove());

  // Configure html2pdf options
  const options = {
    margin,
    filename: `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    // Generate and download PDF
    await html2pdf().set(options).from(clone).save();
    
    // Clean up the clone
    clone.remove();
    
    console.log(`PDF "${filename}.pdf" generated successfully`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
