'use client';

const AGENTS = [
  { id: 'data-collector', name: 'Data Collector', role: 'Receiving and validating user inputs', icon: '📥' },
  { id: 'calculator', name: 'Calculator', role: 'Running financial calculations', icon: '🧮' },
  { id: 'ai-advisor', name: 'AI Advisor', role: 'Generating personalized recommendations via OpenAI', icon: '🤖' },
  { id: 'compliance', name: 'Compliance', role: 'Applying SEBI regulatory guardrails', icon: '🛡️' },
];

function StatusDot({ status }) {
  if (status === 'complete') {
    return (
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-500/20">
        <svg className="w-3 h-3 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  if (status === 'active') {
    return (
      <span className="relative flex items-center justify-center w-5 h-5">
        <span className="absolute w-5 h-5 rounded-full bg-amber-400/30 animate-ping" />
        <span className="relative w-3 h-3 rounded-full bg-amber-400" />
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center w-5 h-5">
      <span className="w-3 h-3 rounded-full bg-navy-50/20 border border-navy-50/10" />
    </span>
  );
}

export default function AgentActivityPanel({ steps = [], isProcessing = false }) {
  const getAgentStatus = (agentId) => {
    const step = steps.find(s => s.agentId === agentId);
    if (step?.complete) return 'complete';
    if (step?.active) return 'active';
    return 'pending';
  };

  const getAgentMessage = (agentId) => {
    const step = steps.find(s => s.agentId === agentId);
    return step?.message || null;
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-semibold text-teal-200">Agent Pipeline</span>
        {isProcessing && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 animate-pulse-slow">
            PROCESSING
          </span>
        )}
      </div>

      <div className="space-y-3">
        {AGENTS.map((agent, idx) => {
          const status = getAgentStatus(agent.id);
          const message = getAgentMessage(agent.id);

          return (
            <div key={agent.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <StatusDot status={status} />
                {idx < AGENTS.length - 1 && (
                  <div className={`w-px h-6 mt-1 ${
                    status === 'complete' ? 'bg-teal-500/40' : 'bg-navy-50/10'
                  }`} />
                )}
              </div>
              <div className="flex-1 min-w-0 -mt-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{agent.icon}</span>
                  <span className={`text-xs font-medium ${
                    status === 'complete' ? 'text-teal-300' :
                    status === 'active' ? 'text-amber-300' :
                    'text-navy-50/50'
                  }`}>
                    {agent.name}
                  </span>
                </div>
                <p className="text-[11px] text-navy-50/40 mt-0.5 truncate">
                  {message || agent.role}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
