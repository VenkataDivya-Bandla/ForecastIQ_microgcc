'use client';

import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// Backend integration point: fetch from /api/v1/forecasts/CA/diagnostics
const residualsData = [
  { week: 'Jan 6', residual: 316, pct: 1.71 },
  { week: 'Jan 13', residual: 328, pct: 1.70 },
  { week: 'Jan 20', residual: -381, pct: -2.14 },
  { week: 'Jan 27', residual: 264, pct: 1.31 },
  { week: 'Feb 3', residual: 359, pct: 1.68 },
  { week: 'Feb 10', residual: -254, pct: -1.28 },
  { week: 'Feb 17', residual: 427, pct: 1.90 },
  { week: 'Feb 24', residual: -224, pct: -1.07 },
  { week: 'Mar 3', residual: 299, pct: 1.29 },
  { week: 'Mar 10', residual: -343, pct: -1.58 },
  { week: 'Mar 17', residual: 468, pct: 1.92 },
  { week: 'Mar 24', residual: -301, pct: -1.31 },
  { week: 'Mar 31', residual: 339, pct: 1.35 },
  { week: 'Apr 7', residual: -262, pct: -1.10 },
  { week: 'Apr 14', residual: 449, pct: 1.70 },
  { week: 'Apr 21', residual: -261, pct: -1.04 },
  { week: 'Apr 28', residual: 487, pct: 1.78 },
  { week: 'May 5', residual: -264, pct: -1.02 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-2">Week of {label}</p>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Residual</span>
        <span className={`font-mono font-semibold ${d.residual >= 0 ? 'text-accent' : 'text-destructive'}`}>
          {d.residual > 0 ? '+' : ''}{d.residual.toLocaleString()}
        </span>
      </div>
      <div className="flex justify-between gap-4 mt-1">
        <span className="text-muted-foreground">% Error</span>
        <span className={`font-mono ${d.pct >= 0 ? 'text-accent' : 'text-destructive'}`}>
          {d.pct > 0 ? '+' : ''}{d.pct.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

export default function ResidualsChart() {
  return (
    <div className="metric-card">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">Model Residuals</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Actual − Fitted · no systematic bias indicates good fit
        </p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={residualsData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="week"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            interval={3}
          />
          <YAxis
            tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v > 0 ? `+${v}` : `${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeWidth={1} />
          <Bar
            dataKey="residual"
            radius={[2, 2, 0, 0]}
            maxBarSize={14}
            fill="var(--primary)"
            fillOpacity={0.7}
          />
          <Line
            type="monotone"
            dataKey="residual"
            stroke="var(--chart-4)"
            strokeWidth={1}
            dot={false}
            strokeDasharray="3 2"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-3 pt-3 border-t border-border flex gap-4 text-2xs text-muted-foreground">
        <span>Mean residual: <span className="font-mono text-accent">+42.1</span></span>
        <span>Std dev: <span className="font-mono text-foreground">348.2</span></span>
        <span>Max abs: <span className="font-mono text-warning">487</span></span>
      </div>
    </div>
  );
}