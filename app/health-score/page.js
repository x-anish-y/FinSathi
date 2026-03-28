'use client';

import { useState } from 'react';
import RadarChartComponent from '@/components/RadarChart';
import AgentActivityPanel from '@/components/AgentActivityPanel';
import SEBIDisclaimer from '@/components/SEBIDisclaimer';

const QUESTIONS = [
  { id: 'emergencyMonths', label: 'How many months of expenses do you have in liquid savings?', type: 'select', options: [{ value: '0', label: '0 months' }, { value: '1', label: '1-2 months' }, { value: '3', label: '3-6 months' }, { value: '6', label: '6+ months' }], dimension: 'Emergency Preparedness' },
  { id: 'hasTermInsurance', label: 'Do you have a term life insurance policy?', type: 'select', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], dimension: 'Insurance Coverage' },
  { id: 'sumAssuredMultiple', label: 'If yes, sum assured is how many times your annual income?', type: 'select', options: [{ value: '0', label: 'N/A' }, { value: '5', label: '~5x' }, { value: '10', label: '~10x' }, { value: '15', label: '15x+' }], dimension: 'Insurance Coverage' },
  { id: 'investmentType', label: 'Where is your money currently invested?', type: 'select', options: [{ value: 'fd_only', label: 'FD Only' }, { value: 'fd_mf', label: 'FD + Mutual Funds' }, { value: 'mf_stocks', label: 'MF + Stocks' }, { value: 'mf_stocks_gold', label: 'MF + Stocks + Gold' }], dimension: 'Diversification' },
  { id: 'emiPercentage', label: 'What % of monthly income goes to EMI?', type: 'select', options: [{ value: '0', label: '0%' }, { value: '10_20', label: '10-20%' }, { value: '20_30', label: '20-30%' }, { value: '30_50', label: '30-50%' }, { value: '50_plus', label: '50%+' }], dimension: 'Debt Health' },
  { id: 'paysFullCreditCard', label: 'Do you pay your full credit card bill monthly?', type: 'select', options: [{ value: 'yes', label: 'Yes / No credit card' }, { value: 'no', label: 'No, carry balance' }], dimension: 'Debt Health' },
  { id: 'has80C', label: 'Have you invested full ₹1.5L under Section 80C?', type: 'select', options: [{ value: 'yes', label: 'Yes, fully maxed' }, { value: 'partial', label: 'Partially' }, { value: 'no', label: 'No' }], dimension: 'Tax Efficiency' },
  { id: 'hasHRA', label: 'Are you claiming HRA exemption?', type: 'select', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'na', label: 'Not applicable' }], dimension: 'Tax Efficiency' },
  { id: 'targetCorpusCr', label: 'Target retirement corpus (in Crores)?', type: 'number', placeholder: '5', dimension: 'Retirement' },
  { id: 'currentAge', label: 'Current age?', type: 'number', placeholder: '30', dimension: 'Retirement' },
  { id: 'hasHealthInsurance', label: 'Do you have health insurance beyond employer?', type: 'select', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], dimension: 'Insurance Coverage' },
  { id: 'hasWill', label: 'Have you made a will or nominee assignment?', type: 'select', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], dimension: 'Retirement' },
];

const dimensionLabels = { emergency_preparedness: 'Emergency Fund', insurance_coverage: 'Insurance', investment_diversification: 'Diversification', debt_health: 'Debt Health', tax_efficiency: 'Tax Efficiency', retirement_readiness: 'Retirement' };

function getScoreColor(score) {
  if (score >= 75) return 'text-teal-300';
  if (score >= 50) return 'text-amber-300';
  return 'text-red-400';
}

