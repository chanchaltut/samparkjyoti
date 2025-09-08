const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  district: {
    type: String,
    required: false, // Made optional for existing agents
    trim: true,
    default: 'Not specified'
  },
  state: {
    type: String,
    required: false, // Made optional for existing agents
    trim: true,
    default: 'Not specified'
  },
  pincode: {
    type: String,
    required: false, // Made optional for existing agents
    trim: true,
    default: '000000'
  },
  
  // Agent-specific fields
  agentId: {
    type: String,
    unique: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true
  },
  organization: {
    type: String,
    required: [true, 'Organization is required']
  },
  territory: {
    type: String,
    required: [true, 'Territory is required']
  },
  
  // Verification and status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['license', 'aadhar', 'pan', 'organization_certificate', 'other']
    },
    documentNumber: String,
    documentImage: String,
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  
  // Performance metrics
  workersCreated: {
    type: Number,
    default: 0
  },
  priceUpdatesCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  
  // Profile information
  profileImage: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true
  },
  
  // Permissions
  permissions: {
    canCreateWorkers: {
      type: Boolean,
      default: true
    },
    canUpdatePrices: {
      type: Boolean,
      default: true
    },
    canVerifyWorkers: {
      type: Boolean,
      default: false
    },
    canManageAgents: {
      type: Boolean,
      default: false
    }
  },
  
  // Activity tracking
  lastLogin: Date,
  lastPriceUpdate: Date,
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate unique agent ID before saving
agentSchema.pre('save', async function(next) {
  if (!this.agentId) {
    try {
      const count = await this.constructor.countDocuments();
      this.agentId = `AGT${String(count + 1).padStart(6, '0')}`;
    } catch (error) {
      // Fallback to timestamp-based ID
      this.agentId = `AGT${Date.now()}`;
    }
  }
  next();
});

// Index for better query performance
agentSchema.index({ email: 1 });
agentSchema.index({ agentId: 1 });
agentSchema.index({ licenseNumber: 1 });
agentSchema.index({ location: 1 });
agentSchema.index({ territory: 1 });
agentSchema.index({ isActive: 1, isVerified: 1 });

// Virtual for average rating
agentSchema.virtual('averageRating').get(function() {
  return this.totalRatings > 0 ? this.rating / this.totalRatings : 0;
});

// Ensure virtual fields are serialized
agentSchema.set('toJSON', { virtuals: true });
agentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Agent', agentSchema);



