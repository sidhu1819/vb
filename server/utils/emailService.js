import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Load HTML template + replace placeholders
function loadTemplate(templateName, variables) {
  const templatePath = path.join(__dirname, '../templates', templateName);
  try {
    let html = fs.readFileSync(templatePath, 'utf8');
    Object.entries(variables).forEach(([key, value]) => {
      html = html.replaceAll(`{{${key}}}`, value || '');
    });
    return html;
  } catch (error) {
    console.error(`Missing email template: ${templateName}`);
    // Fallback if template doesn't exist yet
    let fallbackHtml = `<div><h2>Notification</h2>`;
    Object.entries(variables).forEach(([key, value]) => {
      fallbackHtml += `<p><strong>${key}:</strong> ${value}</p>`;
    });
    fallbackHtml += `</div>`;
    return fallbackHtml;
  }
}

export async function sendEmail({ to, subject, template, variables }) {
  try {
    const html = loadTemplate(template, variables);
    await transporter.sendMail({
      from: `"M Siddhartha Reddy | VB Software Solutions" <${process.env.EMAIL_USER}>`,
      replyTo: process.env.EMAIL_USER,
      to,
      subject,
      html,
      text: `${subject}\n\n${Object.entries(variables).map(([k,v]) => `${k}: ${v}`).join('\n')}`
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error('Email failed:', error.message);
  }
}
