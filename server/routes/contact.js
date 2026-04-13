import express from 'express';
import { body, validationResult } from 'express-validator';
import transporter from '../config/mailer.js';
import Contact from '../models/Contact.js';

const router = express.Router();

router.post('/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').notEmpty().withMessage('Message is required')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, phone, service, budget, message } = req.body;

      // Save to Database
      const contact = new Contact({ name, email, phone, service, budget, message });
      await contact.save();

      // Send Email Notification to M Siddhartha Reddy
      const mailOptions = {
        from: `"VB Solutions Lead" <${process.env.EMAIL_USER}>`,
        to: 'vbsoftwaresolutions.founder@gmail.com',
        subject: `New Project Inquiry: ${name}`,
        text: `
          New lead from VB Software Solutions:
          
          Name: ${name}
          Email: ${email}
          Phone: ${phone || 'N/A'}
          Service: ${service || 'N/A'}
          Budget: ${budget || 'N/A'}
          Message: ${message}
          
          ---
          Respond via WhatsApp first if phone is provided.
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Lead notification sent to M Siddhartha Reddy');
      } catch (error) {
        console.error('Error sending lead email:', error);
      }

      res.status(201).json({ message: 'Message sent! M Siddhartha Reddy will contact you soon.' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
