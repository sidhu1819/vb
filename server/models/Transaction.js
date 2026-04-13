import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invoice_number: { type: String, required: true, unique: true },
  milestone: { type: Number, required: true },
  label: { type: String, required: true },
  amount_usd: { type: Number, required: true },
  amount_inr: { type: Number, required: true },
  exchange_rate: { type: Number, required: true },
  proof_image_url: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected', 'refunded'],
    default: 'pending' 
  },
  method: { type: String, default: 'UPI' },
  verified_at: { type: Date },
  rejection_reason: { type: String },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
