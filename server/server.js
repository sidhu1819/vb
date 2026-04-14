import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
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

// DB
import connectDB from './config/db.js';

// 🔥 Load ENV (IMPORTANT FIX)
dotenv.config({ path: './.env' });

// Debug (remove later)
console.log("MONGO_URI:", process.env.MONGO_URI ? "Loaded ✅" : "Missing ❌");

const app = express();

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 CORS FIX (important for Vercel)
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      "https://vbsoftwaresolutions.vercel.app",
      "http://localhost:5173"
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔥 Connect DB
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Routes
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

// Health check (VERY IMPORTANT for Render)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is running 🚀'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("ERROR:", err.stack);
  res.status(500).json({
    error: 'Server Error',
    message: err.message
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Port conflict handler
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} in use. Try PORT=5001 npm run dev`);
    process.exit(1);
  }
});