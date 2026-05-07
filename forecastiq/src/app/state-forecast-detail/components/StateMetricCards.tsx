import React from 'react';

function fmtNumber(v: unknown) {
  if (typeof v !== 'number' || Number.isNaN(v)) return '—';
  return v.toLocaleString();
}

function fmtPct(v: unknown, digits = 2) {
  if (typeof v !== 'number' || Number.isNaN(v)) return '—';
  return `${v.toFixed(digits)}%`;
}

const accentMap: Record<string, string> = {
  green: 'text-accent',
  warning: 'text-warning',
  blue: 'text-primary',
  error: 'text-destructive',
};

export default function StateMetricCards({
  selectedModel,
  metrics,
  horizonWeeks = 8,
}: {
  selectedModel?: string;
  metrics?: Record<string, unknown>;
  horizonWeeks?: number;
}) {
  const mape = metrics?.mape;
  const rmse = metrics?.rmse;
  const mae = metrics?.mae;

  const cards = [
    {
      id: 'smc-mape',
      label: 'MAPE (Best Model)',
      value: fmtPct(mape, 2),
      sub: selectedModel ? `${selectedModel} · validation set` : 'validation set',
      accent: 'green',
    },
    {
      id: 'smc-rmse',
      label: 'RMSE',
      value: fmtNumber(rmse),
      sub: 'units · weekly sales',
      accent: 'green',
    },
    {
      id: 'smc-mae',
      label: 'MAE',
      value: fmtNumber(mae),
      sub: 'units · weekly sales',
      accent: 'warning',
    },
    {
      id: 'smc-horizon',
      label: 'Forecast Horizon',
      value: `${horizonWeeks} weeks`,
      sub: 'next 8 weeks',
      accent: 'blue',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-3">
      {cards.map((m) => (
        <div key={m.id} className="metric-card py-4 px-5">
          <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
            {m.label}
          </p>
          <p className={`text-2xl font-bold tabular-nums mb-1 ${accentMap[m.accent]}`}>
            {m.value}
          </p>
          <p className="text-2xs text-muted-foreground">{m.sub}</p>
        </div>
      ))}
    </div>
  );
}