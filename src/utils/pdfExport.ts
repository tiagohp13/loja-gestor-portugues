
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, StockExit, ClientWithAddress } from '@/types';
import { formatCurrency } from '@/utils/formatting';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface PdfExportOptions {
  filename: string;
  order?: Order;
  stockExit?: StockExit;
  client?: ClientWithAddress;
  totalValue?: number;
}

export const exportToPdf = async ({
  filename,
  order,
  stockExit,
  client,
  totalValue = 0,
}: PdfExportOptions): Promise<void> => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let currentY = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const title = order ? `Encomenda: ${order.number}` : `Saída de Stock: ${stockExit?.number}`;
    doc.text(title, pageWidth / 2, currentY, { align: 'center' });
    currentY += 20;

    // Document Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Informações do Documento', 20, currentY);
    currentY += 10;

    doc.setFont('helvetica', 'normal');
    const documentData = order || stockExit;
    if (documentData) {
      doc.text(`Data: ${format(new Date(documentData.date), "dd 'de' MMMM 'de' yyyy", { locale: pt })}`, 20, currentY);
      currentY += 7;
      
      if (documentData.notes) {
        doc.text(`Observações: ${documentData.notes}`, 20, currentY);
        currentY += 7;
      }
      
      if (stockExit?.invoiceNumber) {
        doc.text(`Número da Fatura: ${stockExit.invoiceNumber}`, 20, currentY);
        currentY += 7;
      }
    }
    currentY += 10;

    // Client Information
    if (client) {
      doc.setFont('helvetica', 'bold');
      doc.text('Informações do Cliente', 20, currentY);
      currentY += 10;

      doc.setFont('helvetica', 'normal');
      doc.text(`Nome: ${client.name}`, 20, currentY);
      currentY += 7;
      doc.text(`Email: ${client.email}`, 20, currentY);
      currentY += 7;
      doc.text(`Telefone: ${client.phone}`, 20, currentY);
      currentY += 7;
      if (client.taxId) {
        doc.text(`NIF: ${client.taxId}`, 20, currentY);
        currentY += 7;
      }
      if (client.address?.street) {
        doc.text(`Morada: ${client.address.street}`, 20, currentY);
        currentY += 7;
        if (client.address.postalCode && client.address.city) {
          doc.text(`${client.address.postalCode} ${client.address.city}`, 20, currentY);
          currentY += 7;
        }
      }
      currentY += 10;
    }

    // Products Table
    const items = order?.items || stockExit?.items || [];
    if (items.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Produtos', 20, currentY);
      currentY += 10;

      const tableData = items.map(item => [
        item.productName,
        item.quantity.toString(),
        formatCurrency(item.salePrice),
        formatCurrency(item.quantity * item.salePrice)
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Produto', 'Quantidade', 'Preço', 'Subtotal']],
        body: tableData,
        foot: [['', '', 'Total:', formatCurrency(totalValue)]],
        theme: 'striped',
        headStyles: {
          fillColor: [249, 250, 251],
          textColor: [107, 114, 128],
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9
        },
        footStyles: {
          fillColor: [249, 250, 251],
          fontStyle: 'bold',
          fontSize: 10
        },
        columnStyles: {
          1: { halign: 'center' },
          2: { halign: 'right' },
          3: { halign: 'right' }
        }
      });
    }

    // Save the PDF
    doc.save(`${filename}.pdf`);
    console.log(`PDF "${filename}.pdf" gerado com sucesso`);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};
