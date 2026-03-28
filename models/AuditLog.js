import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  module: { type: String, required: true, index: true },
  agentName: { type: String, required: true },
  action: { type: String, required: true },
  inputSummary: String,
  outputSummary: String,
  processingTimeMs: Number,
});

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
