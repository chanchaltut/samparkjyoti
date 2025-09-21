const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  // Basic Vendor Information
  vendorName: {
    type: String,
    required: true,
    trim: true
  },
  marketName: {
    type: String,
    required: true,
    trim: true
  },
  marketLocation: {
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
  
  // Contact Information
  contactPerson: {
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
  address: {
    type: String,
    trim: true
  },
  
  // Trade Information
  tradeProducts: [{
    type: String,
    trim: true
  }],
  tradeCategories: [{
    type: String,
    enum: ['vegetables', 'fruits', 'grains', 'spices', 'dairy', 'poultry', 'fish', 'other'],
    trim: true
  }],
  
  // Business Information
  businessType: {
    type: String,
    enum: ['wholesale', 'retail', 'both'],
    default: 'both'
  },
  licenseNumber: {
    type: String,
    trim: true
  },
  gstNumber: {
    type: String,
    trim: true
  },
  
  // Operating Information
  operatingDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  operatingHours: {
    start: {
      type: String,
      default: '06:00'
    },
    end: {
      type: String,
      default: '18:00'
    }
  },
  
  // Status and Validation
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  
  // Additional Information
  description: {
    type: String,
    trim: true
  },
  specializations: [{
    type: String,
    trim: true
  }],
  paymentMethods: [{
    type: String,
    enum: ['cash', 'upi', 'bank_transfer', 'cheque', 'card']
  }],
  
  // Analytics
  totalTransactions: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  
  // Created by admin
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for search and filtering
vendorSchema.index({ vendorName: 'text', marketName: 'text', tradeProducts: 'text' });
vendorSchema.index({ district: 1, state: 1 });
vendorSchema.index({ status: 1, isVerified: 1 });
vendorSchema.index({ tradeCategories: 1 });
vendorSchema.index({ createdBy: 1 });

// Virtual for full address
vendorSchema.virtual('fullAddress').get(function() {
  const parts = [this.marketLocation, this.district, this.state];
  if (this.pincode) parts.push(this.pincode);
  return parts.filter(Boolean).join(', ');
});

// Virtual for operating days display
vendorSchema.virtual('operatingDaysDisplay').get(function() {
  if (!this.operatingDays || this.operatingDays.length === 0) return 'Not specified';
  return this.operatingDays.join(', ');
});

// Virtual for trade products display
vendorSchema.virtual('tradeProductsDisplay').get(function() {
  if (!this.tradeProducts || this.tradeProducts.length === 0) return 'Not specified';
  return this.tradeProducts.join(', ');
});

// Ensure virtual fields are serialized
vendorSchema.set('toJSON', { virtuals: true });
vendorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Vendor', vendorSchema);
