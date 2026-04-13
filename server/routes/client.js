import express from 'express';
import { authenticateJWT } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const router = express.Router();
router.use(authenticateJWT);
router.use(requireRole('client'));

router.get('/dashboard', async (req, res) => {
  try {
    const services = await ServiceRequest.find({ clientId: req.user._id });
    
    let active = 0;
    let pending = 0;
    let completed = 0;
    let verifying = 0;
    
    services.forEach(s => {
      if (s.status === 'completed') completed++;
      else if (s.status === 'pending' || s.status === 'review') pending++;
      else active++;

      // Count milestones that are currently in 'uploaded' state (verifying)
      if (s.milestonePayments) {
        s.milestonePayments.forEach(p => {
          if (p.status === 'uploaded') verifying++;
        });
      }
    });

    // Count unread notifications
    const unreadNotificationsCount = await Notification.countDocuments({ userId: req.user._id, read: false });

    res.json({ stats: { active, pending, completed, verifying, unreadNotificationsCount } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/services', async (req, res) => {
  try {
    console.log("[CLIENT ROUTE] GET /services hit for user:", req.user._id);
    const services = await ServiceRequest.find({ clientId: req.user._id }).sort({ updatedAt: -1 });
    console.log("[CLIENT ROUTE] Services found:", services.length);
    res.json(services);
  } catch (error) {
    console.error("[CLIENT ROUTE] Error fetching services:", error);
    res.status(500).json({ message: 'Server error fetching services' });
  }
});

import { sendEmail } from '../utils/emailService.js';

router.post('/services', async (req, res) => {
  try {
    const { title, description, serviceType, budget, startDate, endDate } = req.body;
    
    // Validate dates
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const numericBudget = Number(budget);
    const exchangeRate = 84;
    const totalUsd = numericBudget;
    const totalInr = Math.round(numericBudget * exchangeRate);

    const service = await ServiceRequest.create({
      clientId: req.user._id,
      title,
      description,
      serviceType,
      budget: numericBudget,
      startDate,
      endDate,
      status: 'pending',
      budget_usd: totalUsd,
      budget_inr: totalInr,
      exchange_rate: exchangeRate,
      milestonePayments: []
    });
    
    const user = await User.findById(req.user._id);
    user.activeServices.push(service._id);
    await user.save();

    const clientUrl = process.env.CLIENT_URL;

    // Email to Client
    await sendEmail({
      to: user.email,
      subject: `Service Request Received — ${title}`,
      template: 'serviceRequestReceived.html',
      variables: {
        clientName: user.name,
        serviceType,
        title,
        budget: numericBudget,
        timeline: `${startDate} to ${endDate}`,
        serviceId: service._id,
        client_url: clientUrl
      }
    });

    // Email to Admin
    await sendEmail({
      to: 'vbsoftwaresolutions.founder@gmail.com',
      subject: `System Alert: New Service Request from ${user.name}`,
      template: 'adminNotification.html',
      variables: {
        eventSummary: `New Service Request`,
        details: `Client: ${user.name} | Title: ${title} | Budget: ${budget}`,
        actionText: 'View Service in Admin Dashboard',
        actionUrl: `${clientUrl}/dashboard/admin/services/${service._id}`
      }
    });

    res.status(201).json(service);
  } catch (error) {
    console.error("[SERVICE CREATE ERROR]", error);
    res.status(500).json({ message: 'Server error creating service request' });
  }
});

router.get('/services/:id', async (req, res) => {
  try {
    const service = await ServiceRequest.findOne({ _id: req.params.id, clientId: req.user._id });
    if (!service) return res.status(404).json({ message: 'Not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/services/:id/message', async (req, res) => {
  try {
    const service = await ServiceRequest.findOne({ _id: req.params.id, clientId: req.user._id });
    if (!service) return res.status(404).json({ message: 'Not found' });

    service.messages.push({
      sender: req.user._id,
      text: req.body.text
    });
    
    await service.save();
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Ignore any attempts to update name, email, company, phone, etc.
    if (!currentPassword || !newPassword) {
       return res.json({ message: 'Profile fields are read-only. Only password can be updated here, but passwords not provided.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Since we need bcrypt, we must import it at the top. Wait! I will do this safely in multi-replace or just require it here? No, I'll just redirect them to auth's change-password. But for simplicity, I'll just implement it here and I must make sure bcrypt is imported.
    const bcrypt = await import('bcryptjs');
    
    const isMatch = await bcrypt.default.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' });

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password cannot be the same as current.' });
    }

    const salt = await bcrypt.default.genSalt(12);
    user.password = await bcrypt.default.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
