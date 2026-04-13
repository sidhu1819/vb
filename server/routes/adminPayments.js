import express from 'express';
import { authenticateJWT } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import { generateInvoicePDF } from '../utils/invoiceGenerator.js';
import { generateInvoiceNumber } from '../utils/invoiceNumber.js';
import { sendEmail } from '../utils/sendEmail.js';

const router = express.Router();
router.use(authenticateJWT);
router.use(requireRole(['founder', 'employee']));

// Get all transactions (audited history)
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('client_id', 'name company email')
      .populate('service_id', 'title serviceType')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending verifications queue
router.get('/pending', async (req, res) => {
  try {
    // Find services where at least one milestone is 'uploaded'
    const services = await ServiceRequest.find({
      'milestonePayments.status': 'uploaded'
    }).populate('clientId', 'name email company');
    
    // Extract the specific uploaded payments
    const pendingRequests = [];
    services.forEach(s => {
      if (s.milestonePayments) {
        s.milestonePayments.forEach(p => {
          if (p.status === 'uploaded') {
            pendingRequests.push({
              service_id: s._id,
              service_title: s.title,
              client_name: s.clientId?.name || 'Unknown Client',
              client_email: s.clientId?.email || 'N/A',
              milestone: p.milestone,
              label: p.label,
              amount_inr: p.amount_inr,
              amount_usd: p.amount_usd,
              proof_image_url: p.proof_image_url,
              transactionId: p.transactionId,
              uploaded_at: p.uploaded_at
            });
          }
        });
      }
    });

    res.json(pendingRequests);
  } catch (error) {
    console.error('Pending Fetch Error:', error);
    res.status(500).json({ message: 'Error fetching pending payments' });
  }
});

