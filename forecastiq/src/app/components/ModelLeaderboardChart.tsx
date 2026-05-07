'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

// Backend integration point: fetch from /api/v1/models/leaderboard
const leaderboardData = [
  { model: 'XGBoost', avgMape: 6.84, avgRmse: 1243, states: 21, color: 'var(--chart-3)' },
  { model: 'Prophet', avgMape: 7.12, avgRmse: 1318, states: 16, color: 'var(--chart-2)' },
  { model: 'LSTM', avgMape: 7.91, avgRmse: 1402, states: 8, color: 'var(--chart-4)' },
  { model: 'ARIMA', avgMape: 9.34, avgRmse: 1687, states: 4, color: 'var(--chart-1)' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Avg MAPE</span>
            <span className="font-mono font-semibold text-foreground">{d.avgMape}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Avg RMSE</span>
            <span className="font-mono font-semibold text-foreground">{d.avgRmse.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">States Selected</span>
            <span className="font-mono font-semibold text-foreground">{d.states}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function ModelLeaderboardChart() {
  return (
    <div className="metric-card h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Model Leaderboard</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Average MAPE by algorithm — lower is better
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-2xs text-muted-foreground bg-muted/30 px-2 py-1 rounded border border-border">
          <span>49 states</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={leaderboardData}
          layout="vertical"
          margin={{ top: 0, right: 60, left: 8, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, 12]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="model"
            tick={{ fill: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30,41,59,0.4)' }} />
          <Bar dataKey="avgMape" radius={[0, 4, 4, 0]} maxBarSize={28}>
            {leaderboardData.map((entry) => (
              <Cell key={`cell-${entry.model}`} fill={entry.color} />
            ))}
            <LabelList
              dataKey="avgMape"
              position="right"
              formatter={(v: number) => `${v}%`}
              style={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-border">
        {leaderboardData.map((d) => (
          <div key={`legend-${d.model}`} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-2xs text-muted-foreground">
              {d.model} ({d.states} states)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}