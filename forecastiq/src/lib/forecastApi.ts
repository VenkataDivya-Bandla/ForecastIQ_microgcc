export type ApiForecastRow = {
  week: number;
  week_start: string;
  point_forecast: number | null;
  ci_80_lower: number | null;
  ci_80_upper: number | null;
  ci_95_lower: number | null;
  ci_95_upper: number | null;
};

export type ApiForecastResponse = {
  state: string;
  selected_model?: string;
  metrics?: Record<string, unknown>;
  all_results?: Record<string, unknown>;
  forecast: ApiForecastRow[];
};

function getApiBaseUrl() {
  // Optional override for local dev when frontend/backed are on different ports.
  return (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');
}

export async function fetchStateForecast(stateKey: string, signal?: AbortSignal) {
  const base = getApiBaseUrl();
  const url = `${base}/api/v1/forecasts/${encodeURIComponent(stateKey)}`;
  const res = await fetch(url, { signal, cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Forecast API failed (${res.status}): ${text || res.statusText}`);
  }
  return (await res.json()) as ApiForecastResponse;
}
