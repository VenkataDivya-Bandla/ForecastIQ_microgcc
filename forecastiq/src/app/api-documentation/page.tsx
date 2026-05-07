import React from 'react';
import AppLayout from '@/components/AppLayout';
import ApiDocLayout from './components/ApiDocLayout';

export default function APIDocumentationPage() {
  return (
    <AppLayout
      pageTitle="API Documentation"
      pageSubtitle="ForecastIQ REST API v1 — Internal data science team"
    >
      <ApiDocLayout />
    </AppLayout>
  );
}