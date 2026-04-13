import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const documentSchema = new mongoose.Schema({
  name: { type: String },
  url: { type: String },
  uploadedAt: { type: Date, default: Date.now }
});

const serviceRequestSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceType: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in-review', 'in-progress', 'review', 'completed', 'cancelled'],
    default: 'pending' 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: String },
  timeline: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  messages: [messageSchema],
  documents: [documentSchema],
  completedAt: { type: Date },

  // --- V4 Manual UPI Payment System Fields ---
  budget_usd: { type: Number, default: 0 },
  budget_inr: { type: Number, default: 0 },
  exchange_rate: { type: Number, default: 84 },
  demo_link: { type: String }, // Locked until Milestone 1 approved
  handover_link: { type: String }, // Locked until Milestone 2 approved
  handover_type: { type: String, enum: ['zip', 'drive', 'git'], default: 'zip' },
  
  milestonePayments: [{
    milestone: { type: Number, required: true }, // 1 (40%) or 2 (60%)
    label: { type: String, required: true },
    percent: { type: Number, required: true },
    amount_usd: { type: Number, required: true },
    amount_inr: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'uploaded', 'approved', 'rejected'],
      default: 'pending'
    },
    proof_image_url: { type: String },
    transactionId: { type: String },
    uploaded_at: { type: Date },
    verified_at: { type: Date },
    rejection_reason: { type: String },
    invoice_number: { type: String }
  }],
  
  total_paid_usd: { type: Number, default: 0 },
  total_paid_inr: { type: Number, default: 0 },
  project_unlocked: { type: Boolean, default: false }, // For full project files
  demo_unlocked: { type: Boolean, default: false } // For demo link
}, { timestamps: true });

export default mongoose.model('ServiceRequest', serviceRequestSchema);
