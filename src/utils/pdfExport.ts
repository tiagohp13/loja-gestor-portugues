import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPdf = () => {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(16);
  doc.text('Detalhes da Encomenda', 14, 20);

  // Dados do cliente e da encomenda (podes alterar os valores fixos aqui)
  doc.setFontSize(12);
  doc.text('Cliente: Alexandra Gomes', 14, 30);
  doc.text('Data: 26/05/2025', 14, 36);
  doc.text('Número: ENC-2025/014', 14, 42);
  doc.text('Estado: Pendente', 14, 48);

  // Tabela de produtos encomendados
  autoTable(doc, {
    startY: 58,
    head: [['Produto', 'Quantidade', 'Preço Unitário', 'Total']],
    body: [
      ['Camarão Red Cherry', '15', '0,90 €', '13,50 €'],
      ['Caracóis', '15', '0,10 €', '1,50 €']
    ]
  });

  // Total final
  doc.text('Total da Encomenda: 15,00 €', 14, doc.lastAutoTable.finalY + 10);

  // Guardar PDF
  doc.save('encomenda.pdf');
};
