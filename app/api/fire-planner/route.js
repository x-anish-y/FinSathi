import { NextResponse } from 'next/server';
import { validateFireInputs } from '@/lib/agents/dataCollector';
import { orchestrate } from '@/lib/agents/orchestrator';
import { getFirePlanAdvice } from '@/lib/agents/aiAdvisor';
import dbConnect from '@/lib/db';
import FinancialPlan from '@/models/FinancialPlan';

export async function POST(request) {
  try {
    const body = await request.json();
    const { valid, errors, sanitized } = validateFireInputs(body);

    if (!valid) {
      return NextResponse.json({ error: errors.join(', '), code: 'VALIDATION_ERROR' }, { status: 400 });
    }

    const results = await orchestrate('fire-planner', sanitized, async (calcResults) => {
      return await getFirePlanAdvice(calcResults);
    });

    try {
      const conn = await dbConnect();
      if (conn) {
        await FinancialPlan.create({
          sessionId: body.sessionId || 'anonymous',
          module: 'fire-planner',
          inputs: sanitized,
          outputs: { requiredCorpus: results.requiredCorpus, shortfall: results.shortfall, additionalSIPNeeded: results.additionalSIPNeeded },
          openAINarrative: results.aiNarrative,
        });
      }
    } catch (e) {
      console.error('DB save failed:', e.message);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] FIRE Planner API error:`, error);
    return NextResponse.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
