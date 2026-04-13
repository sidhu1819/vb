import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

mongoose.connect('mongodb://127.0.0.1:27017/vb_solutions').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({ name: String, email: String, password: String, role: String, isVerified: Boolean }, { strict: false }));
  const ServiceRequest = mongoose.model('ServiceRequest', new mongoose.Schema({}, { strict: false }));

  await User.deleteMany({});
  await ServiceRequest.deleteMany({});
  
  const pass = await bcrypt.hash('password123', 10);
  
  const client = await User.create({ name: 'Test Client', email: 'client@example.com', password: pass, role: 'client', isVerified: true });
  await User.create({ name: 'Admin', email: 'admin@example.com', password: pass, role: 'founder', isVerified: true });
  
  const service = await ServiceRequest.create({
    clientId: client._id,
    title: 'Test Service Request',
    description: 'Testing the frontend features...',
    serviceType: 'Web Development',
    budget: '$1K-$5K',
    timeline: '1-3 months',
    status: 'pending',
    budget_usd: 1000,
    budget_inr: 84000,
    exchange_rate: 84,
    milestonePayments: []
  });

  await User.updateOne({ _id: client._id }, { $push: { activeServices: service._id }});
  
  console.log('Seeded database!');
  process.exit(0);
}).catch(console.error);
