'use client';

import React, { useMemo, useState } from 'react';
import { Copy, CheckCheck } from 'lucide-react';
import type { ApiForecastRow } from '@/lib/forecastApi';

function fmt(n: number | null | undefined) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—';
  return n.toLocaleString();
}

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function PredictionTable({
  selectedModel,
  forecast,
}: {
  selectedModel?: string;
  forecast: ApiForecastRow[];
}) {
  const [copied, setCopied] = useState(false);

  const rows = useMemo(() => {
    return (forecast || []).map((p, idx) => {
      const start = p.week_start;
      const end = addDays(start, 6);
      const prev = idx > 0 ? forecast[idx - 1]?.point_forecast : null;
      const change =
        typeof p.point_forecast === 'number' && typeof prev === 'number' && prev !== 0
          ? ((p.point_forecast - prev) / prev) * 100
          : null;
      return {
        id: `pred-w${p.week}`,
        week: `Week ${p.week}`,
        dateRange: `${start} – ${end}`,
        point: p.point_forecast,
        ci80lo: p.ci_80_lower,
        ci80hi: p.ci_80_upper,
        ci95lo: p.ci_95_lower,
        ci95hi: p.ci_95_upper,
        change,
      };
    });
  }, [forecast]);

  const handleCopy = () => {
    const csv = [
      'Week,Date Range,Point Forecast,80% CI Low,80% CI High,95% CI Low,95% CI High,WoW Change',
      ...rows?.map(
        (p) =>
          `${p?.week},${p?.dateRange},${p?.point ?? ''},${p?.ci80lo ?? ''},${p?.ci80hi ?? ''},${p?.ci95lo ?? ''},${p?.ci95hi ?? ''},${p?.change ?? ''}`
      ),
    ]?.join('\n');
    navigator.clipboard?.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="metric-card h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">8-Week Forecast — Raw Predictions</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {selectedModel || 'Model'} · point estimates + confidence intervals
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="btn-secondary text-xs"
        >
          {copied ? <CheckCheck size={13} className="text-accent" /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy CSV'}
        </button>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="data-table">
          <thead>
            <tr>
              <th>Week</th>
              <th>Date Range</th>
              <th>Point Forecast</th>
              <th>80% CI Low</th>
              <th>80% CI High</th>
              <th>95% CI Low</th>
              <th>95% CI High</th>
              <th>WoW Δ</th>
            </tr>
          </thead>
          <tbody>
            {rows?.map((p) => {
              const isNeg = typeof p?.change === 'number' && p.change < 0;
              return (
                <tr key={p?.id} className="row-hover">
                  <td>
                    <span className="text-xs font-medium text-foreground">{p?.week}</span>
                  </td>
                  <td>
                    <span className="font-mono text-2xs text-muted-foreground">{p?.dateRange}</span>
                  </td>
                  <td>
                    <span className="font-mono text-xs font-semibold text-warning tabular-nums">
                      {fmt(p?.point)}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-2xs text-muted-foreground tabular-nums">
                      {fmt(p?.ci80lo)}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-2xs text-muted-foreground tabular-nums">
                      {fmt(p?.ci80hi)}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-2xs text-muted-foreground/70 tabular-nums">
                      {fmt(p?.ci95lo)}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-2xs text-muted-foreground/70 tabular-nums">
                      {fmt(p?.ci95hi)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`font-mono text-xs font-medium tabular-nums ${
                        isNeg ? 'text-destructive' : 'text-accent'
                      }`}
                    >
                      {typeof p?.change === 'number' ? `${p.change >= 0 ? '+' : ''}${p.change.toFixed(2)}%` : '—'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-4 text-2xs text-muted-foreground">
        <span>
          Total 8-week forecast:{' '}
          <span className="font-mono text-warning font-semibold">
            {Math.round((rows || []).reduce((s, p) => s + (typeof p.point === 'number' ? p.point : 0), 0))?.toLocaleString()} units
          </span>
        </span>
        <span>
          Avg weekly:{' '}
          <span className="font-mono text-foreground">
            {rows.length ? Math.round((rows || []).reduce((s, p) => s + (typeof p.point === 'number' ? p.point : 0), 0) / rows.length)?.toLocaleString() : '—'} units
          </span>
        </span>
      </div>
    </div>
  );
}