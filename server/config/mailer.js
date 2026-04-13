import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Use Brevo if BREVO_API_KEY is present, else fallback to standard Gmail config
const isBrevo = !!process.env.BREVO_API_KEY;

const transporter = nodemailer.createTransport(
  isBrevo 
    ? {
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.BREVO_API_KEY
        }
      }
    : {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      }
);

export default transporter;
