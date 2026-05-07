'use client';

import React, { useState } from 'react';
import { ChevronDown, RefreshCw, Download, AlertCircle, CheckCircle2 } from 'lucide-react';

export type UiStateOption = { id: string; name: string; abbr: string };

export default function StateDetailHeader({
  states,
  selectedState,
  selectedModel,
  lastTrained,
  statusLabel = 'Serving',
  onSelectState,
}: {
  states: UiStateOption[];
  selectedState: UiStateOption;
  selectedModel?: string;
  lastTrained?: string;
  statusLabel?: string;
  onSelectState: (s: UiStateOption) => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [retraining, setRetraining] = useState(false);

  const handleRetrain = () => {
    setRetraining(true);
    setTimeout(() => setRetraining(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
      <div className="flex items-start gap-4">
        {/* State selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2.5 hover:border-primary/40 transition-colors"
          >
            <div className="w-9 h-7 bg-primary/10 border border-primary/20 rounded flex items-center justify-center">
              <span className="text-xs font-bold font-mono text-primary">{selectedState?.abbr}</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">{selectedState?.name}</p>
              <p className="text-2xs text-muted-foreground">Click to change state</p>
            </div>
            <ChevronDown size={14} className={`text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-card border border-border rounded-lg shadow-xl z-20 py-1 fade-in">
              {states?.map((s) => (
                <button
                  key={s?.id}
                  onClick={() => { onSelectState(s); setDropdownOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-muted/40 transition-colors ${
                    selectedState?.id === s?.id ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  <span className="w-7 h-5 bg-muted/50 rounded text-2xs font-mono font-semibold text-muted-foreground flex items-center justify-center">
                    {s?.abbr}
                  </span>
                  {s?.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {selectedModel && (
            <span className={`badge ${selectedModel === 'XGBoost' ? 'badge-xgboost' : selectedModel === 'Prophet' ? 'badge-prophet' : selectedModel === 'LSTM' ? 'badge-lstm' : selectedModel === 'SARIMA' ? 'badge-arima' : 'badge-pending'}`}>
              {selectedModel} · Best Model
            </span>
          )}
          <span className="badge badge-success">
            <CheckCircle2 size={10} />
            {statusLabel}
          </span>
          {lastTrained && (
            <span className="text-2xs text-muted-foreground bg-muted/30 border border-border px-2 py-1 rounded font-mono">
              Trained: {lastTrained}
            </span>
          )}
          <div className="flex items-center gap-1 text-2xs text-warning bg-warning/10 border border-warning/20 px-2 py-1 rounded">
            <AlertCircle size={10} />
            <span>2 imputed weeks in training data</span>
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleRetrain}
          className="btn-secondary text-xs"
          disabled={retraining}
        >
          <RefreshCw size={13} className={retraining ? 'animate-spin' : ''} />
          {retraining ? 'Retraining…' : 'Retrain Models'}
        </button>
        <button className="btn-secondary text-xs">
          <Download size={13} />
          Export Forecast
        </button>
      </div>
    </div>
  );
}