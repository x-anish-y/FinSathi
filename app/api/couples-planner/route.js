import { NextResponse } from 'next/server';
import { validateCoupleInputs } from '@/lib/agents/dataCollector';
import { orchestrate } from '@/lib/agents/orchestrator';
import { getCoupleAdvice } from '@/lib/agents/aiAdvisor';

export async function POST(request) {
  try {
    const body = await request.json();
    const { valid, errors } = validateCoupleInputs(body);

    if (!valid) {
      return NextResponse.json({ error: errors.join(', '), code: 'VALIDATION_ERROR' }, { status: 400 });
    }

    const results = await orchestrate('couples-planner', body, async (calcResults) => {
      return await getCoupleAdvice(calcResults);
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Couples Planner API error:`, error);
    return NextResponse.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
