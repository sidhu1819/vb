import express from 'express';
import QRCode from 'qrcode';
import { authenticateJWT } from '../middleware/authenticate.js';
import { uploadProof } from '../utils/multerConfig.js';
import { generateInvoicePDF } from '../utils/invoiceGenerator.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../utils/sendEmail.js';

const router = express.Router();
router.use(authenticateJWT);

// Get current exchange rate and UPI info
router.get('/info', async (req, res) => {
  try {
    const rate = 84; // Static fallback
    res.json({ 
      usd_to_inr: rate, 
      upi_id: 'vbsoftwaresolutions.founder@gmail.com',
      merchant_name: 'M Siddhartha Reddy (VB Software Solutions)',
      cached_at: Date.now() 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment info' });
  }
});

// Generate UPI QR Code image
router.get('/upi-qr', async (req, res) => {
  try {
    const { amount, note } = req.query;
    if (!amount) return res.status(400).json({ message: 'Amount is required' });

    // UPI Deep Link Format: upi://pay?pa=ADDRESS&pn=NAME&am=AMOUNT&tn=NOTE
    const upiUrl = `upi://pay?pa=vbsoftwaresolutions.founder@gmail.com&pn=M%20Siddhartha%20Reddy&am=${amount}&tn=${encodeURIComponent(note || 'Project Payment')}&cu=INR`;
    
    const qrImage = await QRCode.toDataURL(upiUrl);
    res.json({ qrCode: qrImage, upiUrl });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate QR Code' });
  }
});

// Upload Payment Proof
router.post('/upload-proof', uploadProof.single('proof'), async (req, res) => {
  try {
    const { service_id, milestone } = req.body;
    if (!req.file) return res.status(400).json({ message: 'No proof image uploaded' });

    const service = await ServiceRequest.findOne({ _id: service_id, clientId: req.user._id });
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const mIndex = service.milestonePayments.findIndex(p => p.milestone === Number(milestone));
    if (mIndex === -1) return res.status(400).json({ message: 'Invalid milestone' });

    const payment = service.milestonePayments[mIndex];
    if (payment.status === 'approved') return res.status(400).json({ message: 'Already approved' });

    // Update milestone status to uploaded
    service.milestonePayments[mIndex].status = 'uploaded';
    service.milestonePayments[mIndex].proof_image_url = `/uploads/proofs/${req.file.filename}`;
    service.milestonePayments[mIndex].transactionId = req.body.transactionId || 'N/A';
    service.milestonePayments[mIndex].uploaded_at = new Date();
    
    await service.save();

    // Notify Admin (Simple placeholder, usually you'd use a real notification system)
    await Notification.create({
      userId: service.assignedTo || req.user._id, // Send to admin or self
      title: 'New Payment Proof',
      message: `Client ${req.user.name} uploaded proof for Milestone ${milestone} of ${service.title}.`,
      type: 'payment'
    });

    // Send confirmation email to client
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="color: #00c6ff;">Payment Proof Uploaded</h2>
        <p>Hi ${req.user.name},</p>
        <p>Your payment proof for <strong>Milestone ${milestone}</strong> has been received. Our team (M Siddhartha Reddy) will verify it shortly.</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Service:</strong> ${service.title}</p>
          <p><strong>Amount:</strong> ₹${payment.amount_inr.toLocaleString('en-IN')}</p>
          <p><strong>Status:</strong> Verification Pending</p>
        </div>
        <p>You'll get an email once it's approved and the next steps are unlocked.</p>
      </div>
    `;
    
    try {
      await sendEmail(req.user.email, `Payment Received - Verification Pending [${service.title}]`, emailHtml);
    } catch (e) {
      console.error('Email error:', e);
    }

    res.json({ 
      success: true, 
      message: 'Proof uploaded successfully. Awaiting verification.',
      status: 'uploaded'
    });

  } catch (error) {
    console.error('Upload Proof Error:', error);
    res.status(500).json({ message: 'Failed to upload proof' });
  }
});

router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find({ client_id: req.user._id })
      .populate('service_id', 'title serviceType')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/invoice/:invoice_number/pdf', async (req, res) => {
  try {
    let query = { invoice_number: req.params.invoice_number };
    
    // Only restrict to client if it's not a founder/employee
    if (req.user.role === 'client') {
      query.client_id = req.user._id;
    }
    
    const transaction = await Transaction.findOne(query).populate('client_id');
    
    if (!transaction) return res.status(404).json({ message: 'Invoice not found' });
    
    const service = await ServiceRequest.findById(transaction.service_id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${transaction.invoice_number}.pdf`);
    
    const invoiceData = {
      ...transaction.toObject(),
      client_name: transaction.client_id?.name || 'Unknown Client',
      client_email: transaction.client_id?.email || 'N/A'
    };

    generateInvoicePDF(invoiceData, service, req.user, res);
    
  } catch (error) {
    console.error('PDF Error:', error);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
});
import Payment from '../models/Payment.js';

// --- Generic Payment Endpoints requested ---

router.post('/', uploadProof.single('screenshot'), async (req, res) => {
  try {
    const { transactionId, paymentDate, amount, service_id, milestone } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Screenshot is required' });

    console.log(`[Payment API] Receiving proof from user ${req.user._id} for service ${service_id}`);

    const newPayment = await Payment.create({
      userId: req.user._id,
      transactionId,
      paymentDate: paymentDate || Date.now(),
      amount: amount || 0,
      screenshotUrl: `/uploads/proofs/${req.file.filename}`,
      status: 'pending',
      serviceId: service_id,
      milestone: milestone
    });

    res.status(201).json({ 
      success: true, 
      message: 'Payment details submitted successfully. Awaiting admin approval.', 
      payment: newPayment 
    });
  } catch (error) {
    console.error('[Payment API] Submit Error:', error);
    res.status(500).json({ message: 'Failed to submit payment proof' });
  }
});

// Admin ONLY: Get all
router.get('/', async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'founder') {
       return res.status(403).json({ message: 'Forbidden' });
    }
    const payments = await Payment.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin ONLY: Update status
router.put('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'founder') {
       return res.status(403).json({ message: 'Forbidden' });
    }
    const { status } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    
    payment.status = status;
    await payment.save();

    res.json({ success: true, message: `Payment marked as ${status}`, payment });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update payment status' });
  }
});
export default router;