export default function HealthScorePage() {
  const [answers, setAnswers] = useState({ retirementAge: '60', monthlySIP: '10000', currentSavings: '500000', currentAge: '30', targetCorpusCr: '5' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agentSteps, setAgentSteps] = useState([]);
  const [step, setStep] = useState(0);

  const handleChange = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    // Pre-submit validation for required fields
    const required = ['emergencyMonths', 'hasTermInsurance', 'investmentType', 'emiPercentage', 'has80C', 'currentAge'];
    const missing = required.filter(f => !answers[f] && answers[f] !== '0');
    if (missing.length > 0) {
      alert('Please answer all questions before submitting. Go back and check: ' + missing.map(f => QUESTIONS.find(q => q.id === f)?.dimension || f).join(', '));
      return;
    }

    setLoading(true);
    setAgentSteps([{ agentId: 'data-collector', active: true, message: 'Validating responses...' }]);

    try {
      const payload = { ...answers, currentAge: parseInt(answers.currentAge) || 30, retirementAge: parseInt(answers.retirementAge) || 60 };
      const res = await fetch('/api/health-score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setResults(data);
      setAgentSteps(data.agentTimeline || []);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentQ = QUESTIONS[step];
  const isLastStep = step === QUESTIONS.length - 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10 animate-fade-rise">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy-50 mb-2">Money Health Score</h1>
        <p className="text-sm text-navy-50/50">Answer 12 questions to get your personalized financial health diagnosis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {!results ? (
            <div className="glass-card rounded-2xl p-6 md:p-8">
              {/* Progress */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex-1 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full rounded-full gradient-cta transition-all duration-500" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
                </div>
                <span className="text-xs text-navy-50/40 font-mono">{step + 1}/{QUESTIONS.length}</span>
              </div>

              {/* Current Question */}
              <div className="min-h-[200px] animate-fade-rise" key={step}>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-400/60 mb-3 block">{currentQ.dimension}</span>
                <h2 className="font-serif text-xl md:text-2xl font-semibold text-navy-50 mb-6">{currentQ.label}</h2>

                {currentQ.type === 'select' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQ.options.map((opt) => (
                      <button key={opt.value} onClick={() => handleChange(currentQ.id, opt.value)}
                        className={`text-left p-4 rounded-xl border transition-all duration-200 ${answers[currentQ.id] === opt.value ? 'border-teal-500/50 bg-teal-500/10 text-teal-200' : 'border-navy-50/10 bg-surface-container-high/30 text-navy-50/70 hover:border-teal-500/20 hover:bg-surface-container-high/50'}`}>
                        <span className="text-sm font-medium">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <input type="number" placeholder={currentQ.placeholder} value={answers[currentQ.id] || ''} onChange={(e) => handleChange(currentQ.id, e.target.value)}
                    className="w-full max-w-xs p-3 rounded-xl bg-surface-container-lowest border border-navy-50/10 text-navy-50 text-lg" />
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
                  className="text-xs text-navy-50/40 hover:text-teal-300 disabled:opacity-30 transition-colors">← Previous</button>
                {isLastStep ? (
                  <button onClick={handleSubmit} disabled={loading}
                    className="gradient-cta text-white font-semibold px-6 py-2.5 rounded-full text-sm hover:shadow-glow-teal transition-all disabled:opacity-50">
                    {loading ? 'Analyzing...' : 'Get My Score'}
                  </button>
                ) : (
                  <button onClick={() => setStep(s => Math.min(QUESTIONS.length - 1, s + 1))}
                    className="gradient-cta text-white font-medium px-6 py-2.5 rounded-full text-sm hover:shadow-glow-teal transition-all">
                    Next →
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-rise">
              {/* Total Score */}
              <div className="glass-card rounded-2xl p-8 text-center">
                <p className="text-sm text-navy-50/50 mb-2">Your Financial Health Score</p>
                <p className={`font-serif text-6xl font-bold ${getScoreColor(results.totalScore)}`}>{results.totalScore}<span className="text-2xl text-navy-50/30">/100</span></p>
              </div>

              {/* Radar Chart */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-navy-50 mb-4">Dimension Breakdown</h3>
                <RadarChartComponent scores={results.scores} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {Object.entries(results.scores || {}).map(([key, val]) => (
                    <div key={key} className="text-center p-3 rounded-lg bg-surface-container-high/30">
                      <p className="text-xs text-navy-50/50 mb-1">{dimensionLabels[key] || key}</p>
                      <p className={`text-lg font-serif font-bold ${getScoreColor(val)}`}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Actions */}
              {results.aiNarrative?.actions && (
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-navy-50 mb-4">🎯 Priority Action Plan</h3>
                  <div className="space-y-3">
                    {results.aiNarrative.actions.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-high/30">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full gradient-cta flex items-center justify-center text-xs font-bold text-white">
                          {action.priority}
                        </span>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-teal-400/60 mb-1">{dimensionLabels[action.dimension] || action.dimension}</p>
                          <p className="text-sm text-navy-50/80">{action.action}</p>
                          <p className="text-xs text-amber-300/60 mt-1">{action.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <SEBIDisclaimer variant="inline" />
                </div>
              )}

              <button onClick={() => { setResults(null); setStep(0); }} className="text-sm text-teal-400 hover:text-teal-200 transition-colors">← Retake Assessment</button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <AgentActivityPanel steps={agentSteps} isProcessing={loading} />
        </div>
      </div>

      <SEBIDisclaimer variant="banner" />
    </div>
  );
}
