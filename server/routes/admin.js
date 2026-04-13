import express from 'express';
import { authenticateJWT } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/emailService.js';

const router = express.Router();
router.use(authenticateJWT);
router.use(requireRole(['founder', 'employee']));

router.get('/dashboard', async (req, res) => {
  try {
    const clientsCount = await User.countDocuments({ role: 'client' });
    const services = await ServiceRequest.find({});
    
    let active = 0;
    let pending = 0;
    let completed = 0;
    let revenue_inr = 0;
    let pending_verifications = 0;
    
    services.forEach(s => {
      if (s.status === 'completed') completed++;
      else if (s.status === 'pending') pending++;
      else active++;

      revenue_inr += s.total_paid_inr || 0;

      if (s.milestonePayments) {
        s.milestonePayments.forEach(p => {
          if (p.status === 'uploaded') pending_verifications++;
        });
      }
    });

    res.json({ stats: { totalClients: clientsCount, revenue: revenue_inr, activeServices: active, pendingReview: pending, completed, pending_verifications } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/services', async (req, res) => {
  try {
    const services = await ServiceRequest.find({}).populate('clientId', 'name email company').sort({ updatedAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/services/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const service = await ServiceRequest.findById(req.params.id).populate('clientId');
    if (!service) return res.status(404).json({ message: 'Not found' });
    
    service.status = status;
    if (status === 'completed') service.completedAt = new Date();
    
    // Generate milestones if the project is approved (moves out of pending) and has no milestones yet
    if (status !== 'pending' && status !== 'cancelled' && (!service.milestonePayments || service.milestonePayments.length === 0)) {
      const totalUsd = service.budget_usd || 0;
      const totalInr = service.budget_inr || 0;
      service.milestonePayments = [
        {
          milestone: 1,
          label: 'Initial Deposit (40%)',
          percent: 40,
          amount_usd: Math.round(totalUsd * 0.4),
          amount_inr: Math.round(totalInr * 0.4),
          status: 'pending'
        },
        {
          milestone: 2,
          label: 'Final Handover (60%)',
          percent: 60,
          amount_usd: Math.round(totalUsd * 0.6),
          amount_inr: Math.round(totalInr * 0.6),
          status: 'pending'
        }
      ];
    }
    
    await service.save();

    await Notification.create({
      userId: service.clientId._id,
      title: 'Service Status Updated',
      message: `Your service request "${service.title}" is now ${status}.`,
      type: 'update',
      link: `/dashboard/client/services/${service._id}`
    });

    const statusMessages = {
      in_review: "We are reviewing your requirements.",
      in_progress: "Development has started on your project!",
      completed: "Your project is complete — final payment to unlock.",
      delivered: "🎉 Your project has been delivered!",
      cancelled: "Your project has been cancelled. Contact us."
    };

    const clientUrl = process.env.CLIENT_URL;

    await sendEmail({
      to: service.clientId.email,
      subject: `Project Update — ${service.title} is now ${status}`,
      template: 'serviceStatusUpdate.html',
      variables: {
        clientName: service.clientId.name,
        statusMessage: statusMessages[status] || `Your project status is now ${status}`,
        title: service.title,
        statusBadge: status,
        serviceId: service._id,
        client_url: clientUrl
      }
    });

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/clients', async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' }).select('-password').sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/services/:id', async (req, res) => {
  try {
    const service = await ServiceRequest.findById(req.params.id).populate('clientId', 'name email company');
    if (!service) return res.status(404).json({ message: 'Not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/clients/:id/notify', async (req, res) => {
  try {
    const { title, message, type } = req.body;
    
    if (req.params.id === 'all') {
      const clients = await User.find({ role: 'client' });
      const notifications = clients.map(client => ({
        userId: client._id, title, message, type
      }));
      await Notification.insertMany(notifications);
    } else {
      await Notification.create({
        userId: req.params.id,
        title, message, type
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/notifications/all', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).populate('userId', 'name email');
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/services/:id/message', async (req, res) => {
  try {
    const service = await ServiceRequest.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Not found' });

    service.messages.push({
      sender: req.user._id,
      text: req.body.text
    });
    
    await service.save();

    await Notification.create({
      userId: service.clientId,
      title: 'New Message',
      message: `You have a new message regarding "${service.title}".`,
      type: 'info',
      link: `/dashboard/client/services/${service._id}`
    });

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/users/create', requireRole('founder'), async (req, res) => {
  try {
    const { name, email, role, tempPassword, company, phone } = req.body;
    
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Name, email and role are required.' });
    }

    if (!['client', 'employee', 'founder'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role selection.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User with this email already exists.' });

    const generatedPass = tempPassword || `VB${Math.random().toString(36).substring(2, 6).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(generatedPass, salt);

    const user = await User.create({
      name, email, role, company, phone,
      password: hashedPassword,
      isEmailVerified: true,
      createdByAdmin: true,
      mustChangePassword: true
    });

    const clientUrl = process.env.CLIENT_URL;
    const isClient = role === 'client';
    
    await sendEmail({
      to: email,
      subject: isClient ? "Welcome to VB Software Solutions — Your Login Details" : "Welcome to VB Software Solutions Staff Portal",
      template: isClient ? "welcomeClient.html" : "welcomeAdmin.html",
      variables: {
        name,
        email,
        tempPassword: generatedPass,
        client_url: clientUrl
      }
    });

    res.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      tempPassword: generatedPass
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/clients/:id', requireRole('founder'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Client not found' });
    if (user.role !== 'client') return res.status(400).json({ message: 'Only client accounts can be deleted from here' });

    // Optionally delete their service requests and notifications
    await Promise.all([
      ServiceRequest.deleteMany({ clientId: req.params.id }),
      Notification.deleteMany({ userId: req.params.id }),
      User.findByIdAndDelete(req.params.id)
    ]);

    res.json({ success: true, message: 'Client and all associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cleanup old transactions (Founder only)
router.delete('/transactions/cleanup', requireRole(['founder']), async (req, res) => {
  try {
    const { dateBefore, status } = req.query;
    let query = {};
    
    if (dateBefore) {
      query.createdAt = { $lt: new Date(dateBefore) };
    }
    if (status) {
      query.status = status;
    }
    
    const result = await Transaction.deleteMany(query);
    res.json({ message: `Cleanup successful`, deletedCount: result.deletedCount });
  } catch(err) {
    res.status(500).json({ message: 'Failed to clean up transactions' });
  }
});

export default router;
