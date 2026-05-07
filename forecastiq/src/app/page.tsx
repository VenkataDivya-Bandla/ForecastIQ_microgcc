import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardKPIRow from './components/DashboardKPIRow';
import StatesForecastTable from './components/StatesForecastTable';
import ModelLeaderboardChart from './components/ModelLeaderboardChart';
import MapeDistributionChart from './components/MapeDistributionChart';
import TrainingActivityFeed from './components/TrainingActivityFeed';

export default function ForecastingDashboardPage() {
  return (
    <AppLayout
      pageTitle="Forecasting Dashboard"
      pageSubtitle="8-week ahead state-level sales forecasts — 49 states active"
    >
      {/* KPI Row */}
      <DashboardKPIRow />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 mt-5">
        <div className="lg:col-span-2">
          <ModelLeaderboardChart />
        </div>
        <div className="lg:col-span-1">
          <MapeDistributionChart />
        </div>
      </div>

      {/* Main Table + Activity Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-4 2xl:grid-cols-4 gap-4 mt-5">
        <div className="xl:col-span-3 2xl:col-span-3">
          <StatesForecastTable />
        </div>
        <div className="xl:col-span-1 2xl:col-span-1">
          <TrainingActivityFeed />
        </div>
      </div>
    </AppLayout>
  );
}