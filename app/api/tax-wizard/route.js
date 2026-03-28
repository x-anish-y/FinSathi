import { NextResponse } from 'next/server';
import { validateTaxInputs } from '@/lib/agents/dataCollector';
import { orchestrate } from '@/lib/agents/orchestrator';
import { getTaxAdvice } from '@/lib/agents/aiAdvisor';
import dbConnect from '@/lib/db';
import FinancialPlan from '@/models/FinancialPlan';

export async function POST(request) {
  try {
    const body = await request.json();
    const { valid, errors, sanitized } = validateTaxInputs(body);

    if (!valid) {
      return NextResponse.json({ error: errors.join(', '), code: 'VALIDATION_ERROR' }, { status: 400 });
    }

    const results = await orchestrate('tax-wizard', sanitized, async (calcResults) => {
      return await getTaxAdvice(calcResults);
    });

    try {
      const conn = await dbConnect();
      if (conn) {
        await FinancialPlan.create({
          sessionId: body.sessionId || 'anonymous',
          module: 'tax-wizard',
          inputs: sanitized,
          outputs: { recommendation: results.recommendation, savings: results.savings, oldTax: results.oldRegime?.totalTax, newTax: results.newRegime?.totalTax },
          openAINarrative: results.aiNarrative,
        });
      }
    } catch (e) {
      console.error('DB save failed:', e.message);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Tax Wizard API error:`, error);
    return NextResponse.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