// Approve Payment Proof
router.post('/approve', async (req, res) => {
  try {
    const { service_id, milestone, notes } = req.body;
    const service = await ServiceRequest.findById(service_id).populate('clientId');
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const mIndex = service.milestonePayments.findIndex(p => p.milestone === Number(milestone));
    if (mIndex === -1) return res.status(400).json({ message: 'Invalid milestone' });

    const payment = service.milestonePayments[mIndex];
    if (payment.status !== 'uploaded') return res.status(400).json({ message: 'Payment is not in uploaded state' });

    // 1. Generate Invoice Number
    const invoice_number = await generateInvoiceNumber();

    // 2. Create Transaction Audit Record
    await Transaction.create({
      service_id: service._id,
      client_id: service.clientId._id,
      invoice_number,
      milestone: payment.milestone,
      label: payment.label,
      amount_usd: payment.amount_usd,
      amount_inr: payment.amount_inr,
      exchange_rate: service.exchange_rate,
      proof_image_url: payment.proof_image_url,
      status: 'verified',
      verified_at: new Date(),
      notes: notes || 'Manually verified by Admin'
    });

    // 3. Update Service Milestone
    service.milestonePayments[mIndex].status = 'approved';
    service.milestonePayments[mIndex].verified_at = new Date();
    service.milestonePayments[mIndex].invoice_number = invoice_number;
    
    // 4. Update Totals & Unlock Logic
    service.total_paid_usd += payment.amount_usd;
    service.total_paid_inr += payment.amount_inr;

    if (milestone === 1) {
      service.demo_unlocked = true;
      service.status = 'in-progress';
    } else if (milestone === 2) {
      service.project_unlocked = true;
      service.status = 'completed';
    }

    await service.save();

    // 5. Build/Send Emails & Notifications
    await Notification.create({
      userId: service.clientId._id,
      title: 'Payment Approved ✅',
      message: `Your payment for Milestone ${milestone} of ${service.title} has been verified! Content unlocked.`,
      type: 'payment'
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="color: #22c55e;">Payment Verified</h2>
        <p>Hi ${service.clientId.name},</p>
        <p>M Siddhartha Reddy has successfully verified your payment for <strong>${service.title} (Milestone ${milestone})</strong>.</p>
        <p><strong>Status:</strong> Content Unlocked 🔓</p>
        <p>Your official invoice (#${invoice_number}) is ready. You can download it from your dashboard.</p>
      </div>
    `;
    
    try {
      await sendEmail(service.clientId.email, `Payment Approved & Content Unlocked [${service.title}]`, emailHtml);
    } catch (e) { console.error(e); }

    res.json({ success: true, message: 'Payment approved successfully' });

  } catch (error) {
    console.error('Approve Error:', error);
    res.status(500).json({ message: 'Failed to approve payment' });
  }
});

// Reject Payment Proof
router.post('/reject', async (req, res) => {
  try {
    const { service_id, milestone, reason } = req.body;
    const service = await ServiceRequest.findById(service_id).populate('clientId');
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const mIndex = service.milestonePayments.findIndex(p => p.milestone === Number(milestone));
    if (mIndex === -1) return res.status(400).json({ message: 'Invalid milestone' });

    // Reset status to rejected
    service.milestonePayments[mIndex].status = 'rejected';
    service.milestonePayments[mIndex].rejection_reason = reason;
    await service.save();

    await Notification.create({
      userId: service.clientId._id,
      title: 'Payment Rejected ❌',
      message: `Your payment proof for Milestone ${milestone} was rejected. Reason: ${reason}`,
      type: 'payment'
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="color: #ef4444;">Payment Verification Failed</h2>
        <p>Hi ${service.clientId.name},</p>
        <p>Unfortunately, your payment proof for <strong>${service.title} (Milestone ${milestone})</strong> was not verified.</p>
        <div style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>Reason for Rejection:</strong> ${reason}
        </div>
        <p>Please log in to your dashboard and re-upload the correct payment screenshot.</p>
      </div>
    `;
    
    try {
      await sendEmail(service.clientId.email, `Action Required: Payment Re-upload [${service.title}]`, emailHtml);
    } catch (e) { console.error(e); }

    res.json({ success: true, message: 'Payment rejected and client notified' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject payment' });
  }
});

router.get('/revenue', async (req, res) => {
  try {
    const allTransactions = await Transaction.find({ status: 'verified' }).populate('service_id', 'serviceType');
    
    let total_revenue_usd = 0;
    let total_revenue_inr = 0;
    const serviceTypeMap = {};
    
    allTransactions.forEach(t => {
      total_revenue_usd += t.amount_usd || 0;
      total_revenue_inr += t.amount_inr || 0;
      
      const sType = t.service_id?.serviceType || 'Other';
      if (!serviceTypeMap[sType]) serviceTypeMap[sType] = { type: sType, revenue_inr: 0, count: 0 };
      serviceTypeMap[sType].revenue_inr += t.amount_inr || 0;
      serviceTypeMap[sType].count += 1;
    });

    const by_service_type = Object.values(serviceTypeMap);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    let this_month_inr = 0;
    let last_month_inr = 0;
    const by_month = [];
    
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      by_month.push({ 
        month: d.toLocaleString('default', { month: 'short' }), 
        revenue_inr: 0, 
        count: 0, 
        year: d.getFullYear(), 
        m: d.getMonth() 
      });
    }

    allTransactions.forEach(t => {
      const d = new Date(t.verified_at || t.createdAt);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) this_month_inr += t.amount_inr;
      if (d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear) last_month_inr += t.amount_inr;

      const monthEntry = by_month.find(m => m.m === d.getMonth() && m.year === d.getFullYear());
      if (monthEntry) {
        monthEntry.revenue_inr += t.amount_inr;
        monthEntry.count += 1;
      }
    });

    const growth_percent = last_month_inr === 0 ? (this_month_inr > 0 ? 100 : 0) : ((this_month_inr - last_month_inr) / last_month_inr) * 100;

    const pending_verifications = await ServiceRequest.countDocuments({ 'milestonePayments.status': 'uploaded' });
    
    // Calculate pending collections (milestones that are 'review' or 'pending-payment' in active services)
    const activeServices = await ServiceRequest.find({ status: { $in: ['pending', 'review', 'in-progress'] } });
    let pending_payments_inr = 0;
    activeServices.forEach(s => {
      if (s.milestonePayments) {
        s.milestonePayments.forEach(p => {
          if (p.status !== 'approved' && p.status !== 'verified') {
            pending_payments_inr += p.amount_inr || 0;
          }
        });
      }
    });

    res.json({
      total_revenue_usd,
      total_revenue_inr,
      this_month_inr,
      growth_percent,
      by_month,
      by_service_type,
      pending_verifications,
      pending_payments_inr
    });
  } catch (error) {
    console.error('Revenue Error:', error);
    res.status(500).json({ message: 'Revenue error fetching analytics' });
  }
});

router.put('/services/:id/set-demo-link', async (req, res) => {
  try {
    const { demo_link } = req.body;
    const service = await ServiceRequest.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    service.demo_link = demo_link;
    await service.save();
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/services/:id/set-handover-link', async (req, res) => {
  try {
    const { handover_link } = req.body;
    const service = await ServiceRequest.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    service.handover_link = handover_link;
    await service.save();
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
