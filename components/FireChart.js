'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

function formatCrores(value) {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  return `₹${value.toLocaleString('en-IN')}`;
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-lg px-4 py-3 min-w-[180px]">
        <p className="text-xs text-navy-50/60 mb-2">Age {label}</p>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 mb-1">
            <span className="text-xs" style={{ color: entry.color }}>
              {entry.name}
            </span>
            <span className="text-xs font-semibold text-navy-50">
              {formatCrores(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function FireChart({ data = [], targetCorpus = 0 }) {
  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="corpusGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F6E56" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#0F6E56" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF9F27" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#EF9F27" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(21, 55, 82, 0.4)" />
          <XAxis
            dataKey="age"
            tick={{ fill: '#88938d', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(21, 55, 82, 0.6)' }}
            label={{ value: 'Age', position: 'insideBottom', offset: -5, fill: '#88938d', fontSize: 11 }}
          />
          <YAxis
            tickFormatter={formatCrores}
            tick={{ fill: '#88938d', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(21, 55, 82, 0.6)' }}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="target"
            name="Target"
            stroke="#EF9F27"
            strokeWidth={2}
            strokeDasharray="8 4"
            fill="url(#targetGradient)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="corpus"
            name="Projected"
            stroke="#84d6b9"
            strokeWidth={2.5}
            fill="url(#corpusGradient)"
            dot={false}
            activeDot={{ r: 5, fill: '#a0f3d4', stroke: '#0F6E56', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
