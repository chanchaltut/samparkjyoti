const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  deliveryAddress: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode']
    }
  },
  expectedDelivery: {
    type: Date,
    required: [true, 'Expected delivery date is required']
  },
  specialInstructions: {
    type: String,
    maxlength: [500, 'Special instructions cannot exceed 500 characters'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash_on_delivery', 'online_payment', 'bank_transfer'],
    default: 'cash_on_delivery'
  },
  deliveryMethod: {
    type: String,
    enum: ['pickup', 'delivery'],
    required: [true, 'Delivery method is required']
  },
  deliveryFee: {
    type: Number,
    min: [0, 'Delivery fee cannot be negative'],
    default: 0
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNotes: {
    buyer: {
      type: String,
      maxlength: [200, 'Buyer notes cannot exceed 200 characters']
    },
    farmer: {
      type: String,
      maxlength: [200, 'Farmer notes cannot exceed 200 characters']
    }
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  actualDeliveryDate: {
    type: Date
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  review: {
    type: String,
    maxlength: [500, 'Review cannot exceed 500 characters']
  },
  isDisputed: {
    type: Boolean,
    default: false
  },
  disputeReason: {
    type: String,
    maxlength: [500, 'Dispute reason cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for better query performance
orderSchema.index({ buyer: 1 });
orderSchema.index({ farmer: 1 });
orderSchema.index({ product: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for order summary
orderSchema.virtual('orderSummary').get(function() {
  return `${this.quantity} ${this.product?.unit || 'units'} of ${this.product?.name || 'product'}`;
});

// Virtual for delivery status
orderSchema.virtual('deliveryStatus').get(function() {
  if (this.status === 'delivered') return 'Delivered';
  if (this.status === 'shipped') return 'In Transit';
  if (this.status === 'processing') return 'Processing';
  if (this.status === 'confirmed') return 'Confirmed';
  if (this.status === 'pending') return 'Pending';
  if (this.status === 'cancelled') return 'Cancelled';
  if (this.status === 'returned') return 'Returned';
  return 'Unknown';
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
