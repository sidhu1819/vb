import mongoose from 'mongoose';

const siteContentSchema = new mongoose.Schema({
  section: { 
    type: String, 
    enum: ['about', 'services', 'projects', 'home_stats'],
    required: true
  },
  key: { 
    type: String, 
    required: true,
    unique: true
  },
  isVisible: { 
    type: Boolean, 
    default: true
  },
  displayOrder: { 
    type: Number, 
    default: 0
  },
  overrideData: { 
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }
}, { timestamps: true });

export default mongoose.model('SiteContent', siteContentSchema);
