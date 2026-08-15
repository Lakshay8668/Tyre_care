import React from 'react';
import { Printer, Download, X, FileText, CheckCircle2 } from 'lucide-react';
import { SalesInvoice, BusinessSettings } from '../types.js';
import { formatCurrency, formatDate, numberToWordsInINR } from '../utils/formatters.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoicePrintModalProps {
  invoice: SalesInvoice | null;
  settings: BusinessSettings;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ invoice, settings, onClose }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Business Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.business_name, 14, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(settings.address + ', ' + settings.state + ' - ' + settings.pin_code, 14, 24);
    doc.text(`GSTIN: ${settings.gstin} | Phone: ${settings.phone} | Email: ${settings.email}`, 14, 29);

    doc.setLineWidth(0.5);
    doc.line(14, 33, 196, 33);

    // Tax Invoice Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE', 14, 40);

    // Invoice Meta
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: ${invoice.invoice_number}`, 140, 40);
    doc.text(`Invoice Date: ${formatDate(invoice.invoice_date)}`, 140, 45);
    doc.text(`Payment Mode: ${invoice.payment_mode.toUpperCase()}`, 140, 50);

    // Billed To
    doc.setFont('helvetica', 'bold');
    doc.text('Billed To / Customer Details:', 14, 48);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${invoice.customer_name}`, 14, 53);
    doc.text(`Mobile: ${invoice.customer_mobile}`, 14, 58);
    doc.text(`Address: ${invoice.customer_address || 'N/A'}`, 14, 63);
    if (invoice.customer_gstin) {
      doc.text(`GSTIN: ${invoice.customer_gstin}`, 14, 68);
    }

    // Items Table
    const tableData = invoice.items.map((item, index) => [
      index + 1,
      `${item.tyre_name} (${item.size})`,
      item.quantity,
      `Rs. ${item.selling_price}`,
      `Rs. ${item.discount}`,
      `Rs. ${item.taxable_amount.toFixed(2)}`,
      `${item.gst_rate}%`,
      `Rs. ${item.total_amount.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: invoice.customer_gstin ? 72 : 68,
      head: [['#', 'Tyre Description & Size', 'Qty', 'Rate', 'Disc', 'Taxable', 'GST %', 'Total Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 60 },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 20, halign: 'right' },
        4: { cellWidth: 18, halign: 'right' },
        5: { cellWidth: 22, halign: 'right' },
        6: { cellWidth: 15, halign: 'center' },
        7: { cellWidth: 25, halign: 'right' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 8;

    // Summary Box
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal: Rs. ${invoice.subtotal.toFixed(2)}`, 140, finalY);
    doc.text(`Discount: Rs. ${invoice.discount.toFixed(2)}`, 140, finalY + 5);
    doc.text(`Taxable Amount: Rs. ${invoice.taxable_amount.toFixed(2)}`, 140, finalY + 10);

    if (invoice.is_interstate) {
      doc.text(`IGST: Rs. ${invoice.igst.toFixed(2)}`, 140, finalY + 15);
    } else {
      doc.text(`CGST: Rs. ${invoice.cgst.toFixed(2)}`, 140, finalY + 15);
      doc.text(`SGST: Rs. ${invoice.sgst.toFixed(2)}`, 140, finalY + 20);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Grand Total: Rs. ${invoice.grand_total.toFixed(2)}`, 140, finalY + 28);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(`Amount in Words: ${numberToWordsInINR(invoice.grand_total)}`, 14, finalY + 15);

    // Terms & Footer
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Terms & Conditions:', 14, finalY + 35);
    doc.setFont('helvetica', 'normal');
    doc.text(settings.terms_and_conditions, 14, finalY + 40);

    doc.text('Authorised Signatory', 140, finalY + 45);

    doc.save(`${invoice.invoice_number}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 my-8 print:p-0 print:border-none print:shadow-none print:bg-white text-slate-100 print:text-black">
        
        {/* Actions Bar (Hidden on print) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">GST Tax Invoice View</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase">
              {invoice.payment_status}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print Invoice</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="invoice-document" className="bg-slate-950/60 p-6 rounded-xl border border-slate-800 space-y-6 text-xs print:bg-white print:text-black print:p-0 print:border-none">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-800 print:border-black pb-4">
            <div>
              <h1 className="text-xl font-extrabold text-amber-400 print:text-black">{settings.business_name}</h1>
              <p className="text-slate-400 print:text-slate-700 text-[11px] mt-1">{settings.address}, {settings.state} - {settings.pin_code}</p>
              <p className="text-slate-400 print:text-slate-700 text-[11px]">GSTIN: <span className="font-mono font-bold text-white print:text-black">{settings.gstin}</span> | Phone: {settings.phone}</p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-extrabold rounded text-xs tracking-wider uppercase border border-amber-500/30 print:border-black print:text-black">
                TAX INVOICE
              </span>
              <div className="font-mono font-bold text-amber-400 print:text-black text-sm mt-2">{invoice.invoice_number}</div>
              <div className="text-slate-400 print:text-slate-700 text-[11px]">Date: {formatDate(invoice.invoice_date)}</div>
              <div className="text-slate-400 print:text-slate-700 text-[11px]">Mode: <span className="uppercase font-semibold">{invoice.payment_mode}</span></div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-4 bg-slate-900/80 print:bg-slate-100 p-3 rounded-lg border border-slate-800 print:border-slate-300">
            <div>
              <div className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-bold">Billed Customer</div>
              <div className="font-bold text-white print:text-black text-sm mt-0.5">{invoice.customer_name}</div>
              <div className="text-slate-300 print:text-slate-700">Phone: {invoice.customer_mobile}</div>
              <div className="text-slate-400 print:text-slate-600">{invoice.customer_address || 'Walk-in Retail Customer'}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-bold">GSTIN & Type</div>
              <div className="font-mono font-semibold text-slate-200 print:text-black">{invoice.customer_gstin || 'Unregistered Retail'}</div>
              <div className="text-slate-400 print:text-slate-600 capitalize">Category: {invoice.customer_type}</div>
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-800 print:border-black rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 print:bg-slate-200 text-slate-300 print:text-black uppercase text-[10px] font-semibold border-b border-slate-800 print:border-black">
                <tr>
                  <th className="px-3 py-2">S.No</th>
                  <th className="px-3 py-2">Tyre Item & Size</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-right">Rate</th>
                  <th className="px-3 py-2 text-right">Discount</th>
                  <th className="px-3 py-2 text-right">Taxable</th>
                  <th className="px-3 py-2 text-center">GST %</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                {invoice.items.map((item, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 font-mono text-slate-400">{i + 1}</td>
                    <td className="px-3 py-2 font-semibold text-white print:text-black">
                      {item.tyre_name} <span className="font-mono text-amber-400 print:text-black">({item.size})</span>
                    </td>
                    <td className="px-3 py-2 text-center font-mono font-bold">{item.quantity}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatCurrency(item.selling_price)}</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-400">{formatCurrency(item.discount)}</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-300">{formatCurrency(item.taxable_amount)}</td>
                    <td className="px-3 py-2 text-center font-mono">{item.gst_rate}%</td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-emerald-400 print:text-black">{formatCurrency(item.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Breakdown & Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="space-y-3 flex-1">
              <div className="p-3 bg-slate-900 print:bg-slate-100 rounded-lg border border-slate-800 print:border-slate-300">
                <div className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 mb-0.5">Amount in Words</div>
                <div className="font-semibold text-amber-300 print:text-black italic">{numberToWordsInINR(invoice.grand_total)}</div>
              </div>

              <div className="text-[10px] text-slate-400 print:text-slate-700 space-y-1">
                <div className="font-bold uppercase text-slate-300 print:text-black">Terms & Conditions:</div>
                <p className="whitespace-pre-line leading-relaxed">{settings.terms_and_conditions}</p>
              </div>
            </div>

            <div className="w-full sm:w-64 bg-slate-900 print:bg-slate-100 p-4 rounded-xl border border-slate-800 print:border-slate-300 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400"><span>Subtotal:</span><span>{formatCurrency(invoice.subtotal)}</span></div>
              <div className="flex justify-between text-slate-400"><span>Discount:</span><span>-{formatCurrency(invoice.discount)}</span></div>
              <div className="flex justify-between text-slate-300"><span>Taxable Amount:</span><span>{formatCurrency(invoice.taxable_amount)}</span></div>
              
              {!invoice.is_interstate ? (
                <>
                  <div className="flex justify-between text-slate-400 text-[11px]"><span>CGST:</span><span>{formatCurrency(invoice.cgst)}</span></div>
                  <div className="flex justify-between text-slate-400 text-[11px]"><span>SGST:</span><span>{formatCurrency(invoice.sgst)}</span></div>
                </>
              ) : (
                <div className="flex justify-between text-slate-400 text-[11px]"><span>IGST:</span><span>{formatCurrency(invoice.igst)}</span></div>
              )}

              <div className="border-t border-slate-800 print:border-black pt-2 flex justify-between text-sm font-extrabold text-emerald-400 print:text-black">
                <span>Grand Total:</span>
                <span>{formatCurrency(invoice.grand_total)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]"><span>Amount Paid:</span><span>{formatCurrency(invoice.amount_paid)}</span></div>
              <div className="flex justify-between text-amber-400 text-[11px] font-bold"><span>Balance Due:</span><span>{formatCurrency(invoice.balance_due)}</span></div>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-500 pt-4 border-t border-slate-800 print:border-black">
            {settings.invoice_footer}
          </div>

        </div>
      </div>
    </div>
  );
};
