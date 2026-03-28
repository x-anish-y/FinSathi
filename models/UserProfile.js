import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  age: Number,
  annualIncome: Number,
  city: String,
  riskProfile: {
    type: String,
    enum: ['conservative', 'moderate', 'aggressive'],
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema);
