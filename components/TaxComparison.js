'use client';

function formatINR(num) {
  if (num == null || isNaN(num)) return '₹0';
  return '₹' + Math.round(num).toLocaleString('en-IN');
}

function StepRow({ step, isWinner }) {
  return (
    <div className={`flex items-start gap-3 py-2.5 px-3 rounded-lg text-sm ${
      isWinner ? 'bg-teal-500/5' : ''
    }`}>
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-navy-50/60">
        {step.step}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-400/60">
            {step.section}
          </span>
        </div>
        <p className="text-xs text-navy-50/70 mt-0.5">{step.description}</p>
      </div>
      <span className={`flex-shrink-0 text-xs font-mono font-semibold ${
        step.amount < 0 ? 'text-red-400/80' : step.amount > 0 ? 'text-teal-300' : 'text-navy-50/50'
      }`}>
        {step.amount < 0 ? '−' : ''}{formatINR(Math.abs(step.amount))}
      </span>
    </div>
  );
}

export default function TaxComparison({ oldRegime, newRegime, recommendation, savings }) {
  if (!oldRegime || !newRegime) return null;

  const winner = recommendation || (oldRegime.totalTax <= newRegime.totalTax ? 'old' : 'new');

  return (
    <div className="space-y-6">
      {/* Savings Badge */}
      <div className="text-center animate-fade-rise">
        <div className="inline-flex items-center gap-3 glass-card rounded-full px-6 py-3">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-sm font-semibold text-teal-200">
              Choose {winner === 'old' ? 'Old' : 'New'} Regime
            </p>
            <p className="text-lg font-serif font-bold text-amber-300">
              Save {formatINR(savings || Math.abs(oldRegime.totalTax - newRegime.totalTax))}
            </p>
          </div>
        </div>
      </div>

      {/* Side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Old Regime */}
        <div className={`glass-card rounded-xl overflow-hidden ${winner === 'old' ? 'ring-1 ring-teal-500/30' : ''}`}>
          <div className={`px-4 py-3 flex items-center justify-between ${
            winner === 'old' ? 'bg-teal-500/10' : 'bg-surface-container-high/50'
          }`}>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-navy-50">Old Regime</h3>
              {winner === 'old' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">
                  RECOMMENDED
                </span>
              )}
            </div>
            <span className="text-lg font-serif font-bold text-navy-50">
              {formatINR(oldRegime.totalTax)}
            </span>
          </div>
          <div className="p-3 space-y-0.5 max-h-[400px] overflow-y-auto">
            {oldRegime.steps?.map((step, idx) => (
              <StepRow key={idx} step={step} isWinner={winner === 'old'} />
            ))}
          </div>
          <div className="px-4 py-3 bg-surface-container-low/50 border-t border-navy-50/5">
            <div className="flex justify-between text-xs">
              <span className="text-navy-50/50">Taxable Income</span>
              <span className="font-semibold text-navy-50">{formatINR(oldRegime.taxableIncome)}</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-navy-50/50">Tax + Cess</span>
              <span className="font-semibold text-navy-50">{formatINR(oldRegime.totalTax)}</span>
            </div>
          </div>
        </div>

        {/* New Regime */}
        <div className={`glass-card rounded-xl overflow-hidden ${winner === 'new' ? 'ring-1 ring-teal-500/30' : ''}`}>
          <div className={`px-4 py-3 flex items-center justify-between ${
            winner === 'new' ? 'bg-teal-500/10' : 'bg-surface-container-high/50'
          }`}>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-navy-50">New Regime</h3>
              {winner === 'new' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">
                  RECOMMENDED
                </span>
              )}
            </div>
            <span className="text-lg font-serif font-bold text-navy-50">
              {formatINR(newRegime.totalTax)}
            </span>
          </div>
          <div className="p-3 space-y-0.5 max-h-[400px] overflow-y-auto">
            {newRegime.steps?.map((step, idx) => (
              <StepRow key={idx} step={step} isWinner={winner === 'new'} />
            ))}
          </div>
          <div className="px-4 py-3 bg-surface-container-low/50 border-t border-navy-50/5">
            <div className="flex justify-between text-xs">
              <span className="text-navy-50/50">Taxable Income</span>
              <span className="font-semibold text-navy-50">{formatINR(newRegime.taxableIncome)}</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-navy-50/50">Tax + Cess</span>
              <span className="font-semibold text-navy-50">{formatINR(newRegime.totalTax)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
