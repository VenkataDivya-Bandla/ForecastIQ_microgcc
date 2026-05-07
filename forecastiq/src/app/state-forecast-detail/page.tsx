'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import StateDetailHeader from './components/StateDetailHeader';
import StateMetricCards from './components/StateMetricCards';
import ForecastChart from './components/ForecastChart';
import ResidualsChart from './components/ResidualsChart';
import FeatureImportanceChart from './components/FeatureImportanceChart';
import ModelComparisonTable from './components/ModelComparisonTable';
import PredictionTable from './components/PredictionTable';
import { STATES_LIST, getStateSummary } from '@/app/data/statesData';
import { fetchStateForecast, type ApiForecastResponse } from '@/lib/forecastApi';
import { useRouter, useSearchParams } from 'next/navigation';

export default function StateForecastDetailPage() {
  return (
    <Suspense
      fallback={
        <AppLayout pageTitle="State Forecast Detail" pageSubtitle="Loading…">
          <div className="metric-card py-6 px-6">
            <p className="text-xs text-muted-foreground">Loading state forecast…</p>
          </div>
        </AppLayout>
      }
    >
      <StateForecastDetailClient />
    </Suspense>
  );
}

function StateForecastDetailClient() {
  const router = useRouter();
  const params = useSearchParams();

  const initialStateName = params.get('state') || 'California';
  const initialOption = useMemo(() => {
    const match = STATES_LIST.find((s) => s.name.toLowerCase() === initialStateName.toLowerCase());
    return match || STATES_LIST[0];
  }, [initialStateName]);

  const [selectedState, setSelectedState] = useState(initialOption);
  const [data, setData] = useState<ApiForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedState(initialOption);
  }, [initialOption]);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);

    fetchStateForecast(selectedState.name, ac.signal)
      .then((res) => setData(res))
      .catch((e) => {
        if (String(e?.name) === 'AbortError') return;
        setError(e?.message || 'Failed to fetch forecast');
        setData(null);
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [selectedState.name]);

  const summary = getStateSummary(selectedState.abbr);
  const selectedModel = data?.selected_model || summary?.bestModel;
  const metrics = (data?.metrics as any) || undefined;

  const chartData = useMemo(() => {
    const f = data?.forecast || [];
    return f.map((r) => ({
      week: r.week_start,
      forecast: r.point_forecast,
      ci80lo: r.ci_80_lower,
      ci80hi: r.ci_80_upper,
      ci95lo: r.ci_95_lower,
      ci95hi: r.ci_95_upper,
    }));
  }, [data?.forecast]);

  return (
    <AppLayout
      pageTitle="State Forecast Detail"
      pageSubtitle={`${selectedState.name} · ${selectedModel || '—'} · 8-week ahead forecast`}
    >
      <StateDetailHeader
        states={STATES_LIST}
        selectedState={selectedState}
        selectedModel={selectedModel}
        lastTrained={summary?.lastTrained}
        statusLabel={summary?.status === 'stale' ? 'Stale' : 'Serving'}
        onSelectState={(s) => {
          setSelectedState(s);
          router.replace(`/state-forecast-detail?state=${encodeURIComponent(s.name)}`);
        }}
      />

      {error && (
        <div className="metric-card py-3 px-4 mb-4 border border-destructive/30">
          <p className="text-xs text-destructive font-medium">API error</p>
          <p className="text-2xs text-muted-foreground mt-1">
            {error}. Make sure backend is running and `NEXT_PUBLIC_API_BASE_URL` is set if needed.
          </p>
        </div>
      )}

      <StateMetricCards selectedModel={selectedModel} metrics={metrics} horizonWeeks={8} />

      {/* Main forecast chart */}
      <div className="mt-5">
        <ForecastChart stateLabel={selectedState.name} selectedModel={selectedModel} data={chartData} />
      </div>

      {/* Residuals + Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4 mt-5">
        <ResidualsChart />
        <FeatureImportanceChart />
      </div>

      {/* Model comparison + Prediction table */}
      <div className="grid grid-cols-1 xl:grid-cols-5 2xl:grid-cols-5 gap-4 mt-5">
        <div className="xl:col-span-2 2xl:col-span-2">
          <ModelComparisonTable selectedModel={selectedModel} allResults={(data?.all_results as any) || undefined} />
        </div>
        <div className="xl:col-span-3 2xl:col-span-3">
          <PredictionTable selectedModel={selectedModel} forecast={data?.forecast || []} />
        </div>
      </div>
    </AppLayout>
  );
}