'use client';

import React, { useState } from 'react';
import { Search, Bell, RefreshCw, Download, Clock } from 'lucide-react';

interface TopbarProps {
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function Topbar({ pageTitle, pageSubtitle }: TopbarProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card/60 backdrop-blur-sm flex-shrink-0">
      {/* Left: Page title */}
      <div className="flex items-center gap-3 min-w-0">
        {pageTitle && (
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-foreground truncate">{pageTitle}</h1>
            {pageSubtitle && (
              <p className="text-2xs text-muted-foreground truncate">{pageSubtitle}</p>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Last updated */}
        <div className="hidden md:flex items-center gap-1.5 text-2xs text-muted-foreground bg-muted/30 px-2.5 py-1.5 rounded-md border border-border">
          <Clock size={11} />
          <span>Updated 4 min ago</span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse ml-0.5" />
        </div>

        {/* Search */}
        <div className="relative hidden lg:block">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search states, models..."
            className="input-field pl-8 pr-3 py-1.5 text-xs w-52"
          />
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Refresh forecasts"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
        </button>

        {/* Export */}
        <button
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Export forecast data"
        >
          <Download size={15} />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-destructive" />
        </button>
      </div>
    </header>
  );
}