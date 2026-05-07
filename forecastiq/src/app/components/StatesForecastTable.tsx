'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ExternalLink } from 'lucide-react';

// Backend integration point: fetch from /api/v1/forecasts/states?page=1&limit=20
import { statesData } from '@/app/data/statesData';

type SortKey = 'state' | 'bestModel' | 'mape' | 'rmse' | 'mae' | 'coverage' | 'lastTrained' | 'status' | 'completeness';
type SortDir = 'asc' | 'desc';

const modelBadgeClass: Record<string, string> = {
  XGBoost: 'badge badge-xgboost',
  Prophet: 'badge badge-prophet',
  LSTM: 'badge badge-lstm',
  ARIMA: 'badge badge-arima',
};

const statusBadgeClass: Record<string, string> = {
  serving: 'badge badge-success',
  stale: 'badge badge-error',
  training: 'badge badge-pending',
  evaluating: 'badge badge-warning',
};

function CompletenessBar({ value }: { value: number }) {
  const color = value >= 98 ? 'bg-accent' : value >= 94 ? 'bg-warning' : 'bg-destructive';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[48px]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-2xs font-mono text-muted-foreground tabular-nums">{value}%</span>
    </div>
  );
}

export default function StatesForecastTable() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('mape');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    return statesData
      .filter((s) => {
        const q = search.toLowerCase();
        return (
          s.state.toLowerCase().includes(q) ||
          s.abbr.toLowerCase().includes(q) ||
          s.bestModel.toLowerCase().includes(q)
        );
      })
      .filter((s) => modelFilter === 'all' || s.bestModel === modelFilter)
      .filter((s) => statusFilter === 'all' || s.status === statusFilter)
      .sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number);
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [search, sortKey, sortDir, modelFilter, statusFilter]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown size={12} className="text-muted-foreground/50" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={12} className="text-primary" />
    ) : (
      <ChevronDown size={12} className="text-primary" />
    );
  }

  return (
    <div className="metric-card">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">State Forecast Status</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filtered.length} states · sorted by {sortKey}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search states..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-7 pr-3 py-1.5 text-xs w-40"
            />
          </div>
          {/* Model filter */}
          <select
            value={modelFilter}
            onChange={(e) => { setModelFilter(e.target.value); setPage(1); }}
            className="input-field py-1.5 text-xs pr-6"
          >
            <option value="all">All Models</option>
            <option value="XGBoost">XGBoost</option>
            <option value="Prophet">Prophet</option>
            <option value="LSTM">LSTM</option>
            <option value="ARIMA">ARIMA</option>
          </select>
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field py-1.5 text-xs pr-6"
          >
            <option value="all">All Status</option>
            <option value="serving">Serving</option>
            <option value="stale">Stale</option>
            <option value="training">Training</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin -mx-1 px-1">
        <table className="data-table">
          <thead>
            <tr>
              {([
                ['state', 'State'],
                ['bestModel', 'Best Model'],
                ['mape', 'MAPE ↓'],
                ['rmse', 'RMSE'],
                ['mae', 'MAE'],
                ['coverage', 'CI Coverage'],
                ['lastTrained', 'Last Trained'],
                ['status', 'Status'],
                ['completeness', 'Completeness'],
              ] as [SortKey, string][]).map(([key, label]) => (
                <th
                  key={`th-${key}`}
                  onClick={() => handleSort(key)}
                  className="cursor-pointer"
                >
                  <span className="flex items-center gap-1">
                    {label}
                    <SortIcon col={key} />
                  </span>
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((row) => (
              <tr key={row.id} className="row-hover group">
                <td>
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-5 flex items-center justify-center bg-muted/50 rounded text-2xs font-mono font-semibold text-muted-foreground">
                      {row.abbr}
                    </span>
                    <span className="text-xs font-medium text-foreground">{row.state}</span>
                  </div>
                </td>
                <td>
                  <span className={modelBadgeClass[row.bestModel] || 'badge badge-pending'}>
                    {row.bestModel}
                  </span>
                </td>
                <td>
                  <span
                    className={`font-mono text-xs font-semibold tabular-nums ${
                      row.mape < 8 ? 'text-accent' : row.mape < 11 ? 'text-warning' : 'text-destructive'
                    }`}
                  >
                    {row.mape.toFixed(2)}%
                  </span>
                </td>
                <td>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {row.rmse.toLocaleString()}
                  </span>
                </td>
                <td>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {row.mae.toLocaleString()}
                  </span>
                </td>
                <td>
                  <span
                    className={`font-mono text-xs font-medium tabular-nums ${
                      row.coverage >= 95 ? 'text-accent' : row.coverage >= 92 ? 'text-warning' : 'text-destructive'
                    }`}
                  >
                    {row.coverage.toFixed(1)}%
                  </span>
                </td>
                <td>
                  <span className="font-mono text-2xs text-muted-foreground">{row.lastTrained}</span>
                </td>
                <td>
                  <span className={statusBadgeClass[row.status] || 'badge badge-pending'}>
                    {row.status}
                  </span>
                </td>
                <td className="min-w-[120px]">
                  <CompletenessBar value={row.completeness} />
                </td>
                <td>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/state-forecast-detail?state=${encodeURIComponent(row.state)}`}
                      className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="View forecast detail"
                    >
                      <ExternalLink size={13} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length} states
        </p>
        <div className="flex items-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-2.5 py-1 text-xs rounded bg-muted/30 border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={`page-${p}`}
              onClick={() => setPage(p)}
              className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                page === p
                  ? 'bg-primary/20 border-primary/40 text-primary font-medium' :'bg-muted/30 border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-2.5 py-1 text-xs rounded bg-muted/30 border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}