import mongoose from 'mongoose';

const FinancialPlanSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  module: { type: String, required: true },
  inputs: mongoose.Schema.Types.Mixed,
  outputs: mongoose.Schema.Types.Mixed,
  openAINarrative: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.FinancialPlan || mongoose.model('FinancialPlan', FinancialPlanSchema);
