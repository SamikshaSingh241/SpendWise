const mongoose = require('mongoose');

const personalityProfileSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['Saver', 'Spender', 'Investor', 'Balanced', 'Unknown'],
      default: 'Unknown',
    },
    scores: {
      saverScore: { type: Number, default: 0 },
      spenderScore: { type: Number, default: 0 },
      investorScore: { type: Number, default: 0 },
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const PersonalityProfile = mongoose.model('PersonalityProfile', personalityProfileSchema);
module.exports = PersonalityProfile;
