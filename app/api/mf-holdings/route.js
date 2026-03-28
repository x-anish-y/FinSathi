import { NextResponse } from 'next/server';

const NAV_CACHE = new Map();
const CACHE_TTL = 3600000; // 1 hour

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const schemeCode = searchParams.get('code');

    if (schemeCode) {
      // Fetch NAV for a specific scheme
      const cacheKey = `nav_${schemeCode}`;
      if (NAV_CACHE.has(cacheKey) && Date.now() - NAV_CACHE.get(cacheKey).time < CACHE_TTL) {
        return NextResponse.json(NAV_CACHE.get(cacheKey).data);
      }

      try {
        const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}`, { next: { revalidate: 3600 } });
        if (!res.ok) throw new Error('mfapi.in unavailable');
        const data = await res.json();
        NAV_CACHE.set(cacheKey, { data, time: Date.now() });
        return NextResponse.json(data);
      } catch {
        return NextResponse.json({ error: 'mfapi.in is currently unavailable. Using cached data.', code: 'MFAPI_DOWN', fallback: true }, { status: 503 });
      }
    }

    if (query) {
      // Search for funds
      try {
        const res = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        return NextResponse.json(data);
      } catch {
        return NextResponse.json({ error: 'Fund search unavailable', code: 'SEARCH_FAILED' }, { status: 503 });
      }
    }

    return NextResponse.json({ error: 'Provide ?q= for search or ?code= for NAV', code: 'BAD_REQUEST' }, { status: 400 });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] MF Holdings API error:`, error);
    return NextResponse.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
