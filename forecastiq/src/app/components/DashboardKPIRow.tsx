import React from 'react';
import KPICardClient from './KPICardClient';

// Backend integration point: fetch aggregated metrics from /api/v1/metrics/summary
const kpiData = [
  {
    id: 'kpi-avg-mape',
    label: 'Avg MAPE (All States)',
    value: '7.43%',
    delta: '-0.82%',
    deltaDir: 'positive' as const,
    sub: 'vs last training run',
    accent: 'blue' as const,
    sparkline: [8.9, 8.4, 8.1, 7.9, 8.3, 7.8, 7.6, 7.43],
    icon: 'trend',
  },
  {
    id: 'kpi-states-forecasted',
    label: 'States Forecasted',
    value: '47 / 49',
    delta: '2 stale',
    deltaDir: 'warning' as const,
    sub: 'NV, WY need retraining',
    accent: 'warning' as const,
    sparkline: [45, 46, 46, 47, 47, 47, 47, 47],
    icon: 'map',
  },
  {
    id: 'kpi-coverage-rate',
    label: '95% CI Coverage',
    value: '93.1%',
    delta: '+1.2%',
    deltaDir: 'positive' as const,
    sub: 'target ≥ 95%',
    accent: 'green' as const,
    sparkline: [90.1, 91.3, 91.8, 92.0, 91.5, 92.4, 92.9, 93.1],
    icon: 'coverage',
  },
  {
    id: 'kpi-data-completeness',
    label: 'Data Completeness',
    value: '98.7%',
    delta: '+0.3%',
    deltaDir: 'positive' as const,
    sub: '3 states with gaps imputed',
    accent: 'green' as const,
    sparkline: [97.1, 97.4, 97.8, 98.0, 98.2, 98.4, 98.5, 98.7],
    icon: 'data',
  },
];

export default function DashboardKPIRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {kpiData.map((kpi) => (
        <KPICardClient key={kpi.id} {...kpi} />
      ))}
    </div>
  );
}