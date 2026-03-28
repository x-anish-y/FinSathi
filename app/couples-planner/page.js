'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import AgentActivityPanel from '@/components/AgentActivityPanel';
import SEBIDisclaimer from '@/components/SEBIDisclaimer';

const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });

function fmtINR(n) { return '₹' + Math.round(n || 0).toLocaleString('en-IN'); }

const EMPTY_PARTNER = {
  monthlyIncome: '', hraComponent: '', monthlyRent: '', isMetroCity: true,
  monthlyExpenses: '', loanEMIs: '', riskProfile: 'moderate',
  existingInvestments: { equityMF: '', ppf: '', nps: '' },
};

export default function CouplesPlannerPage() {
  const [partnerA, setPartnerA] = useState({ ...EMPTY_PARTNER, monthlyIncome: 200000, monthlyExpenses: 60000, hraComponent: 40000, monthlyRent: 25000, existingInvestments: { equityMF: 1500000, ppf: 300000, nps: 200000 } });
  const [partnerB, setPartnerB] = useState({ ...EMPTY_PARTNER, monthlyIncome: 120000, monthlyExpenses: 40000, hraComponent: 25000, monthlyRent: 0, riskProfile: 'conservative', existingInvestments: { equityMF: 800000, ppf: 200000, nps: 100000 } });
  const [sharedGoals, setSharedGoals] = useState({ houseGoal: { targetAmount: 10000000, timelineYears: 7 }, childEducation: { targetAmount: 5000000, timelineYears: 15 } });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agentSteps, setAgentSteps] = useState([]);

  const updatePartner = (setter, field, value, nested) => {
    setter(prev => {
      if (nested) return { ...prev, existingInvestments: { ...prev.existingInvestments, [field]: parseFloat(value) || 0 } };
      if (field === 'isMetroCity') return { ...prev, [field]: value === 'true' };
      if (field === 'riskProfile') return { ...prev, [field]: value };
      return { ...prev, [field]: parseFloat(value) || 0 };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setAgentSteps([{ agentId: 'data-collector', active: true, message: 'Validating couple data...' }]);
    try {
      const res = await fetch('/api/couples-planner', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ partnerA, partnerB, sharedGoals }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data);
      setAgentSteps(data.agentTimeline || []);
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const PartnerForm = ({ partner, setter, label, color }) => (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="text-sm font-semibold mb-4" style={{ color }}>{label}</h3>
      <div className="space-y-3">
        {[['Monthly Income', 'monthlyIncome'], ['HRA Component', 'hraComponent'], ['Monthly Rent', 'monthlyRent'], ['Monthly Expenses', 'monthlyExpenses'], ['Loan EMIs', 'loanEMIs']].map(([lbl, fld]) => (
          <div key={fld}><label className="text-[10px] text-navy-50/40 block mb-1">{lbl}</label>
            <input type="number" value={partner[fld] || ''} onChange={(e) => updatePartner(setter, fld, e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-navy-50/10 text-sm text-navy-50" /></div>
        ))}
        <div><label className="text-[10px] text-navy-50/40 block mb-1">City</label>
          <select value={partner.isMetroCity ? 'true' : 'false'} onChange={(e) => updatePartner(setter, 'isMetroCity', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-navy-50/10 text-sm text-navy-50"><option value="true">Metro</option><option value="false">Non-Metro</option></select></div>
        <div><label className="text-[10px] text-navy-50/40 block mb-1">Risk Profile</label>
          <select value={partner.riskProfile} onChange={(e) => updatePartner(setter, 'riskProfile', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-navy-50/10 text-sm text-navy-50"><option value="conservative">Conservative</option><option value="moderate">Moderate</option><option value="aggressive">Aggressive</option></select></div>
        <p className="text-[10px] text-navy-50/30 mt-3 font-semibold">Existing Investments</p>
        {[['Equity MF', 'equityMF'], ['PPF', 'ppf'], ['NPS', 'nps']].map(([lbl, fld]) => (
          <div key={fld}><label className="text-[10px] text-navy-50/40 block mb-1">{lbl}</label>
            <input type="number" value={partner.existingInvestments[fld] || ''} onChange={(e) => updatePartner(setter, fld, e.target.value, true)} className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-navy-50/10 text-sm text-navy-50" /></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10 animate-fade-rise">
        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-teal-400/70 mb-2 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20">India&apos;s First AI-Powered Joint Planner</span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy-50 mb-2">Couple&apos;s Money Planner</h1>
        <p className="text-sm text-navy-50/50">Optimize taxes, investments, and goals as a team.</p>
      </div>
      <SEBIDisclaimer variant="banner" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PartnerForm partner={partnerA} setter={setPartnerA} label="💁 Partner A" color="#84d6b9" />
            <PartnerForm partner={partnerB} setter={setPartnerB} label="💁‍♂️ Partner B" color="#ffb95d" />
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-navy-50 mb-4">🎯 Shared Goals</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] text-navy-50/40 block mb-1">House Target (₹)</label>
                <input type="number" value={sharedGoals.houseGoal.targetAmount || ''} onChange={(e) => setSharedGoals(p => ({ ...p, houseGoal: { ...p.houseGoal, targetAmount: parseFloat(e.target.value) || 0 } }))} className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-navy-50/10 text-sm text-navy-50" /></div>
              <div><label className="text-[10px] text-navy-50/40 block mb-1">House Timeline (years)</label>
                <input type="number" value={sharedGoals.houseGoal.timelineYears || ''} onChange={(e) => setSharedGoals(p => ({ ...p, houseGoal: { ...p.houseGoal, timelineYears: parseInt(e.target.value) || 0 } }))} className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-navy-50/10 text-sm text-navy-50" /></div>
              <div><label className="text-[10px] text-navy-50/40 block mb-1">Child Education Target (₹)</label>
                <input type="number" value={sharedGoals.childEducation.targetAmount || ''} onChange={(e) => setSharedGoals(p => ({ ...p, childEducation: { ...p.childEducation, targetAmount: parseFloat(e.target.value) || 0 } }))} className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-navy-50/10 text-sm text-navy-50" /></div>
              <div><label className="text-[10px] text-navy-50/40 block mb-1">Education Timeline (years)</label>
                <input type="number" value={sharedGoals.childEducation.timelineYears || ''} onChange={(e) => setSharedGoals(p => ({ ...p, childEducation: { ...p.childEducation, timelineYears: parseInt(e.target.value) || 0 } }))} className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-navy-50/10 text-sm text-navy-50" /></div>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading} className="gradient-cta text-white font-semibold px-8 py-3 rounded-full text-sm hover:shadow-glow-teal transition-all disabled:opacity-50">{loading ? 'Optimizing...' : '🧮 Optimize Joint Finances'}</button>

          {results && (
            <div className="space-y-6 animate-fade-rise">
              {results.hraOptimization && <div className="glass-card rounded-xl p-5"><h3 className="text-sm font-semibold text-navy-50 mb-2">🏠 HRA Optimization</h3><p className="text-sm text-navy-50/70">{results.hraOptimization.recommendation}</p></div>}
              {results.taxBracketOptimization && <div className="glass-card rounded-xl p-5"><h3 className="text-sm font-semibold text-navy-50 mb-2">📊 Tax Bracket Optimization</h3><p className="text-sm text-navy-50/70">{results.taxBracketOptimization.fdRecommendation}</p><div className="flex gap-4 mt-2 text-xs text-navy-50/50"><span>Partner A: {results.taxBracketOptimization.partnerA.taxRate}% bracket</span><span>Partner B: {results.taxBracketOptimization.partnerB.taxRate}% bracket</span></div></div>}
              {results.jointNPS && <div className="glass-card rounded-xl p-5"><h3 className="text-sm font-semibold text-navy-50 mb-2">🏦 Joint NPS Benefit</h3><p className="text-sm text-navy-50/70">{results.jointNPS.summary}</p></div>}
              {results.sipSplit?.goalSIPs?.length > 0 && (
                <div className="glass-card rounded-xl p-5"><h3 className="text-sm font-semibold text-navy-50 mb-3">📈 Goal-Based SIP Plan</h3>
                  <div className="space-y-2">{results.sipSplit.goalSIPs.map((g, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high/30"><div><p className="text-xs font-medium text-navy-50/80">{g.goal}</p><p className="text-[10px] text-navy-50/40">Target: {fmtINR(g.target)} in {g.timeline} years</p></div><p className="text-sm font-bold text-amber-300">{fmtINR(g.monthlySIP)}/mo</p></div>
                  ))}</div></div>)}
              {results.combinedNetWorth && (
                <div className="glass-card rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-navy-50 mb-3">💰 Combined Net Worth: <span className="text-gradient-teal">{fmtINR(results.combinedNetWorth.netWorth)}</span></h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.combinedNetWorth.chartData}><XAxis dataKey="name" tick={{ fill: '#88938d', fontSize: 10 }} /><YAxis tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} tick={{ fill: '#88938d', fontSize: 10 }} /><Tooltip /><Bar dataKey="value" radius={[4,4,0,0]}>{results.combinedNetWorth.chartData?.map((e,i) => <rect key={i} fill={e.fill} />)}</Bar></BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              {results.aiNarrative && <div className="glass-card rounded-xl p-5"><h3 className="text-sm font-semibold text-navy-50 mb-3">🤖 AI Joint Financial Plan</h3><p className="text-sm text-navy-50/70 leading-relaxed whitespace-pre-line">{results.aiNarrative}</p><SEBIDisclaimer variant="inline" /></div>}
            </div>
          )}
        </div>
        <div><AgentActivityPanel steps={agentSteps} isProcessing={loading} /></div>
      </div>
    </div>
  );
}
