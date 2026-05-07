'use client';

import React, { useMemo, useState } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,  } from 'recharts';

export type ForecastChartRow = {
  week: string;
  forecast?: number | null;
  ci80lo?: number | null;
  ci80hi?: number | null;
  ci95lo?: number | null;
  ci95hi?: number | null;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs min-w-[180px]">
      <p className="font-semibold text-foreground mb-2">Week of {label}</p>
      {d.actual !== undefined && (
        <div className="flex justify-between gap-4 mb-1">
          <span className="text-muted-foreground">Actual Sales</span>
          <span className="font-mono font-semibold text-foreground">{d.actual?.toLocaleString()}</span>
        </div>
      )}
      {d.fitted !== undefined && (
        <div className="flex justify-between gap-4 mb-1">
          <span className="text-muted-foreground">Fitted</span>
          <span className="font-mono text-primary">{d.fitted?.toLocaleString()}</span>
        </div>
      )}
      {d.forecast !== undefined && (
        <>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-muted-foreground">Forecast</span>
            <span className="font-mono font-semibold text-warning">{d.forecast?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-muted-foreground">80% CI</span>
            <span className="font-mono text-muted-foreground">{d.ci80lo?.toLocaleString()} – {d.ci80hi?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">95% CI</span>
            <span className="font-mono text-muted-foreground">{d.ci95lo?.toLocaleString()} – {d.ci95hi?.toLocaleString()}</span>
          </div>
        </>
      )}
    </div>
  );
};
export default function ForecastChart({
  stateLabel,
  selectedModel,
  data,
}: {
  stateLabel: string;
  selectedModel?: string;
  data: ForecastChartRow[];
}) {
  const [showCI80, setShowCI80] = useState(true);
  const [showCI95, setShowCI95] = useState(true);
  const [showFitted, setShowFitted] = useState(false);

  const hasFitted = useMemo(() => data?.some((d: any) => d?.fitted !== undefined), [data]);

  return (
    <div className="metric-card">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Sales Forecast — {stateLabel}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {selectedModel ? `${selectedModel} · ` : ''}8-week ahead forecast with confidence intervals
          </p>
        </div>
        {/* Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasFitted && (
            <button
              onClick={() => setShowFitted((v) => !v)}
              className={`tab-button text-xs ${showFitted ? 'active' : ''}`}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-primary mr-1.5" />
              Fitted
            </button>
          )}
          <button
            onClick={() => setShowCI80((v) => !v)}
            className={`tab-button text-xs ${showCI80 ? 'active' : ''}`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-warning/60 mr-1.5" />
            80% CI
          </button>
          <button
            onClick={() => setShowCI95((v) => !v)}
            className={`tab-button text-xs ${showCI95 ? 'active' : ''}`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-warning/30 mr-1.5" />
            95% CI
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="ci95Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--warning)" stopOpacity={0.08} />
              <stop offset="100%" stopColor="var(--warning)" stopOpacity={0.04} />
            </linearGradient>
            <linearGradient id="ci80Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--warning)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--warning)" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="week"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="transparent" />

          {/* 95% CI band */}
          {showCI95 && (
            <Area type="monotone" dataKey="ci95hi" fill="url(#ci95Gradient)" stroke="none" />
          )}
          {showCI95 && (
            <Area type="monotone" dataKey="ci95lo" fill="var(--background)" stroke="none" />
          )}

          {/* 80% CI band */}
          {showCI80 && (
            <Area type="monotone" dataKey="ci80hi" fill="url(#ci80Gradient)" stroke="none" />
          )}
          {showCI80 && (
            <Area type="monotone" dataKey="ci80lo" fill="var(--background)" stroke="none" />
          )}

          {/* Forecast */}
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="var(--warning)"
            strokeWidth={2}
            dot={{ fill: 'var(--warning)', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-border">
        {[
          { label: '8-Week Forecast', color: 'var(--warning)', type: 'solid' },
          { label: '80% CI Band', color: 'var(--warning)', type: 'area', opacity: '0.4' },
          { label: '95% CI Band', color: 'var(--warning)', type: 'area', opacity: '0.15' },
        ].map((l) => (
          <div key={`legend-${l.label}`} className="flex items-center gap-1.5 text-2xs text-muted-foreground">
            <span
              className="w-5 h-0.5 rounded"
              style={{
                backgroundColor: l.color,
                opacity: l.opacity ? parseFloat(l.opacity) : 1,
                borderTop: l.type === 'dashed' ? `2px dashed ${l.color}` : undefined,
                backgroundColor: l.type === 'dashed' ? 'transparent' : l.color,
              }}
            />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}