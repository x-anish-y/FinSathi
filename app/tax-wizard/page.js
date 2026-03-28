'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import AgentActivityPanel from '@/components/AgentActivityPanel';
import SEBIDisclaimer from '@/components/SEBIDisclaimer';

const TaxComparison = dynamic(() => import('@/components/TaxComparison'), { ssr: false });

function fmtINR(n) { return '₹' + Math.round(n || 0).toLocaleString('en-IN'); }

export default function TaxWizardPage() {
  const [mode, setMode] = useState('manual');
  const [form, setForm] = useState({
    basicSalary: '', hraReceived: '', otherAllowances: '', monthlyRent: '',
    isMetroCity: true, investments80C: '', nps80CCD1B: '', homeLoanInterest: '',
    healthInsurance80D: '', otherDeductions80G: '', employerNPSContribution: '',
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [agentSteps, setAgentSteps] = useState([]);
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [rawText, setRawText] = useState('');
  const [debugOpen, setDebugOpen] = useState(false);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handlePDFUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true); setError(null);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await fetch('/api/tax-wizard/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      if (data.extractedFields) {
        setWarnings(data.warnings || []);
        setRawText(data.rawText || 'Raw text preview unavailable.');
        const f = data.extractedFields;
        const v = (val) => (val !== null && val !== undefined && val !== '') ? String(val) : '';
        setForm({
          basicSalary: v(f.basicSalary), hraReceived: v(f.hraReceived), otherAllowances: v(f.otherAllowances),
          monthlyRent: v(f.monthlyRentPaid), isMetroCity: f.isMetroCity ?? true,
          investments80C: v(f.investments_80c), nps80CCD1B: v(f.nps_80ccd),
          homeLoanInterest: v(f.homeLoanInterest), healthInsurance80D: v(f.healthInsurance_80d),
          otherDeductions80G: v(f.otherDeductions),
          employerNPSContribution: v(f.employerNPS_80ccd2),
        });
        setMode('manual');
      }
    } catch (err) { setError('Upload failed: ' + err.message); }
    finally { setUploadLoading(false); }
  };

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    setAgentSteps([{ agentId: 'data-collector', active: true, message: 'Validating tax data...' }]);
    try {
      const payload = {};
      Object.entries(form).forEach(([k, v]) => { payload[k] = k === 'isMetroCity' ? v : parseFloat(v) || 0; });
      const res = await fetch('/api/tax-wizard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data);
      setAgentSteps(data.agentTimeline || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const field = (label, id, placeholder = '0') => {
    const isMissing = warnings.some(w => w.code === 'GROSS_SALARY_MISSING' || w.code === 'REGIME_NOT_FOUND' || w.message.toLowerCase().includes(label.toLowerCase()));
    return (
      <div className="relative group">
        <label className="text-[11px] text-navy-50/50 mb-1 block flex justify-between">
            {label} 
            <span className="text-teal-400 opacity-0 group-hover:opacity-100 cursor-pointer text-[10px] transition-opacity">✏️ Edit</span>
        </label>
        <input type="number" placeholder={isMissing ? 'Not found - please enter' : placeholder} value={form[id]} onChange={(e) => handleChange(id, e.target.value)}
          className={`w-full px-3 py-2.5 rounded-lg bg-surface-container-lowest border border-navy-50/10 text-sm text-navy-50 transition-colors ${isMissing ? 'border-amber-500/50 bg-amber-900/10' : ''}`} />
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10 animate-fade-rise">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy-50 mb-2">Tax Wizard</h1>
        <p className="text-sm text-navy-50/50">Compare Old vs New tax regimes with step-by-step deduction analysis.</p>
      </div>

      <SEBIDisclaimer variant="banner" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button onClick={() => setMode('upload')} className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${mode === 'upload' ? 'gradient-cta text-white' : 'glass-card text-navy-50/60 hover:text-teal-200'}`}>📄 Upload Form 16</button>
            <button onClick={() => setMode('manual')} className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${mode === 'manual' ? 'gradient-cta text-white' : 'glass-card text-navy-50/60 hover:text-teal-200'}`}>✍️ Manual Entry</button>
          </div>

          {mode === 'upload' && (
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-sm text-navy-50/50 mb-4">Upload your Form 16 PDF and we'll auto-fill everything.</p>
              <label className="inline-flex items-center gap-2 gradient-cta text-white font-medium px-6 py-3 rounded-full cursor-pointer hover:shadow-glow-teal transition-all">
                {uploadLoading ? 'Processing...' : '📁 Choose PDF File'}
                <input type="file" accept=".pdf" onChange={handlePDFUpload} className="hidden" />
              </label>
            </div>
          )}

          {/* Manual Entry Form */}
          {mode === 'manual' && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-navy-50 mb-4">Income Details (Annual)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {field('Basic Salary', 'basicSalary', '900000')}
                {field('HRA Received', 'hraReceived', '360000')}
                {field('Other Allowances', 'otherAllowances', '540000')}
              </div>

              <h3 className="text-sm font-semibold text-navy-50 mb-4 mt-6">HRA Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {field('Monthly Rent Paid', 'monthlyRent', '20000')}
                <div>
                  <label className="text-[11px] text-navy-50/50 mb-1 block">City Type</label>
                  <select value={form.isMetroCity ? 'true' : 'false'} onChange={(e) => handleChange('isMetroCity', e.target.value === 'true')}
                    className="w-full px-3 py-2.5 rounded-lg bg-surface-container-lowest border border-navy-50/10 text-sm text-navy-50">
                    <option value="true">Metro (50% of basic)</option>
                    <option value="false">Non-Metro (40% of basic)</option>
                  </select>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-navy-50 mb-4 mt-6">Deductions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {field('80C Investments', 'investments80C', '150000')}
                {field('80CCD(1B) NPS', 'nps80CCD1B', '50000')}
                {field('Home Loan Interest', 'homeLoanInterest', '0')}
                {field('80D Health Insurance', 'healthInsurance80D', '25000')}
                {field('80G Donations', 'otherDeductions80G')}
                {field('Employer NPS (80CCD2)', 'employerNPSContribution')}
              </div>

              <button onClick={handleSubmit} disabled={loading}
                className="mt-6 gradient-cta text-white font-semibold px-8 py-3 rounded-full text-sm hover:shadow-glow-teal transition-all disabled:opacity-50">
                {loading ? 'Calculating...' : 'Compare Tax Regimes'}
              </button>
            </div>
          )}

          {error && <div className="p-4 rounded-xl bg-red-900/20 border border-red-500/20 text-sm text-red-300">{error}</div>}

          {warnings.length > 0 && mode === 'manual' && (
            <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-500/30 text-sm text-amber-200 space-y-2">
               <div className="font-bold flex items-center gap-2">⚠️ PDF Parsing Notes</div>
               <ul className="list-disc pl-5 space-y-1 text-amber-300/80">
                  {warnings.map((w, i) => <li key={i}>{w.message}</li>)}
               </ul>
            </div>
          )}
          
          {rawText && mode === 'manual' && (
            <div className="glass-card rounded-2xl p-4">
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

          {/* Results */}
          {results && (
            <div className="space-y-6 animate-fade-rise">
              <TaxComparison oldRegime={results.oldRegime} newRegime={results.newRegime} recommendation={results.recommendation} savings={results.savings} />

              {/* HRA Details */}
              {results.hraDetails?.exemption > 0 && (
                <div className="glass-card rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-navy-50 mb-3">📋 HRA Exemption Calculation</h3>
                  <p className="text-xs text-navy-50/60 leading-relaxed">{results.hraDetails.reasoning}</p>
                </div>
              )}

              {/* Missed Deductions */}
              {results.missedDeductions?.length > 0 && (
                <div className="glass-card rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-navy-50 mb-3">💡 Missed Deductions</h3>
                  <div className="space-y-2">
                    {results.missedDeductions.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-amber-900/10 border border-amber-400/10">
                        <div>
                          <span className="text-[10px] font-bold text-amber-400">{d.section}</span>
                          <p className="text-xs text-navy-50/60">{d.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-navy-50/40">Max: {typeof d.maxLimit === 'number' ? fmtINR(d.maxLimit) : d.maxLimit}</p>
                          <p className="text-xs font-semibold text-amber-300">Save: {typeof d.potentialSaving === 'number' ? fmtINR(d.potentialSaving) : d.potentialSaving}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Narrative */}
              {results.aiNarrative && (
                <div className="glass-card rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-navy-50 mb-3">🤖 AI Tax Advice</h3>
                  <p className="text-sm text-navy-50/70 leading-relaxed">{results.aiNarrative}</p>
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
