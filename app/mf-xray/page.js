'use client';

import { useState } from 'react';
import AgentActivityPanel from '@/components/AgentActivityPanel';
import SEBIDisclaimer from '@/components/SEBIDisclaimer';
import { FUND_HOLDINGS } from '@/lib/calculators/mfOverlap';

function fmtINR(n) { return '₹' + Math.round(n || 0).toLocaleString('en-IN'); }

const SAMPLE_FUNDS = [
  { name: 'Mirae Asset Large Cap Fund', invested: 300000, currentValue: 380000, purchaseDate: '2023-06-15' },
  { name: 'SBI Blue Chip Fund', invested: 200000, currentValue: 245000, purchaseDate: '2023-01-20' },
  { name: 'HDFC Top 100 Fund', invested: 250000, currentValue: 310000, purchaseDate: '2024-03-10' },
  { name: 'Axis Bluechip Fund', invested: 150000, currentValue: 175000, purchaseDate: '2024-08-01' },
  { name: 'Parag Parikh Flexi Cap Fund', invested: 200000, currentValue: 260000, purchaseDate: '2022-11-05' },
  { name: 'UTI Nifty 50 Index Fund', invested: 100000, currentValue: 125000, purchaseDate: '2024-06-20' },
];

export default function MFXRayPage() {
  const [mode, setMode] = useState('manual');
  const [funds, setFunds] = useState(SAMPLE_FUNDS);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agentSteps, setAgentSteps] = useState([]);
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [parsedSummary, setParsedSummary] = useState('');
  const [rawText, setRawText] = useState('');
  const [debugOpen, setDebugOpen] = useState(false);

  const handlePDFUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setError(null);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await fetch('/api/mf-xray/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setResults(data);
      setWarnings(data.warnings || []);
      setRawText(data.rawText || 'Raw text preview unavailable.');
      if (data.fundCount && data.transactionCount !== undefined) {
          setParsedSummary(`Parsed ${data.fundCount} funds, ${data.transactionCount} transactions from CAMS statement [${data.investorDetails?.statementPeriod?.from || 'Unknown'} to ${data.investorDetails?.statementPeriod?.to || 'Unknown'}]`);
      }
      setAgentSteps(data.agentTimeline || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleManualAnalysis = async () => {
    setLoading(true); setError(null);
    setAgentSteps([{ agentId: 'data-collector', active: true, message: 'Validating fund data...' }]);
    try {
      const res = await fetch('/api/mf-xray/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ funds }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data);
      setAgentSteps(data.agentTimeline || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const updateFund = (idx, field, value) => {
    setFunds(prev => prev.map((f, i) => i === idx ? { ...f, [field]: field === 'name' ? value : parseFloat(value) || 0 } : f));
  };

  const addFund = () => setFunds(prev => [...prev, { name: '', invested: 0, currentValue: 0, purchaseDate: '' }]);
  const removeFund = (idx) => setFunds(prev => prev.filter((_, i) => i !== idx));

  const totalInvested = funds.reduce((s, f) => s + (f.invested || 0), 0);
  const totalCurrent = funds.reduce((s, f) => s + (f.currentValue || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10 animate-fade-rise">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy-50 mb-2">MF Portfolio X-Ray</h1>
        <p className="text-sm text-navy-50/50">Detect hidden overlap, expense ratio drag, and get STCG-aware rebalancing advice.</p>
      </div>
      <SEBIDisclaimer variant="banner" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex gap-2">
            <button onClick={() => setMode('upload')} className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${mode === 'upload' ? 'gradient-cta text-white' : 'glass-card text-navy-50/60'}`}>📄 Upload CAMS/KFintech PDF</button>
            <button onClick={() => setMode('manual')} className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${mode === 'manual' ? 'gradient-cta text-white' : 'glass-card text-navy-50/60'}`}>✍️ Manual Entry</button>
          </div>

          {mode === 'upload' && (
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-sm text-navy-50/50 mb-4">Upload your CAMS or KFintech consolidated statement.</p>
              <label className="inline-flex items-center gap-2 gradient-cta text-white font-medium px-6 py-3 rounded-full cursor-pointer hover:shadow-glow-teal transition-all">
                {loading ? 'Analyzing...' : '📁 Choose PDF'}
                <input type="file" accept=".pdf" onChange={handlePDFUpload} className="hidden" />
              </label>
            </div>
          )}

          {mode === 'manual' && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-navy-50 mb-4">Your Mutual Fund Holdings</h3>
              <div className="space-y-3">
                {funds.map((fund, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end p-3 rounded-lg bg-surface-container-high/20">
                    <div className="col-span-4">
                      <label className="text-[10px] text-navy-50/40 block mb-1">Fund Name</label>
                      <select value={fund.name} onChange={(e) => updateFund(idx, 'name', e.target.value)} className="w-full px-2 py-2 rounded-lg bg-surface-container-lowest border border-navy-50/10 text-xs text-navy-50">
                        <option value="">Select Fund</option>
                        {Object.keys(FUND_HOLDINGS).map(fn => <option key={fn} value={fn}>{fn}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-navy-50/40 block mb-1">Invested</label>
                      <input type="number" value={fund.invested || ''} onChange={(e) => updateFund(idx, 'invested', e.target.value)} className="w-full px-2 py-2 rounded-lg bg-surface-container-lowest border border-navy-50/10 text-xs text-navy-50" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-navy-50/40 block mb-1">Current Value</label>
                      <input type="number" value={fund.currentValue || ''} onChange={(e) => updateFund(idx, 'currentValue', e.target.value)} className="w-full px-2 py-2 rounded-lg bg-surface-container-lowest border border-navy-50/10 text-xs text-navy-50" />
                    </div>
                    <div className="col-span-3">
                      <label className="text-[10px] text-navy-50/40 block mb-1">Purchase Date</label>
                      <input type="date" value={fund.purchaseDate || ''} onChange={(e) => updateFund(idx, 'purchaseDate', e.target.value)} className="w-full px-2 py-2 rounded-lg bg-surface-container-lowest border border-navy-50/10 text-xs text-navy-50" />
                    </div>
                    <div className="col-span-1 flex items-end justify-between">
                        <span title="Edit parsed value" className="cursor-pointer text-teal-400 text-sm opacity-50 hover:opacity-100 w-full text-center pb-2">✏️</span>
                        <button onClick={() => removeFund(idx)} className="p-2 text-red-400/60 hover:text-red-400 text-xs">✕</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button onClick={addFund} className="text-xs text-teal-400 hover:text-teal-200 transition-colors">+ Add Fund</button>
                <button onClick={handleManualAnalysis} disabled={loading} className="gradient-cta text-white font-semibold px-6 py-2.5 rounded-full text-sm hover:shadow-glow-teal transition-all disabled:opacity-50">
                  {loading ? 'Analyzing...' : '🔬 Run X-Ray Analysis'}
                </button>
              </div>
              <div className="flex gap-4 mt-3 text-xs text-navy-50/40">
                <span>Total Invested: <strong className="text-navy-50/70">{fmtINR(totalInvested)}</strong></span>
                <span>Current Value: <strong className={totalCurrent >= totalInvested ? 'text-teal-300' : 'text-red-400'}>{fmtINR(totalCurrent)}</strong></span>
                <span>Return: <strong className={totalCurrent >= totalInvested ? 'text-teal-300' : 'text-red-400'}>{totalInvested ? ((totalCurrent - totalInvested) / totalInvested * 100).toFixed(1) : 0}%</strong></span>
              </div>
            </div>
          )}

          {error && <div className="p-4 rounded-xl bg-red-900/20 border border-red-500/20 text-sm text-red-300">{error}</div>}

          {parsedSummary && mode === 'upload' && !loading && (
            <div className="p-4 rounded-xl bg-teal-900/20 border border-teal-500/30 text-sm text-teal-100 text-center font-semibold mb-4 animate-fade-rise">
              ✅ {parsedSummary}
            </div>
          )}

          {warnings.length > 0 && !loading && (
            <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-500/30 text-sm text-amber-200 space-y-2 mb-4">
               <div className="font-bold flex items-center gap-2">⚠️ Statement Notice</div>
               <ul className="list-disc pl-5 space-y-1 text-amber-300/80">
                  {warnings.map((w, i) => <li key={i}>{w.message}</li>)}
               </ul>
            </div>
          )}

          {rawText && mode === 'upload' && !loading && (
            <div className="glass-card rounded-2xl p-4 mb-4">
              <button 
                onClick={() => setDebugOpen(!debugOpen)} 
                className="w-full text-left text-sm font-semibold text-navy-50 flex justify-between items-center"
              >
                <span>🔍 Parser Debug (Raw Text)</span>
                <span>{debugOpen ? '▲' : '▼'}</span>
              </button>
              {debugOpen && (
                <pre className="mt-4 p-4 bg-black/40 rounded-lg text-xs text-navy-50/50 overflow-auto max-h-60 whitespace-pre-wrap font-mono relative">
                  {rawText}
                </pre>
              )}
            </div>
          )}

          {results && (
            <div className="space-y-6 animate-fade-rise">
              {/* Portfolio Summary */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-navy-50 mb-4">Portfolio Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-surface-container-high/30"><p className="text-[10px] text-navy-50/40">Total Invested</p><p className="text-lg font-serif font-bold text-navy-50">{fmtINR(totalInvested)}</p></div>
                  <div className="p-3 rounded-lg bg-surface-container-high/30"><p className="text-[10px] text-navy-50/40">Current Value</p><p className="text-lg font-serif font-bold text-teal-200">{fmtINR(totalCurrent)}</p></div>
                  <div className="p-3 rounded-lg bg-surface-container-high/30"><p className="text-[10px] text-navy-50/40">Absolute Return</p><p className={`text-lg font-serif font-bold ${totalCurrent >= totalInvested ? 'text-teal-300' : 'text-red-400'}`}>{totalInvested ? ((totalCurrent - totalInvested) / totalInvested * 100).toFixed(1) : 0}%</p></div>
                  <div className="p-3 rounded-lg bg-surface-container-high/30"><p className="text-[10px] text-navy-50/40">XIRR</p><p className="text-lg font-serif font-bold text-amber-300">{results.xirrResult?.percentage || 'N/A'}</p></div>
                </div>
              </div>

              {/* Overlap Matrix */}
              {results.overlap?.overlapMatrix && Object.keys(results.overlap.overlapMatrix).length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-navy-50 mb-4">🔥 Overlap Heatmap</h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {Object.entries(results.overlap.overlapMatrix).sort(([,a],[,b]) => b.overlap - a.overlap).map(([pair, data]) => (
                      <div key={pair} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-high/20">
                        <div className="flex-1 min-w-0"><p className="text-xs text-navy-50/70 truncate">{pair}</p></div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-surface-container-high overflow-hidden"><div className={`h-full rounded-full ${data.overlap > 60 ? 'bg-red-400' : data.overlap > 30 ? 'bg-amber-400' : 'bg-teal-400'}`} style={{ width: `${data.overlap}%` }} /></div>
                          <span className={`text-xs font-mono font-bold ${data.overlap > 60 ? 'text-red-400' : data.overlap > 30 ? 'text-amber-300' : 'text-teal-300'}`}>{data.overlap}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* High Exposure */}
              {results.overlap?.highExposure?.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-navy-50 mb-4">⚠️ High Concentration Stocks (&gt;8%)</h3>
                  <div className="space-y-2">
                    {results.overlap.highExposure.map((s) => (
                      <div key={s.stock} className="flex items-center justify-between p-3 rounded-lg bg-amber-900/10 border border-amber-400/10">
                        <span className="text-sm text-navy-50/80">{s.stock}</span>
                        <span className="text-sm font-bold text-amber-300">{s.totalWeight}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expense Ratio */}
              {results.expenseAnalysis?.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-navy-50 mb-4">💸 Expense Ratio Drag (10yr projection on ₹10L)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead><tr className="text-navy-50/40 border-b border-navy-50/5"><th className="text-left py-2">Fund</th><th className="text-right py-2">Regular</th><th className="text-right py-2">Direct</th><th className="text-right py-2">You Lose</th></tr></thead>
                      <tbody>{results.expenseAnalysis.map((e, i) => e && (
                        <tr key={i} className="border-b border-navy-50/5"><td className="py-2 text-navy-50/70 max-w-[200px] truncate">{e.fundName}</td><td className="text-right text-red-400/80">{e.regularExpense}%</td><td className="text-right text-teal-300">{e.directExpense}%</td><td className="text-right font-bold text-amber-300">{fmtINR(e.dragAmount)}</td></tr>
                      ))}</tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* STCG Analysis */}
              {results.stcgAnalysis?.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-navy-50 mb-4">📅 STCG-Aware Rebalancing</h3>
                  <div className="space-y-2">
                    {results.stcgAnalysis.map((s, i) => (
                      <div key={i} className={`p-3 rounded-lg ${s.isSTCG ? 'bg-red-900/10 border border-red-500/10' : 'bg-teal-900/10 border border-teal-500/10'}`}>
                        <div className="flex justify-between items-center mb-1"><span className="text-xs font-medium text-navy-50/80">{s.fundName}</span><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.isSTCG ? 'bg-red-500/20 text-red-300' : 'bg-teal-500/20 text-teal-300'}`}>{s.isSTCG ? 'STCG Risk' : 'LTCG Safe'}</span></div>
                        <p className="text-[11px] text-navy-50/50">{s.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Advice */}
              {results.aiNarrative && (
                <div className="glass-card rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-navy-50 mb-3">🤖 AI Rebalancing Advice</h3>
                  <p className="text-sm text-navy-50/70 leading-relaxed whitespace-pre-line">{results.aiNarrative}</p>
                  <SEBIDisclaimer variant="inline" />
                </div>
              )}
            </div>
          )}
        </div>
        <div><AgentActivityPanel steps={agentSteps} isProcessing={loading} /></div>
      </div>
    </div>
  );
}
