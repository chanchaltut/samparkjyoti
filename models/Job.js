const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  labour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    required: [true, 'Cover letter is required'],
    maxlength: [1000, 'Cover letter cannot exceed 1000 characters']
  },
  expectedSalary: {
    type: Number,
    required: [true, 'Expected salary is required'],
    min: [0, 'Expected salary cannot be negative']
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
    default: 'pending'
  },
  employerNotes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  // Labour profile snapshot at application time
  labourSnapshot: {
    workExperience: Number,
    fieldOfWork: [String],
    extraSkills: [String],
    rating: Number,
    totalRatings: Number
  }
});

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [2000, 'Job description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Job category is required'],
    enum: [
      'agriculture',
      'construction',
      'manufacturing',
      'services',
      'transportation',
      'retail',
      'domestic',
      'other'
    ]
  },
  location: {
    type: String,
    required: [true, 'Job location is required'],
    trim: true
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: [0, 'Salary cannot be negative']
  },
  salaryType: {
    type: String,
    enum: ['per_hour', 'per_day', 'per_week', 'per_month', 'fixed'],
    default: 'per_day'
  },
  experience: {
    type: String,
    enum: ['entry', 'intermediate', 'experienced', 'expert'],
    default: 'entry'
  },
  requirements: [{
    type: String,
    trim: true
  }],
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applications: [applicationSchema],
  status: {
    type: String,
    enum: ['active', 'paused', 'closed', 'filled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  duration: {
    type: String,
    enum: ['temporary', 'seasonal', 'permanent', 'contract'],
    default: 'temporary'
  },
  workHours: {
    type: String,
    enum: ['full_time', 'part_time', 'flexible'],
    default: 'full_time'
  },
  benefits: [{
    type: String,
    trim: true
  }],
  isUrgent: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  // Employer-specific fields
  employerDetails: {
    workExperience: Number,
    typeOfWork: {
      type: String,
      enum: ['business', 'personal', 'both']
    },
    businessDetails: {
      businessName: String,
      businessType: String,
      gstin: String,
      din: String
    },
    typicalAmount: Number,
    typicalDaysOfWork: Number
  },
  // Language requirements for vernacular support
  languageRequirements: [{
    type: String,
    enum: ['english', 'hindi', 'marathi', 'gujarati', 'bengali', 'telugu', 'tamil', 'kannada', 'malayalam', 'punjabi', 'urdu']
  }],
  // Job-specific requirements
  jobRequirements: {
    minimumAge: {
      type: Number,
      min: [18, 'Minimum age must be at least 18']
    },
    maximumAge: {
      type: Number,
      min: [18, 'Maximum age must be at least 18']
    },
    genderPreference: {
      type: String,
      enum: ['male', 'female', 'any'],
      default: 'any'
    },
    physicalRequirements: [String],
    toolsProvided: {
      type: Boolean,
      default: false
    },
    accommodationProvided: {
      type: Boolean,
      default: false
    },
    foodProvided: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
jobSchema.index({ category: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ salary: 1 });
jobSchema.index({ experience: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ employer: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ 'employerDetails.typeOfWork': 1 });
jobSchema.index({ languageRequirements: 1 });

// Virtual for formatted salary
jobSchema.virtual('formattedSalary').get(function() {
  const salaryTypes = {
    per_hour: '/hour',
    per_day: '/day',
    per_week: '/week',
    per_month: '/month',
    fixed: ''
  };
  return `₹${this.salary}${salaryTypes[this.salaryType]}`;
});

// Virtual for job summary
jobSchema.virtual('jobSummary').get(function() {
  return `${this.title} - ${this.location} - ₹${this.salary}/${this.salaryType}`;
});

// Ensure virtual fields are serialized
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema);
