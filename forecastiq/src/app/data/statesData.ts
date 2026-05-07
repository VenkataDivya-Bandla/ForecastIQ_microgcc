export type StateSummaryRow = {
  id: string;
  state: string;
  abbr: string;
  bestModel: 'XGBoost' | 'Prophet' | 'LSTM' | 'ARIMA' | string;
  mape: number;
  rmse: number;
  mae: number;
  coverage: number;
  lastTrained: string;
  status: 'serving' | 'stale' | 'training' | 'evaluating' | string;
  completeness: number;
};

// TODO: Replace with backend call when available.
export const statesData: StateSummaryRow[] = [
  { id: 'state-ca', state: 'California', abbr: 'CA', bestModel: 'XGBoost', mape: 5.21, rmse: 982, mae: 743, coverage: 94.8, lastTrained: '2026-05-06 10:14', status: 'serving', completeness: 99.2 },
  { id: 'state-tx', state: 'Texas', abbr: 'TX', bestModel: 'Prophet', mape: 6.14, rmse: 1124, mae: 891, coverage: 95.2, lastTrained: '2026-05-06 10:22', status: 'serving', completeness: 98.7 },
  { id: 'state-fl', state: 'Florida', abbr: 'FL', bestModel: 'XGBoost', mape: 6.83, rmse: 1203, mae: 934, coverage: 93.1, lastTrained: '2026-05-06 10:31', status: 'serving', completeness: 99.1 },
  { id: 'state-ny', state: 'New York', abbr: 'NY', bestModel: 'LSTM', mape: 7.42, rmse: 1387, mae: 1021, coverage: 92.4, lastTrained: '2026-05-06 10:44', status: 'serving', completeness: 97.8 },
  { id: 'state-il', state: 'Illinois', abbr: 'IL', bestModel: 'Prophet', mape: 7.91, rmse: 1441, mae: 1102, coverage: 94.0, lastTrained: '2026-05-06 11:02', status: 'serving', completeness: 98.3 },
  { id: 'state-pa', state: 'Pennsylvania', abbr: 'PA', bestModel: 'XGBoost', mape: 6.57, rmse: 1178, mae: 887, coverage: 95.6, lastTrained: '2026-05-06 11:18', status: 'serving', completeness: 99.0 },
  { id: 'state-oh', state: 'Ohio', abbr: 'OH', bestModel: 'ARIMA', mape: 9.84, rmse: 1812, mae: 1398, coverage: 91.2, lastTrained: '2026-05-05 22:14', status: 'serving', completeness: 96.4 },
  { id: 'state-ga', state: 'Georgia', abbr: 'GA', bestModel: 'XGBoost', mape: 7.03, rmse: 1267, mae: 964, coverage: 93.7, lastTrained: '2026-05-06 11:35', status: 'serving', completeness: 98.6 },
  { id: 'state-nc', state: 'North Carolina', abbr: 'NC', bestModel: 'Prophet', mape: 8.12, rmse: 1523, mae: 1143, coverage: 92.8, lastTrained: '2026-05-06 11:52', status: 'serving', completeness: 97.9 },
  { id: 'state-mi', state: 'Michigan', abbr: 'MI', bestModel: 'LSTM', mape: 8.74, rmse: 1634, mae: 1219, coverage: 91.8, lastTrained: '2026-05-06 12:07', status: 'serving', completeness: 97.1 },
  { id: 'state-nv', state: 'Nevada', abbr: 'NV', bestModel: 'XGBoost', mape: 11.43, rmse: 2108, mae: 1623, coverage: 88.3, lastTrained: '2026-05-04 09:22', status: 'stale', completeness: 91.2 },
  { id: 'state-wy', state: 'Wyoming', abbr: 'WY', bestModel: 'ARIMA', mape: 13.87, rmse: 2441, mae: 1892, coverage: 85.7, lastTrained: '2026-05-03 14:18', status: 'stale', completeness: 87.4 },
];

export const STATES_LIST = statesData.map((s) => ({
  id: s.id,
  name: s.state,
  abbr: s.abbr,
}));

export function getStateSummary(abbr: string) {
  return statesData.find((s) => s.abbr.toUpperCase() === abbr.toUpperCase());
}
