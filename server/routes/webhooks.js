import express from 'express';
import crypto from 'crypto';
import Transaction from '../models/Transaction.js';

const router = express.Router();

router.post('/razorpay', async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'VBSOFTWARERAZORPAYWEBHOOKSECRET';
    const signature = req.headers['x-razorpay-signature'];

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(req.rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).send('Invalid signature');
    }

    const event = req.body.event;
    const payload = req.body.payload.payment.entity;

    const orderId = payload.order_id;
    const transaction = await Transaction.findOne({ razorpay_order_id: orderId });

    if (!transaction) return res.status(200).send('Ignored');

    if (event === 'payment.captured') {
      if (transaction.status === 'pending') {
         transaction.status = 'paid';
         transaction.razorpay_payment_id = payload.id;
         transaction.paid_at = new Date();
         await transaction.save();
         // Wait for /verify-payment to handle Service updates to prevent race conditions
      }
    } else if (event === 'payment.failed') {
      transaction.status = 'failed';
      await transaction.save();
    } else if (event === 'refund.processed') {
      transaction.status = 'refunded';
      await transaction.save();
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Server Error');
  }
});

export default router;
