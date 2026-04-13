import PDFDocument from 'pdfkit';

export const generateInvoicePDF = (transaction, service, client, res) => {
  const doc = new PDFDocument({ margin: 50 });
  
  doc.pipe(res);

  // Header
  // Brand Color: #00c6ff (VB Blue)
  doc.fillColor('#00c6ff').fontSize(24).font('Helvetica-Bold').text('VB Software Solutions', { align: 'left' });
  doc.fillColor('#666').fontSize(8).font('Helvetica').text('Thagarapuvalasa, Vizag, Andhra Pradesh', { align: 'left' });
  doc.text('vbsoftwaresolutions.founder@gmail.com', { align: 'left' });
  doc.text('+91 83281 82328', { align: 'left' });
  
  doc.fontSize(28).fillColor('#111').font('Helvetica-Bold').text('INVOICE', 0, 50, { align: 'right' });
  doc.fontSize(10).fillColor('#666').font('Helvetica').text(`#${transaction.invoice_number}`, 0, 85, { align: 'right' });
  
  doc.moveDown(3);

  const top = doc.y;
  // Bill To
  doc.fontSize(10).fillColor('#111').font('Helvetica-Bold').text('BILL TO:', 50, top);
  doc.font('Helvetica').fillColor('#444')
    .text(client.name, 50, top + 15)
    .text(client.email, 50, top + 30)
    .text(client.company || '', 50, top + 45);
    
  // Payment Details
  doc.fontSize(10).fillColor('#111').font('Helvetica-Bold').text('PAYMENT DETAILS:', 350, top);
  doc.font('Helvetica').fillColor('#444')
    .text(`Date Valid: ${new Date(transaction.verified_at || transaction.createdAt).toLocaleDateString()}`, 350, top + 15)
    .text(`Method: Manual (UPI Verification)`, 350, top + 30)
    .text(`TX Proof: Screenshot Verified`, 350, top + 45)
    .fillColor('#22c55e').font('Helvetica-Bold').text(`Status: ${transaction.status.toUpperCase()}`, 350, top + 60);

  doc.moveDown(5);

  // Table Header
  const tableTop = doc.y;
  doc.rect(50, tableTop, 490, 25).fill('#f8fafc');
  doc.font('Helvetica-Bold').fillColor('#444').fontSize(10);
  doc.text('DESCRIPTION', 60, tableTop + 8);
  doc.text('USD', 350, tableTop + 8, { width: 90, align: 'right' });
  doc.text('INR', 450, tableTop + 8, { width: 90, align: 'right' });
  
  doc.moveTo(50, tableTop + 25).lineTo(540, tableTop + 25).strokeColor('#e2e8f0').lineWidth(1).stroke();

  // Table Row
  doc.font('Helvetica').fillColor('#333').fontSize(11);
  doc.text(`${service.title} - Milestone ${transaction.milestone}`, 60, tableTop + 40);
  doc.fillColor('#666').fontSize(9).text(`Verification processing for ${transaction.label}`, 60, tableTop + 55);
  
  doc.fontSize(11).fillColor('#111').font('Helvetica-Bold');
  doc.text(`$${transaction.amount_usd.toFixed(2)}`, 350, tableTop + 40, { width: 90, align: 'right' });
  doc.text(`Rs. ${transaction.amount_inr.toLocaleString('en-IN')}`, 450, tableTop + 40, { width: 90, align: 'right' });

  doc.moveTo(50, tableTop + 80).lineTo(540, tableTop + 80).strokeColor('#cbd5e1').stroke();

  // Summary
  const summaryTop = tableTop + 100;
  doc.fontSize(10).fillColor('#666').font('Helvetica').text('Subtotal:', 300, summaryTop, { width: 90, align: 'right' });
  doc.fillColor('#111').font('Helvetica-Bold').text(`₹${transaction.amount_inr.toLocaleString('en-IN')}`, 450, summaryTop, { width: 90, align: 'right' });

  doc.fontSize(14).fillColor('#00c6ff').text('TOTAL PAID:', 300, summaryTop + 25, { width: 90, align: 'right' });
  doc.text(`₹${transaction.amount_inr.toLocaleString('en-IN')}`, 450, summaryTop + 25, { width: 90, align: 'right' });

  // Footer Notes
  doc.moveDown(8);
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#111').text('Note From Founder:', 50, doc.y);
  doc.font('Helvetica').fontSize(9).fillColor('#666').text('Meetings available after initial contact and discussion via WhatsApp (+91 83281 82328).', 50, doc.y + 12);

  doc.moveDown(4);
  doc.font('Helvetica-Oblique').fontSize(8).fillColor('#94a3b8').text('This is a computer-generated invoice for manual UPI payments. No signature required.', 50, doc.y, { align: 'center' });

  doc.end();
};
