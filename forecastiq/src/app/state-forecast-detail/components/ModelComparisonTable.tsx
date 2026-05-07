import React, { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';

type ModelMetrics = { mape?: number; rmse?: number; mae?: number; error?: string };

const modelBadgeClass: Record<string, string> = {
  XGBoost: 'badge badge-xgboost',
  Prophet: 'badge badge-prophet',
  LSTM: 'badge badge-lstm',
  ARIMA: 'badge badge-arima',
};

export default function ModelComparisonTable({
  selectedModel,
  allResults,
}: {
  selectedModel?: string;
  allResults?: Record<string, any>;
}) {
  const models = useMemo(() => {
    const entries = Object.entries(allResults || {});
    const rows = entries.map(([name, v]) => {
      const m = (v || {}) as ModelMetrics;
      return {
        id: `mc-${name}`,
        name,
        mape: typeof m.mape === 'number' ? m.mape : null,
        rmse: typeof m.rmse === 'number' ? m.rmse : null,
        mae: typeof m.mae === 'number' ? m.mae : null,
        isBest: selectedModel ? name === selectedModel : false,
        error: (m as any).error as string | undefined,
      };
    });
    return rows.sort((a, b) => {
      if (a.mape == null && b.mape == null) return 0;
      if (a.mape == null) return 1;
      if (b.mape == null) return -1;
      return a.mape - b.mape;
    });
  }, [allResults, selectedModel]);

  return (
    <div className="metric-card h-full">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">Model Comparison</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          All 4 algorithms evaluated · best selected automatically
        </p>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="data-table">
          <thead>
            <tr>
              <th>Model</th>
              <th>MAPE ↓</th>
              <th>RMSE</th>
              <th>MAE</th>
              <th>Train Time</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m) => (
              <tr
                key={m.id}
                className={`row-hover ${m.isBest ? 'bg-accent/5' : ''}`}
              >
                <td>
                  <div className="flex items-center gap-2">
                    <span className={modelBadgeClass[m.name] || 'badge badge-pending'}>
                      {m.name}
                    </span>
                    {m.isBest && (
                      <CheckCircle2 size={12} className="text-accent flex-shrink-0" />
                    )}
                  </div>
                </td>
                <td>
                  <span
                    className={`font-mono text-xs font-semibold tabular-nums ${
                      m.isBest ? 'text-accent' : 'text-foreground'
                    }`}
                  >
                    {typeof m.mape === 'number' ? `${m.mape.toFixed(2)}%` : '—'}
                  </span>
                </td>
                <td>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {typeof m.rmse === 'number' ? m.rmse.toLocaleString() : '—'}
                  </span>
                </td>
                <td>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {typeof m.mae === 'number' ? m.mae.toLocaleString() : '—'}
                  </span>
                </td>
                <td>
                  <span className="font-mono text-2xs text-muted-foreground">
                    {m.error ? 'error' : '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 pt-3 border-t border-border text-2xs text-muted-foreground">
        Selection criterion: lowest MAPE on held-out validation set (last 8 weeks)
      </div>
    </div>
  );
}