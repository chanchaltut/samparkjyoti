const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Basic Product Information
  productName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['vegetables', 'fruits', 'grains', 'spices', 'dairy', 'poultry', 'fish', 'other']
  },
  subcategory: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Quantity and Pricing
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'quintal', 'ton', 'piece', 'dozen', 'litre', 'bag', 'other']
  },
  pricePerUnit: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  minimumOrder: {
    type: Number,
    default: 1
  },
  availableQuantity: {
    type: Number,
    required: true
  },
  
  // Quality and Condition
  quality: {
    type: String,
    enum: ['premium', 'good', 'average', 'fair'],
    default: 'good'
  },
  condition: {
    type: String,
    enum: ['fresh', 'dried', 'processed', 'frozen', 'canned'],
    default: 'fresh'
  },
  grade: {
    type: String,
    trim: true
  },
  organic: {
    type: Boolean,
    default: false
  },
  certification: [{
    type: String,
    trim: true
  }],
  
  // Location Information
  location: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  farmLocation: {
    type: String,
    trim: true
  },
  
  // Farmer Information
  farmer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    farmName: {
      type: String,
      trim: true
    },
    aadhar: {
      type: String,
      trim: true
    }
  },
  
  // Agent Assignment
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    default: null
  },
  agentNotes: {
    type: String,
    trim: true
  },
  
  // Status and Validation
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'sold', 'cancelled'],
    default: 'pending'
  },
  validationNotes: {
    type: String,
    trim: true
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    default: null
  },
  validatedAt: {
    type: Date,
    default: null
  },
  
  // Timestamps
  postedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days from now
    }
  },
  
  // Additional Information
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  harvestDate: {
    type: Date
  },
  storageCondition: {
    type: String,
    trim: true
  },
  packaging: {
    type: String,
    trim: true
  },
  deliveryOptions: [{
    type: String,
    enum: ['pickup', 'delivery', 'both']
  }],
  deliveryRadius: {
    type: Number,
    default: 50 // in km
  },
  
  // Images
  images: [{
    url: String,
    caption: String
  }],
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  },
  interestedBuyers: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for location-based queries
productSchema.index({ location: 1, district: 1, state: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ assignedAgent: 1, status: 1 });
productSchema.index({ postedAt: -1 });
productSchema.index({ productName: 'text', description: 'text' });

// Virtual for product age
productSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.postedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for isExpired
productSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Virtual for isAvailable
productSchema.virtual('isAvailable').get(function() {
  return this.status === 'approved' && this.availableQuantity > 0 && !this.isExpired;
});

module.exports = mongoose.model('Product', productSchema);