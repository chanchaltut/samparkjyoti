const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
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
  
  // Price information
  currentPrice: {
    type: Number,
    required: [true, 'Current price is required'],
    min: [0, 'Price cannot be negative']
  },
  previousPrice: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'quintal', 'ton', 'dozen', 'piece', 'litre', 'gram']
  },
  
  // Location information
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  market: {
    type: String,
    required: [true, 'Market name is required'],
    trim: true
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  
  // Quality and grade
  quality: {
    type: String,
    enum: ['premium', 'grade_a', 'grade_b', 'standard', 'low_grade'],
    default: 'standard'
  },
  
  // Price trend
  priceChange: {
    type: Number,
    default: 0
  },
  priceChangePercentage: {
    type: Number,
    default: 0
  },
  trend: {
    type: String,
    enum: ['up', 'down', 'stable'],
    default: 'stable'
  },
  
  // Agent information
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  agentName: {
    type: String,
    required: true
  },
  agentLocation: {
    type: String,
    required: true
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  verificationDate: Date,
  
  // Additional information
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  imageUrl: {
    type: String
  },
  
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    min: [0, 'Stock quantity cannot be negative']
  },
  
  // Validity
  validUntil: {
    type: Date,
    default: function() {
      // Default validity is 24 hours from creation
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  },
  
  // Source information
  source: {
    type: String,
    enum: ['agent', 'farmer', 'market_committee', 'government', 'other'],
    default: 'agent'
  },
  
  // Tags for better searchability
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Calculate price change before saving
marketPriceSchema.pre('save', function(next) {
  if (this.previousPrice && this.currentPrice) {
    this.priceChange = this.currentPrice - this.previousPrice;
    this.priceChangePercentage = ((this.priceChange / this.previousPrice) * 100).toFixed(2);
    
    if (this.priceChange > 0) {
      this.trend = 'up';
    } else if (this.priceChange < 0) {
      this.trend = 'down';
    } else {
      this.trend = 'stable';
    }
  }
  next();
});

// Index for better query performance
marketPriceSchema.index({ productName: 1 });
marketPriceSchema.index({ category: 1 });
marketPriceSchema.index({ location: 1 });
marketPriceSchema.index({ market: 1 });
marketPriceSchema.index({ district: 1, state: 1 });
marketPriceSchema.index({ updatedBy: 1 });
marketPriceSchema.index({ createdAt: -1 });
marketPriceSchema.index({ validUntil: 1 });
marketPriceSchema.index({ isAvailable: 1, isVerified: 1 });

// Compound indexes for common queries
marketPriceSchema.index({ productName: 1, location: 1 });
marketPriceSchema.index({ category: 1, location: 1 });
marketPriceSchema.index({ productName: 1, createdAt: -1 });

// Virtual for formatted price
marketPriceSchema.virtual('formattedPrice').get(function() {
  return `₹${this.currentPrice}/${this.unit}`;
});

// Virtual for price trend icon
marketPriceSchema.virtual('trendIcon').get(function() {
  switch(this.trend) {
    case 'up': return '↗️';
    case 'down': return '↘️';
    default: return '➡️';
  }
});

// Ensure virtual fields are serialized
marketPriceSchema.set('toJSON', { virtuals: true });
marketPriceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MarketPrice', marketPriceSchema);









