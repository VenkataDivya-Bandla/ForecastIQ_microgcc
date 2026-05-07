'use client';

import React, { useState } from 'react';
import ApiOverviewPanel from './ApiOverviewPanel';
import EndpointCard from './EndpointCard';
import { endpoints } from './endpointData';

const categories = ['All', 'Forecasts', 'Models', 'Data', 'System'];

export default function ApiDocLayout() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeEndpoint, setActiveEndpoint] = useState<string>(endpoints?.[0]?.id);

  const filtered = activeCategory === 'All'
    ? endpoints
    : endpoints?.filter((e) => e?.category === activeCategory);

  const currentEndpoint = endpoints?.find((e) => e?.id === activeEndpoint) ?? endpoints?.[0];

  return (
    <div className="flex gap-5 min-h-[calc(100vh-120px)]">
      {/* Left: Endpoint List */}
      <div className="w-64 flex-shrink-0">
        <ApiOverviewPanel />
        <div className="mt-4 metric-card p-3">
          {/* Category filter */}
          <div className="flex flex-wrap gap-1 mb-3">
            {categories?.map((cat) => (
              <button
                key={`cat-${cat}`}
                onClick={() => setActiveCategory(cat)}
                className={`tab-button text-2xs py-1 px-2 ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="space-y-0.5">
            {filtered?.map((ep) => (
              <button
                key={ep?.id}
                onClick={() => setActiveEndpoint(ep?.id)}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-left transition-colors ${
                  activeEndpoint === ep?.id
                    ? 'bg-primary/10 border border-primary/20' :'hover:bg-muted/30'
                }`}
              >
                <span
                  className={
                    ep?.method === 'GET' ?'endpoint-method-get'
                      : ep?.method === 'POST' ?'endpoint-method-post' :'endpoint-method-delete'
                  }
                >
                  {ep?.method}
                </span>
                <span
                  className={`text-2xs font-mono truncate ${
                    activeEndpoint === ep?.id ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {ep?.path?.replace('/api/v1', '')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Right: Endpoint Detail */}
      <div className="flex-1 min-w-0">
        <EndpointCard endpoint={currentEndpoint} />
      </div>
    </div>
  );
}