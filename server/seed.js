import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import User from './models/User.js';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    console.log("Connecting carefully to:", uri ? "URI FOUND ✅" : "URI MISSING ❌");
    await mongoose.connect(uri);
    console.log("MongoDB Connection established.");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

const runSeed = async () => {
  await connectDB();

  try {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash('password123', salt);

    console.log("Generated hash for 'password123':", passwordHash);

    // Wipe old attempts if they exist
    await User.deleteOne({ email: 'admin@vb.in' });
    await User.deleteOne({ email: 'client@demo.in' });

    // Seed Admin
    const admin = await User.create({
      name: 'VB Admin',
      email: 'admin@vb.in',
      password: passwordHash,
      role: 'founder',
      isEmailVerified: true,
      isOtpEnabled: false
    });
    console.log("Successfully seeded Admin:", admin.email);

    // Seed Client
    const client = await User.create({
      name: 'Demo Client',
      email: 'client@demo.in',
      password: passwordHash,
      role: 'client',
      isEmailVerified: true,
      isOtpEnabled: false
    });
    console.log("Successfully seeded Client:", client.email);

  } catch (err) {
    console.error("Seeding Error:", err);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

runSeed();
