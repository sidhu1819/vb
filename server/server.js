import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import projectRoutes from './routes/projects.js';
import serviceRoutes from './routes/services.js';
import contactRoutes from './routes/contact.js';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/client.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payments.js';
import adminPaymentRoutes from './routes/adminPayments.js';
import siteContentRoutes from './routes/siteContent.js';
import adminContentRoutes from './routes/adminContent.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173', 
    'http://localhost:5173', 
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Static folder for uploaded proofs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

app.use('/api/projects', projectRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);
app.use('/api/admin/site-content', adminContentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/site-content', siteContentRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server Error', trace: err.stack, msg: err.message });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} in use. Try PORT=5001 npm run dev`);
    process.exit(1);
  }
});
