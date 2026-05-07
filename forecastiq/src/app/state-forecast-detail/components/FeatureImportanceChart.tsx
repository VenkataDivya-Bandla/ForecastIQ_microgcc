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
} from 'recharts';

// Backend integration point: fetch from /api/v1/models/CA/xgboost/feature-importance
const featureData = [
  { feature: 'lag_t1', importance: 0.312, category: 'lag' },
  { feature: 'lag_t7', importance: 0.241, category: 'lag' },
  { feature: 'rolling_mean_4w', importance: 0.187, category: 'rolling' },
  { feature: 'lag_t30', importance: 0.098, category: 'lag' },
  { feature: 'rolling_std_4w', importance: 0.072, category: 'rolling' },
  { feature: 'week_of_year', importance: 0.041, category: 'calendar' },
  { feature: 'month', importance: 0.024, category: 'calendar' },
  { feature: 'is_holiday', importance: 0.016, category: 'calendar' },
  { feature: 'day_of_week', importance: 0.009, category: 'calendar' },
];

const categoryColor: Record<string, string> = {
  lag: 'var(--primary)',
  rolling: 'var(--chart-2)',
  calendar: 'var(--chart-3)',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="font-mono font-semibold text-foreground mb-1">{label}</p>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Importance</span>
        <span className="font-mono font-semibold text-foreground">
          {(payload[0].value * 100).toFixed(1)}%
        </span>
      </div>
      <p className="text-2xs text-muted-foreground mt-1 capitalize">
        Category: {payload[0].payload.category}
      </p>
    </div>
  );
};

export default function FeatureImportanceChart() {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Feature Importance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            XGBoost gain-based importance scores
          </p>
        </div>
        <div className="flex items-center gap-3 text-2xs text-muted-foreground">
          {Object.entries(categoryColor).map(([cat, color]) => (
            <div key={`fi-legend-${cat}`} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
              <span className="capitalize">{cat}</span>
            </div>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={featureData}
          layout="vertical"
          margin={{ top: 0, right: 48, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="feature"
            tick={{ fill: 'var(--foreground)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            width={96}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30,41,59,0.4)' }} />
          <Bar dataKey="importance" radius={[0, 3, 3, 0]} maxBarSize={18}>
            {featureData.map((entry) => (
              <Cell key={`fi-cell-${entry.feature}`} fill={categoryColor[entry.category]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 pt-3 border-t border-border text-2xs text-muted-foreground">
        Lag features account for{' '}
        <span className="font-mono text-primary font-semibold">65.1%</span> of total importance
      </div>
    </div>
  );
}