const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
  // Multiple roles support
  roles: [{
    type: String,
    enum: ['labour', 'employer', 'farmer', 'buyer'],
    required: [true, 'At least one role is required']
  }],
  primaryRole: {
    type: String,
    enum: ['labour', 'employer', 'farmer', 'buyer'],
    required: [true, 'Primary role is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  // Language preferences for vernacular support
  languages: [{
    type: String,
    enum: ['english', 'hindi', 'marathi', 'gujarati', 'bengali', 'telugu', 'tamil', 'kannada', 'malayalam', 'punjabi', 'urdu'],
    default: ['english']
  }],
  preferredLanguage: {
    type: String,
    enum: ['english', 'hindi', 'marathi', 'gujarati', 'bengali', 'telugu', 'tamil', 'kannada', 'malayalam', 'punjabi', 'urdu'],
    default: 'english'
  },
  
  // Role-specific fields
  // Enhanced Labour fields
  labourProfile: {
    // Basic Information
    age: {
      type: Number,
      min: [18, 'Age must be at least 18'],
      max: [70, 'Age cannot exceed 70'],
      required: function() {
        return this.roles && this.roles.includes('labour');
      }
    },
    workExperience: {
      type: Number,
      min: [0, 'Work experience cannot be negative'],
      default: 0
    },
    workLocation: {
      type: String,
      trim: true
    },
    minimumWage: {
      type: Number,
      min: [0, 'Minimum wage cannot be negative'],
      default: 0,
      required: function() {
        return this.roles && this.roles.includes('labour');
      }
    },
    
    // Work Classification
    workRole: {
      type: String,
      enum: [
        'driver', 'construction_worker', 'domestic_helper', 'cook', 'cleaner',
        'security_guard', 'gardener', 'electrician', 'plumber', 'carpenter',
        'mechanic', 'delivery_person', 'farm_worker', 'factory_worker',
        'painter', 'welder', 'mason', 'helper', 'supervisor', 'other'
      ],
      required: function() {
        return this.roles && this.roles.includes('labour');
      }
    },
    
    fieldOfWork: [{
      type: String,
      enum: ['agriculture', 'construction', 'manufacturing', 'services', 'transportation', 'retail', 'domestic', 'other'],
      trim: true
    }],
    
    // Specialization and Skills
    speciality: {
      type: String,
      enum: [
        'heavy_vehicle_driving', 'light_vehicle_driving', 'two_wheeler_driving',
        'house_construction', 'road_construction', 'building_maintenance',
        'cooking', 'cleaning', 'child_care', 'elderly_care',
        'electrical_work', 'plumbing', 'carpentry', 'welding', 'painting',
        'security', 'gardening', 'farming', 'machine_operation',
        'computer_skills', 'language_skills', 'other'
      ],
      required: function() {
        return this.roles && this.roles.includes('labour');
      }
    },
    
    extraSkills: [{
      type: String,
      trim: true
    }],
    
    // Performance Metrics
    performanceRating: {
      type: Number,
      min: [1, 'Rating cannot be less than 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 3
    },
    
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    
    // Work Preferences
    availability: {
      type: String,
      enum: ['full_time', 'part_time', 'flexible', 'seasonal', 'contract'],
      default: 'full_time'
    },
    
    workingHours: {
      type: String,
      enum: ['day_shift', 'night_shift', 'flexible', 'rotational'],
      default: 'day_shift'
    },
    
    // Additional Information
    hasVehicle: {
      type: Boolean,
      default: false
    },
    
    vehicleType: {
      type: String,
      enum: ['two_wheeler', 'car', 'auto_rickshaw', 'truck', 'tractor', 'none'],
      default: 'none'
    },
    
    hasLicense: {
      type: Boolean,
      default: false
    },
    
    licenseType: {
      type: String,
      enum: ['learner', 'permanent', 'commercial', 'none'],
      default: 'none'
    },
    
    // Work History
    previousEmployers: [{
      companyName: String,
      duration: String,
      role: String,
      reason_for_leaving: String
    }],
    
    // Physical Requirements
    canLiftHeavyObjects: {
      type: Boolean,
      default: false
    },
    
    hasHealthIssues: {
      type: Boolean,
      default: false
    },
    
    // Emergency Contact
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    }
  },
  
  // Employer fields
  employerProfile: {
    workExperience: {
      type: Number,
      min: [0, 'Work experience cannot be negative'],
      default: 0
    },
    workLocation: {
      type: String,
      trim: true
    },
    typeOfWork: {
      type: String,
      enum: ['business', 'personal', 'both'],
      default: 'personal'
    },
    businessDetails: {
      businessName: String,
      businessType: String,
      gstin: String,
      din: String
    },
    typicalAmount: {
      type: Number,
      min: [0, 'Amount cannot be negative'],
      default: 0
    },
    typicalDaysOfWork: {
      type: Number,
      min: [1, 'Days of work must be at least 1'],
      default: 1
    },
    skillsRequired: [{
      type: String,
      trim: true
    }]
  },
  
  // Farmer fields
  farmerProfile: {
    cropYield: [{
      cropName: {
        type: String,
        required: true,
        trim: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [0, 'Quantity cannot be negative']
      },
      unit: {
        type: String,
        enum: ['kg', 'quintal', 'ton', 'acre', 'hectare'],
        default: 'kg'
      },
      harvestDate: Date,
      isOrganic: {
        type: Boolean,
        default: false
      }
    }],
    minimumSupportPrice: {
      type: Number,
      min: [0, 'MSP cannot be negative'],
      default: 0
    },
    specialtyYield: [{
      type: String,
      trim: true
    }],
    farmingType: {
      type: String,
      enum: ['organic', 'conventional', 'mixed', 'hydroponic', 'other'],
      default: 'conventional'
    },
    landSize: {
      type: Number,
      min: [0, 'Land size cannot be negative']
    },
    landUnit: {
      type: String,
      enum: ['acre', 'hectare', 'sqft', 'sqm'],
      default: 'acre'
    }
  },
  
  // Buyer fields
  buyerProfile: {
    buyerType: {
      type: String,
      enum: ['consumer', 'dealer', 'local_vendor', 'wholesaler', 'retailer'],
      default: 'consumer'
    },
    businessVerification: {
      gstin: String,
      din: String,
      businessLicense: String,
      isVerified: {
        type: Boolean,
        default: false
      }
    },
    preferredCategories: [{
      type: String,
      enum: ['grains', 'vegetables', 'fruits', 'dairy', 'poultry', 'fish', 'spices', 'pulses', 'oilseeds', 'other']
    }],
    typicalOrderSize: {
      type: Number,
      min: [0, 'Order size cannot be negative']
    },
    orderSizeUnit: {
      type: String,
      enum: ['kg', 'quintal', 'ton', 'dozen', 'piece', 'litre'],
      default: 'kg'
    }
  },
  
  // Common fields
  profileImage: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
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
  isActive: {
    type: Boolean,
    default: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true
  },
  // Verification documents
  documents: [{
    type: {
      type: String,
      enum: ['aadhar', 'pan', 'driving_license', 'passport', 'business_license', 'gst_certificate', 'other']
    },
    documentNumber: String,
    documentImage: String,
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  
  // Admin/Agent tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationNotes: String,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ roles: 1 });
userSchema.index({ primaryRole: 1 });
userSchema.index({ location: 1 });
userSchema.index({ 'labourProfile.fieldOfWork': 1 });
userSchema.index({ 'farmerProfile.cropYield.cropName': 1 });
userSchema.index({ 'buyerProfile.buyerType': 1 });
userSchema.index({ languages: 1 });

// Virtual for average rating
userSchema.virtual('averageRating').get(function() {
  return this.totalRatings > 0 ? this.rating / this.totalRatings : 0;
});

// Virtual for role summary
userSchema.virtual('roleSummary').get(function() {
  if (this.roles.length === 1) {
    return this.roles[0];
  }
  return `${this.primaryRole} + ${this.roles.length - 1} other roles`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
