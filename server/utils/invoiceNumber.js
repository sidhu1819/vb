import Transaction from '../models/Transaction.js';

export const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `VBS-${year}-`;
  
  const lastTx = await Transaction.findOne({ invoice_number: new RegExp(`^${prefix}`) })
    .sort({ createdAt: -1 });

  let nextNum = 1;
  if (lastTx && lastTx.invoice_number) {
    const parts = lastTx.invoice_number.split('-');
    if (parts.length === 3) {
      nextNum = parseInt(parts[2], 10) + 1;
    }
  }

  return `${prefix}${nextNum.toString().padStart(4, '0')}`;
};
