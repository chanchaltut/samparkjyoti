const mongoose = require('mongoose');

const UstaadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    speciality: { type: String, trim: true },
    experience: { type: String, trim: true },
    minimumWage: { type: Number },
    location: { type: String, trim: true },
    phone: { type: String, trim: true },
    rating: { type: Number, default: 0 },
    skills: [{ type: String }],
    bio: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ustaad', UstaadSchema);


