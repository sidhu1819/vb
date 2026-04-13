import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  transactionId: { 
    type: String, 
    required: true 
  },
  paymentDate: { 
    type: Date, 
    default: Date.now 
  },
  screenshotUrl: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending' 
  },
  
  // Custom VB Software properties for backward compatibility and deeper integration
  serviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ServiceRequest' 
  },
  milestone: { 
    type: Number 
  },
  amount: {
    type: Number
  }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
