/**
 * Orchestrator — Coordinates 4 agents sequentially, collects timing data
 */

import { applyComplianceGuardrails } from './complianceAgent';
import { runCalculation } from './calculatorAgent';
import { addAuditLog } from '@/lib/auditStore';
import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';

async function logAudit(module, agentName, action, inputSummary, outputSummary, processingTimeMs) {
  // Always write to in-memory store (instant, never fails)
  addAuditLog({ module, agentName, action, inputSummary, outputSummary, processingTimeMs });

  // Also try MongoDB (fire-and-forget)
  try {
    const conn = await dbConnect();
    if (conn) {
      await AuditLog.create({ module, agentName, action, inputSummary, outputSummary, processingTimeMs });
    }
  } catch (e) {
    // Silently fail — in-memory store already has the log
  }
}

export async function orchestrate(module, validatedData, aiAdvisorFn) {
  const timeline = [];
  const totalStart = Date.now();

  // Step 1: Data Collection (already validated by caller)
  const step1Start = Date.now();
  timeline.push({ agentId: 'data-collector', complete: true, active: false, message: 'Input data validated and sanitized' });
  // Fire-and-forget — never block the pipeline for audit logs
  logAudit(module, 'DataCollector', 'validate', `${module} inputs received`, 'Validation passed', Date.now() - step1Start);

  // Step 2: Calculator
  const step2Start = Date.now();
  let calcResults;
  try {
    calcResults = runCalculation(module, validatedData);
    timeline.push({ agentId: 'calculator', complete: true, active: false, message: 'Calculations complete' });
    logAudit(module, 'Calculator', 'compute', `Running ${module} calculations`, 'Calculations successful', Date.now() - step2Start);
  } catch (e) {
    timeline.push({ agentId: 'calculator', complete: false, active: false, message: `Error: ${e.message}` });
    throw e;
  }

  // Step 3: AI Advisor (optional, can fail gracefully)
  const step3Start = Date.now();
  let aiNarrative = null;
  try {
    if (aiAdvisorFn) {
      aiNarrative = await aiAdvisorFn(calcResults);
      timeline.push({ agentId: 'ai-advisor', complete: true, active: false, message: 'AI recommendations generated' });
    } else {
      timeline.push({ agentId: 'ai-advisor', complete: true, active: false, message: 'Skipped (no AI function provided)' });
    }
    logAudit(module, 'AIAdvisor', 'generate', `Generating ${module} narrative`, aiNarrative ? 'Generated' : 'Skipped', Date.now() - step3Start);
  } catch (e) {
    aiNarrative = 'AI narrative temporarily unavailable.';
    timeline.push({ agentId: 'ai-advisor', complete: true, active: false, message: 'AI unavailable — using fallback' });
    logAudit(module, 'AIAdvisor', 'error', `${module} AI generation failed`, e.message, Date.now() - step3Start);
  }

  // Step 4: Compliance
  const step4Start = Date.now();
  const finalResults = applyComplianceGuardrails(module, { ...calcResults, aiNarrative });
  timeline.push({ agentId: 'compliance', complete: true, active: false, message: 'SEBI guardrails applied' });
  logAudit(module, 'Compliance', 'guardrails', `Applying compliance for ${module}`, 'Guardrails applied', Date.now() - step4Start);

  return {
    ...finalResults,
    agentTimeline: timeline,
    totalProcessingMs: Date.now() - totalStart,
  };
}
