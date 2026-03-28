'use client';

import { useState, useEffect } from 'react';

export default function AuditTrailPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [warning, setWarning] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set('module', filter);
      params.set('limit', '100');
      const res = await fetch(`/api/audit-trail?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
      if (data.warning) setWarning(data.warning);
    } catch (err) {
      setWarning('Could not fetch audit logs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const modules = ['health-score', 'fire-planner', 'tax-wizard', 'mf-xray', 'couples-planner'];

  const agentColors = {
    DataCollector: 'text-blue-400',
    Calculator: 'text-teal-400',
    AIAdvisor: 'text-purple-400',
    Compliance: 'text-amber-400',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10 animate-fade-rise">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy-50 mb-2">Audit Trail</h1>
        <p className="text-sm text-navy-50/50">Complete log of all agent activities and calculations.</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!filter ? 'gradient-cta text-white' : 'glass-card text-navy-50/60 hover:text-teal-200'}`}>
          All
        </button>
        {modules.map((mod) => (
          <button key={mod} onClick={() => setFilter(mod)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${filter === mod ? 'gradient-cta text-white' : 'glass-card text-navy-50/60 hover:text-teal-200'}`}>
            {mod.replace('-', ' ')}
          </button>
        ))}
      </div>

      {warning && (
        <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-400/20 text-sm text-amber-300 mb-6">
          ⚠️ {warning}
        </div>
      )}

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-navy-50/40">
            <span className="inline-block w-5 h-5 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin mr-2" />
            Loading audit logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-navy-50/40 mb-2">No audit logs yet.</p>
            <p className="text-xs text-navy-50/30">Use any module to generate agent activity logs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-navy-50/10 bg-surface-container-high/30">
                  <th className="text-left py-3 px-4 font-semibold text-navy-50/60">Timestamp</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-50/60">Module</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-50/60">Agent</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-50/60">Action</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-50/60">Details</th>
                  <th className="text-right py-3 px-4 font-semibold text-navy-50/60">Time (ms)</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={log._id || idx} className="border-b border-navy-50/5 hover:bg-surface-container-high/20 transition-colors">
                    <td className="py-2.5 px-4 text-navy-50/40 whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 text-[10px] font-medium capitalize">
                        {log.module?.replace('-', ' ')}
                      </span>
                    </td>
                    <td className={`py-2.5 px-4 font-medium ${agentColors[log.agentName] || 'text-navy-50/60'}`}>
                      {log.agentName}
                    </td>
                    <td className="py-2.5 px-4 text-navy-50/60">{log.action}</td>
                    <td className="py-2.5 px-4 text-navy-50/40 max-w-[200px] truncate">{log.outputSummary || log.inputSummary}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-navy-50/40">{log.processingTimeMs}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-navy-50/30 text-center">
        Showing {logs.length} entries
      </div>
    </div>
  );
}
