import React from 'react';
import { Shield, Zap, GitBranch } from 'lucide-react';

export default function ApiOverviewPanel() {
  return (
    <div className="metric-card p-4 space-y-4">
      {/* Base URL */}
      <div>
        <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
          Base URL
        </p>
        <code className="text-2xs font-mono text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20 block">
          https://forecastiq.internal.io/api/v1
        </code>
      </div>
      {/* Auth */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Shield size={11} className="text-accent" />
          <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
            Authentication
          </p>
        </div>
        <p className="text-2xs text-muted-foreground leading-relaxed">
          Bearer token via{' '}
          <code className="font-mono text-foreground bg-muted/50 px-1 rounded">
            Authorization
          </code>{' '}
          header. Request tokens from the platform admin.
        </p>
      </div>
      {/* Rate limits */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Zap size={11} className="text-warning" />
          <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
            Rate Limits
          </p>
        </div>
        <div className="space-y-1">
          {[
            { label: 'Forecast endpoints', limit: '120 req/min' },
            { label: 'Training triggers', limit: '5 req/min' },
            { label: 'Batch jobs', limit: '10 req/min' },
            { label: 'Health check', limit: '300 req/min' },
          ]?.map((r) => (
            <div key={`rate-${r?.label}`} className="flex justify-between text-2xs">
              <span className="text-muted-foreground">{r?.label}</span>
              <span className="font-mono text-foreground">{r?.limit}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Version */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <GitBranch size={11} className="text-chart-4" />
          <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
            Version
          </p>
        </div>
        <div className="flex items-center justify-between text-2xs">
          <span className="text-muted-foreground">Current</span>
          <span className="font-mono text-accent">v1.4.2</span>
        </div>
        <div className="flex items-center justify-between text-2xs mt-1">
          <span className="text-muted-foreground">Deprecation</span>
          <span className="font-mono text-muted-foreground">v0.x → Jun 2026</span>
        </div>
      </div>
    </div>
  );
}