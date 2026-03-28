import { NextResponse } from 'next/server';
import { orchestrate } from '@/lib/agents/orchestrator';

export async function POST(request) {
  try {
    const body = await request.json();
    const { module, data } = body;

    if (!module || !data) {
      return NextResponse.json({ error: 'Module and data are required', code: 'BAD_REQUEST' }, { status: 400 });
    }

    const results = await orchestrate(module, data, null);
    return NextResponse.json(results);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Agent API error:`, error);
    return NextResponse.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
