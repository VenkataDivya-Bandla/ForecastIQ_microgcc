'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, Loader2, XCircle, Clock } from 'lucide-react';

// Backend integration point: SSE stream from /api/v1/events/training
const activities = [
  { id: 'act-001', state: 'California', model: 'XGBoost', event: 'Training complete', mape: '5.21%', time: '4 min ago', type: 'success' },
  { id: 'act-002', state: 'Texas', model: 'Prophet', event: 'Best model selected', mape: '6.14%', time: '12 min ago', type: 'success' },
  { id: 'act-003', state: 'Nevada', model: 'ARIMA', event: 'MAPE exceeded threshold', mape: '11.43%', time: '18 min ago', type: 'warning' },
  { id: 'act-004', state: 'Florida', model: 'LSTM', event: 'Training complete', mape: '6.83%', time: '31 min ago', type: 'success' },
  { id: 'act-005', state: 'Wyoming', model: 'XGBoost', event: 'Training failed — insufficient data', mape: '—', time: '47 min ago', type: 'error' },
  { id: 'act-006', state: 'New York', model: 'LSTM', event: 'Feature engineering done', mape: '—', time: '1h 2m ago', type: 'info' },
  { id: 'act-007', state: 'Illinois', model: 'Prophet', event: 'Training complete', mape: '7.91%', time: '1h 18m ago', type: 'success' },
  { id: 'act-008', state: 'Pennsylvania', model: 'XGBoost', event: 'Training complete', mape: '6.57%', time: '1h 34m ago', type: 'success' },
];

const iconMap = {
  success: <CheckCircle2 size={14} className="text-accent flex-shrink-0" />,
  warning: <AlertTriangle size={14} className="text-warning flex-shrink-0" />,
  error: <XCircle size={14} className="text-destructive flex-shrink-0" />,
  info: <Loader2 size={14} className="text-primary flex-shrink-0" />,
};

const modelBadgeClass: Record<string, string> = {
  XGBoost: 'badge badge-xgboost',
  Prophet: 'badge badge-prophet',
  LSTM: 'badge badge-lstm',
  ARIMA: 'badge badge-arima',
};

export default function TrainingActivityFeed() {
  return (
    <div className="metric-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Training Activity</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Live model training events</p>
        </div>
        <div className="flex items-center gap-1.5 text-2xs text-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span>Live</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1">
        {activities.map((act) => (
          <div
            key={act.id}
            className="flex gap-2.5 p-2.5 rounded-md hover:bg-muted/30 transition-colors group"
          >
            <div className="mt-0.5">{iconMap[act.type as keyof typeof iconMap]}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-medium text-foreground">{act.state}</span>
                <span className={modelBadgeClass[act.model] || 'badge badge-pending'}>
                  {act.model}
                </span>
                {act.mape !== '—' && (
                  <span className="text-2xs font-mono text-accent">{act.mape}</span>
                )}
              </div>
              <p className="text-2xs text-muted-foreground mt-0.5 truncate">{act.event}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock size={10} className="text-muted-foreground/50" />
                <span className="text-2xs text-muted-foreground/60">{act.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex-shrink-0 pt-3 mt-3 border-t border-border">
        <button className="w-full text-xs text-muted-foreground hover:text-primary transition-colors text-center py-1">
          View full activity log →
        </button>
      </div>
    </div>
  );
}