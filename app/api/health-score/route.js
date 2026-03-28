import { NextResponse } from 'next/server';
import { validateHealthScoreInputs } from '@/lib/agents/dataCollector';
import { orchestrate } from '@/lib/agents/orchestrator';
import { getHealthScoreAdvice } from '@/lib/agents/aiAdvisor';
import dbConnect from '@/lib/db';
import FinancialPlan from '@/models/FinancialPlan';

export async function POST(request) {
  try {
    const body = await request.json();
    const { valid, errors, sanitized } = validateHealthScoreInputs(body);

    if (!valid) {
      return NextResponse.json({ error: errors.join(', '), code: 'VALIDATION_ERROR' }, { status: 400 });
    }

    const results = await orchestrate('health-score', sanitized, async (calcResults) => {
      return await getHealthScoreAdvice(calcResults.scores);
    });

    // Fire-and-forget DB save — don't block the response
    dbConnect().then(conn => {
      if (conn) {
        FinancialPlan.create({
          sessionId: body.sessionId || 'anonymous',
          module: 'health-score',
          inputs: sanitized,
          outputs: { scores: results.scores, totalScore: results.totalScore },
          openAINarrative: JSON.stringify(results.aiNarrative),
        }).catch(e => console.error('DB save failed:', e.message));
      }
    }).catch(e => console.error('DB connect failed:', e.message));

    return NextResponse.json(results);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Health Score API error:`, error);
    return NextResponse.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
