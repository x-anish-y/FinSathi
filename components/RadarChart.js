'use client';

import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const dimensionLabels = {
  emergency_preparedness: 'Emergency Fund',
  insurance_coverage: 'Insurance',
  investment_diversification: 'Diversification',
  debt_health: 'Debt Health',
  tax_efficiency: 'Tax Efficiency',
  retirement_readiness: 'Retirement',
};

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-lg px-3 py-2">
        <p className="text-xs font-semibold text-teal-200">{payload[0].payload.label}</p>
        <p className="text-sm font-bold text-navy-50">{payload[0].value}/100</p>
      </div>
    );
  }
  return null;
}

export default function RadarChartComponent({ scores = {} }) {
  const data = Object.entries(dimensionLabels).map(([key, label]) => ({
    dimension: key,
    label: label,
    score: scores[key] || 0,
    fullMark: 100,
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid
            stroke="rgba(21, 55, 82, 0.6)"
            strokeWidth={1}
          />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fill: '#88938d', fontSize: 11, fontFamily: 'Inter' }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#88938d', fontSize: 10 }}
            tickCount={5}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#84d6b9"
            strokeWidth={2}
            fill="url(#radarGradient)"
            fillOpacity={0.35}
            dot={{ r: 4, fill: '#84d6b9', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#a0f3d4', stroke: '#0F6E56', strokeWidth: 2 }}
          />
          <defs>
            <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0F6E56" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#84d6b9" stopOpacity={0.2} />
            </radialGradient>
          </defs>
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
