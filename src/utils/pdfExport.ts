import html2pdf from 'html2pdf.js';

export const exportToPdf = () => {
  const element = document.querySelector('.pdf-content');

  if (!element) {
    console.error('Elemento .pdf-content não encontrado');
    return;
  }

  const opt = {
    margin: 10,
    filename: 'encomenda.pdf',
    html2canvas: {
      scale: 1,
      useCORS: true,
      allowTaint: false,
      logging: false
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    }
  };

  html2pdf().set(opt).from(element).save();
};
