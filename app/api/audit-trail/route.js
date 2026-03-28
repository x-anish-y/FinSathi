import { NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/auditStore';
import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');
    const limit = parseInt(searchParams.get('limit')) || 50;

    // Try MongoDB first
    const conn = await dbConnect();
    if (conn) {
      const query = module ? { module } : {};
      const logs = await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
      return NextResponse.json({ logs, total: logs.length, source: 'mongodb' });
    }

    // Fallback to in-memory store
    const filter = module ? { module } : {};
    const logs = getAuditLogs(filter, limit);
    return NextResponse.json({ logs, total: logs.length, source: 'memory' });
  } catch (error) {
    // Last resort — try in-memory even on error
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');
    const filter = module ? { module } : {};
    const logs = getAuditLogs(filter, 50);
    return NextResponse.json({ logs, total: logs.length, source: 'memory' });
  }
}
