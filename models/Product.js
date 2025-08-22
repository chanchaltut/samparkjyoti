const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Product description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'grains',
      'vegetables',
      'fruits',
      'dairy',
      'poultry',
      'fish',
      'spices',
      'pulses',
      'oilseeds',
      'other'
    ]
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'quintal', 'ton', 'dozen', 'piece', 'litre', 'gram']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  harvestDate: {
    type: Date,
    required: [true, 'Harvest date is required']
  },
  organic: {
    type: Boolean,
    default: false
  },
  quality: {
    type: String,
    enum: ['grade_a', 'grade_b', 'grade_c', 'organic'],
    default: 'grade_b'
  },
  images: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['available', 'sold_out', 'reserved', 'expired'],
    default: 'available'
  },
  minOrderQuantity: {
    type: Number,
    min: [0, 'Minimum order quantity cannot be negative'],
    default: 1
  },
  maxOrderQuantity: {
    type: Number,
    min: [0, 'Maximum order quantity cannot be negative']
  },
  deliveryOptions: [{
    type: String,
    enum: ['pickup', 'delivery', 'both'],
    default: 'pickup'
  }],
  deliveryRadius: {
    type: Number,
    min: [0, 'Delivery radius cannot be negative'],
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
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
  isFeatured: {
    type: Boolean,
    default: false
  },
  expiryDate: {
    type: Date
  },
  // Farmer-specific fields
  farmerDetails: {
    farmingType: {
      type: String,
      enum: ['organic', 'conventional', 'mixed', 'hydroponic', 'other'],
      default: 'conventional'
    },
    landSize: Number,
    landUnit: {
      type: String,
      enum: ['acre', 'hectare', 'sqft', 'sqm'],
      default: 'acre'
    },
    specialtyYield: [String],
    certification: [{
      type: String,
      enum: ['organic', 'fair_trade', 'rainforest_alliance', 'utz', 'other']
    }]
  },
  // MSP and pricing details
  pricing: {
    minimumSupportPrice: {
      type: Number,
      min: [0, 'MSP cannot be negative']
    },
    marketPrice: {
      type: Number,
      min: [0, 'Market price cannot be negative']
    },
    isMSPGuaranteed: {
      type: Boolean,
      default: false
    },
    priceNegotiable: {
      type: Boolean,
      default: true
    },
    bulkDiscount: {
      type: Boolean,
      default: false
    },
    bulkDiscountDetails: {
      minQuantity: Number,
      discountPercentage: Number
    }
  },
  // Crop/Vegetable specific details
  cropDetails: {
    variety: String,
    season: {
      type: String,
      enum: ['rabi', 'kharif', 'zaid', 'all_season']
    },
    sowingDate: Date,
    expectedHarvestDate: Date,
    actualHarvestDate: Date,
    yieldPerAcre: Number,
    yieldUnit: {
      type: String,
      enum: ['kg', 'quintal', 'ton']
    },
    irrigationType: {
      type: String,
      enum: ['rainfed', 'irrigated', 'mixed']
    },
    pestControlMethod: {
      type: String,
      enum: ['chemical', 'organic', 'biological', 'integrated']
    }
  },
  // Language support for vernacular
  languageInfo: {
    localName: String,
    localLanguage: {
      type: String,
      enum: ['hindi', 'marathi', 'gujarati', 'bengali', 'telugu', 'tamil', 'kannada', 'malayalam', 'punjabi', 'urdu']
    },
    descriptionLocal: String
  }
}, {
  timestamps: true
});

// Index for better query performance
productSchema.index({ category: 1 });
productSchema.index({ location: 1 });
productSchema.index({ price: 1 });
productSchema.index({ farmer: 1 });
productSchema.index({ status: 1 });
productSchema.index({ harvestDate: 1 });
productSchema.index({ organic: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'pricing.minimumSupportPrice': 1 });
productSchema.index({ 'cropDetails.variety': 1 });
productSchema.index({ 'farmerDetails.farmingType': 1 });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price}/${this.unit}`;
});

// Virtual for average rating
productSchema.virtual('averageRating').get(function() {
  return this.totalRatings > 0 ? this.rating / this.totalRatings : 0;
});

// Virtual for days since harvest
productSchema.virtual('daysSinceHarvest').get(function() {
  const now = new Date();
  const harvest = new Date(this.harvestDate);
  const diffTime = Math.abs(now - harvest);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for MSP comparison
productSchema.virtual('mspComparison').get(function() {
  if (!this.pricing.minimumSupportPrice) return 'No MSP';
  if (this.price >= this.pricing.minimumSupportPrice) return 'Above MSP';
  return 'Below MSP';
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
