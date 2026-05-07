'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// Backend integration point: fetch from /api/v1/metrics/history?metric=mape&runs=8
const mapeHistory = [
  { run: 'Run 1\nApr 8', avgMape: 9.12, minMape: 4.2, maxMape: 18.4 },
  { run: 'Run 2\nApr 15', avgMape: 8.74, minMape: 3.9, maxMape: 17.1 },
  { run: 'Run 3\nApr 22', avgMape: 8.41, minMape: 3.7, maxMape: 16.8 },
  { run: 'Run 4\nApr 29', avgMape: 8.93, minMape: 4.1, maxMape: 17.9 },
  { run: 'Run 5\nMay 6', avgMape: 8.21, minMape: 3.5, maxMape: 15.6 },
  { run: 'Run 6\nMay 13', avgMape: 7.88, minMape: 3.2, maxMape: 14.9 },
  { run: 'Run 7\nMay 20', avgMape: 7.64, minMape: 3.0, maxMape: 14.2 },
  { run: 'Run 8\nMay 27', avgMape: 7.43, minMape: 2.8, maxMape: 13.7 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
        <p className="font-semibold text-foreground mb-2">{label.replace('\n', ' ')}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Avg MAPE</span>
            <span className="font-mono font-semibold text-primary">
              {payload[1]?.value}%
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Min</span>
            <span className="font-mono text-accent">{payload[0]?.payload?.minMape}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Max</span>
            <span className="font-mono text-warning">{payload[0]?.payload?.maxMape}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function MapeDistributionChart() {
  return (
    <div className="metric-card h-full">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">MAPE Trend</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Avg MAPE across 8 training runs
        </p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={mapeHistory} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="mapeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="run"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            domain={[0, 12]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={10}
            stroke="var(--warning)"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{ value: '10% threshold', fill: 'var(--warning)', fontSize: 9, position: 'insideTopRight' }}
          />
          <Area
            type="monotone"
            dataKey="avgMape"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#mapeGradient)"
            dot={{ fill: 'var(--primary)', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-3 pt-3 border-t border-border flex justify-between text-2xs text-muted-foreground">
        <span>8 training runs shown</span>
        <span className="text-accent font-medium">↓ 1.69% improvement</span>
      </div>
    </div>
  );
}