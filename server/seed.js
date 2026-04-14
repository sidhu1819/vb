import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();

    const salt = await bcrypt.genSalt(12);
    const password = await bcrypt.hash('password123', salt);

    // Create Admin
    const adminExists = await User.findOne({ email: 'admin@vb.in' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@vb.in',
        password,
        role: 'founder',
        isEmailVerified: true
      });
      console.log('Admin user created: admin@vb.in');
    } else {
      console.log('Admin already exists');
    }

    // Create Client
    const clientExists = await User.findOne({ email: 'client@demo.in' });
    if (!clientExists) {
      await User.create({
        name: 'Test Client',
        email: 'client@demo.in',
        password,
        role: 'client',
        isEmailVerified: true
      });
      console.log('Client user created: client@demo.in');
    } else {
      console.log('Client already exists');
    }

    mongoose.connection.close();
    console.log('Database seeding completed.');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedUsers();
