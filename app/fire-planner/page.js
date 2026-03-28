'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import AgentActivityPanel from '@/components/AgentActivityPanel';
import SEBIDisclaimer from '@/components/SEBIDisclaimer';
import { calculateFirePlan } from '@/lib/calculators/fireCalculator';

const FireChart = dynamic(() => import('@/components/FireChart'), { ssr: false });

function fmtINR(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
function fmtCr(n) { return '₹' + (n / 10000000).toFixed(2) + ' Cr'; }

function SummaryCard({ label, value, color = 'teal', sub }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <p className="text-[11px] text-navy-50/40 mb-1">{label}</p>
      <p className={`font-serif text-xl font-bold ${color === 'amber' ? 'text-amber-300' : color === 'red' ? 'text-red-400' : 'text-teal-200'}`}>{value}</p>
      {sub && <p className="text-[10px] text-navy-50/30 mt-1">{sub}</p>}
    </div>
  );
}

export default function FirePlannerPage() {
  const [form, setForm] = useState({
    currentAge: 34, monthlyIncome: 200000, monthlyExpenses: 80000,
    existingEquityMF: 1800000, existingDebtMF: 0, existingPPF: 600000,
    existingEPF: 0, existingFD: 0, currentMonthlySIP: 25000,
    targetRetirementAge: 50, targetMonthlyWithdrawal: 150000,
  });

  const [results, setResults] = useState(null);
  const [aiNarrative, setAiNarrative] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [agentSteps, setAgentSteps] = useState([]);
  const debounceRef = useRef(null);

  // Client-side calculation — runs instantly on any form change
  const compute = useCallback(() => {
    try {
      const r = calculateFirePlan(form);
      setResults(r);
    } catch (e) {
      console.error('Calc error:', e);
    }
  }, [form]);

  useEffect(() => { compute(); }, [compute]);

  // Debounced AI narrative call
  const fetchAINarrative = useCallback(async () => {
    setAiLoading(true);
    setAgentSteps([
      { agentId: 'data-collector', complete: true, message: 'Inputs validated' },
      { agentId: 'calculator', complete: true, message: 'FIRE calculations complete' },
      { agentId: 'ai-advisor', active: true, message: 'Generating AI narrative...' },
      { agentId: 'compliance', message: 'Waiting...' },
    ]);
    try {
      const res = await fetch('/api/fire-planner', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      setAiNarrative(data.aiNarrative);
      setAgentSteps(data.agentTimeline || []);
    } catch { setAiNarrative('AI narrative unavailable.'); }
    finally { setAiLoading(false); }
  }, [form]);

  // Debounce AI narrative on slider change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchAINarrative, 800);
    return () => clearTimeout(debounceRef.current);
  }, [form.targetRetirementAge]);

  const handleChange = (field, rawValue) => {
    const value = field === 'targetRetirementAge' ? parseInt(rawValue) : parseFloat(rawValue) || 0;
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const inputField = (label, field, prefix = '₹') => (
    <div>
      <label className="text-[11px] text-navy-50/50 mb-1 block">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-navy-50/30">{prefix}</span>
        <input type="number" value={form[field] || ''} onChange={(e) => handleChange(field, e.target.value)}
          className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-surface-container-lowest border border-navy-50/10 text-sm text-navy-50" />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10 animate-fade-rise">
        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-amber-400/70 mb-2 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">Most Popular</span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy-50 mb-2">FIRE Path Planner</h1>
        <p className="text-sm text-navy-50/50">Calculate your Financial Independence date. Drag the slider and watch your future change.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Input Form */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-navy-50 mb-4">Your Financial Profile</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {inputField('Current Age', 'currentAge', '🎂')}
              {inputField('Monthly Income', 'monthlyIncome')}
              {inputField('Monthly Expenses', 'monthlyExpenses')}
              {inputField('Equity MF Corpus', 'existingEquityMF')}
              {inputField('PPF Corpus', 'existingPPF')}
              {inputField('EPF Corpus', 'existingEPF')}
              {inputField('Debt MF Corpus', 'existingDebtMF')}
              {inputField('FD Corpus', 'existingFD')}
              {inputField('Current Monthly SIP', 'currentMonthlySIP')}
              {inputField('Monthly Withdrawal (today)', 'targetMonthlyWithdrawal')}
            </div>
          </div>

          {/* CRITICAL: Live Retirement Age Slider */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-navy-50">Target Retirement Age</h3>
              <span className="font-serif text-3xl font-bold text-gradient-teal">{form.targetRetirementAge}</span>
            </div>
            <input type="range" min={Math.max(form.currentAge + 5, 35)} max={70} value={form.targetRetirementAge}
              onChange={(e) => handleChange('targetRetirementAge', e.target.value)}
              className="w-full" id="retirement-slider" />
            <div className="flex justify-between text-[10px] text-navy-50/30 mt-1">
              <span>{Math.max(form.currentAge + 5, 35)}</span>
              <span>70</span>
            </div>
          </div>

          {/* Results */}
          {results && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-rise">
                <SummaryCard label="Required Corpus" value={fmtCr(results.requiredCorpus)} />
                <SummaryCard label="Projected Corpus" value={fmtCr(results.totalProjected)} color={results.totalProjected >= results.requiredCorpus ? 'teal' : 'amber'} />
                <SummaryCard label="Shortfall" value={results.shortfall > 0 ? fmtCr(results.shortfall) : '₹0 — On Track! 🎉'} color={results.shortfall > 0 ? 'red' : 'teal'} />
                <SummaryCard label="Additional SIP Needed" value={results.additionalSIPNeeded > 0 ? fmtINR(results.additionalSIPNeeded) + '/mo' : '₹0'} color="amber" sub={`Inflation-adjusted withdrawal: ${fmtINR(results.inflatedMonthlyWithdrawal)}/mo`} />
              </div>

              {/* Chart */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-navy-50 mb-4">Corpus Projection vs Target</h3>
                <FireChart data={results.chartData} targetCorpus={results.requiredCorpus} />
              </div>

              {/* Glidepath */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-navy-50 mb-4">Asset Allocation Glidepath</h3>
                <div className="overflow-x-auto">
                  <div className="flex gap-1.5 min-w-max">
                    {results.glidepathData?.filter((_, i) => i % 2 === 0).map((g) => (
                      <div key={g.age} className="text-center">
                        <div className="w-10 h-24 rounded-lg overflow-hidden flex flex-col">
                          <div className="bg-teal-500/60" style={{ height: `${g.equity}%` }} />
                          <div className="bg-amber-400/40 flex-1" />
                        </div>
                        <p className="text-[9px] text-navy-50/40 mt-1">{g.age}</p>
                        <p className="text-[8px] text-teal-300/60">{g.equity}%</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-teal-500/60" /><span className="text-[10px] text-navy-50/40">Equity</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-400/40" /><span className="text-[10px] text-navy-50/40">Debt</span></div>
                  </div>
                </div>
              </div>

              {/* AI Narrative */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-navy-50 mb-3">🤖 AI Financial Plan</h3>
                {aiLoading ? (
                  <div className="flex items-center gap-2 text-sm text-navy-50/40"><span className="w-4 h-4 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" /> Generating personalized plan...</div>
                ) : (
                  <div className="text-sm text-navy-50/70 leading-relaxed whitespace-pre-line">{aiNarrative || 'Submit your data to get AI recommendations.'}</div>
                )}
                <SEBIDisclaimer variant="inline" />
              </div>

              {/* Insurance Gap */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-navy-50 mb-3">🛡️ Insurance Gap Analysis</h3>
                <p className="text-sm text-navy-50/60">Ideal Term Cover: <span className="font-semibold text-amber-300">{fmtINR(results.idealTermCover)}</span> (10× annual income)</p>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <AgentActivityPanel steps={agentSteps} isProcessing={aiLoading} />
          <div className="glass-card rounded-xl p-4">
            <h4 className="text-xs font-semibold text-navy-50/60 mb-2">Quick Presets</h4>
            <div className="space-y-2">
              {[
                { label: 'Judge Scenario', age: 34, income: 200000, eq: 1800000, ppf: 600000, sip: 25000, retAge: 50, withdraw: 150000 },
                { label: 'Aggressive', age: 28, income: 150000, eq: 500000, ppf: 200000, sip: 40000, retAge: 45, withdraw: 100000 },
              ].map((preset) => (
                <button key={preset.label} onClick={() => setForm({ ...form, currentAge: preset.age, monthlyIncome: preset.income, existingEquityMF: preset.eq, existingPPF: preset.ppf, currentMonthlySIP: preset.sip, targetRetirementAge: preset.retAge, targetMonthlyWithdrawal: preset.withdraw })}
                  className="w-full text-left text-xs p-2.5 rounded-lg bg-surface-container-high/30 hover:bg-surface-container-high/60 text-navy-50/60 hover:text-teal-200 transition-all">{preset.label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
