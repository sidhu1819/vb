import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import transporter from '../config/mailer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendOTPEmail = async (to, otp) => {
  try {
    const templatePath = path.join(__dirname, '../templates/otpEmail.html');
    let html = fs.readFileSync(templatePath, 'utf8');
    html = html.replace('{{OTP_CODE}}', otp);

    await transporter.sendMail({
      from: `"VB Software Solutions" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Your VB Software login code: ${otp}`,
      html,
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
};

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"VB Software Solutions" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
};

export const sendWelcomeEmail = async (to, name) => {
  try {
    const templatePath = path.join(__dirname, '../templates/welcomeEmail.html');
    let html = fs.readFileSync(templatePath, 'utf8');
    html = html.replace('{{USER_NAME}}', name)
               .replace('{{CLIENT_URL}}', process.env.CLIENT_URL || 'http://localhost:5173');

    await transporter.sendMail({
      from: `"VB Software Solutions" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Welcome to VB Software Solutions',
      html,
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
};
