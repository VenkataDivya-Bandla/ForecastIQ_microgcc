'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { TrendingDown, TrendingUp, Minus, MapPin, Shield, Database } from 'lucide-react';

interface KPICardProps {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaDir: 'positive' | 'negative' | 'warning';
  sub: string;
  accent: 'blue' | 'green' | 'warning' | 'error';
  sparkline: number[];
  icon: string;
}

const accentStyles = {
  blue: {
    border: 'hover:border-primary/40',
    sparkColor: 'var(--primary)',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  green: {
    border: 'hover:border-accent/40',
    sparkColor: 'var(--accent)',
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
  },
  warning: {
    border: 'hover:border-warning/40',
    sparkColor: 'var(--warning)',
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
  },
  error: {
    border: 'hover:border-destructive/40',
    sparkColor: 'var(--destructive)',
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
  },
};

function CardIcon({ icon, className }: { icon: string; className: string }) {
  if (icon === 'map') return <MapPin size={16} className={className} />;
  if (icon === 'coverage') return <Shield size={16} className={className} />;
  if (icon === 'data') return <Database size={16} className={className} />;
  return <TrendingDown size={16} className={className} />;
}

export default function KPICardClient({
  label,
  value,
  delta,
  deltaDir,
  sub,
  accent,
  sparkline,
  icon,
}: KPICardProps) {
  const styles = accentStyles[accent];
  const sparkData = sparkline.map((v, i) => ({ i, v }));

  const deltaColor =
    deltaDir === 'positive' ?'text-accent'
      : deltaDir === 'warning' ?'text-warning' :'text-destructive';

  const DeltaIcon =
    deltaDir === 'positive' ? TrendingUp : deltaDir === 'warning' ? Minus : TrendingDown;

  return (
    <div className={`metric-card ${styles.border} transition-all duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-8 h-8 rounded-md ${styles.iconBg} flex items-center justify-center flex-shrink-0`}
        >
          <CardIcon icon={icon} className={styles.iconColor} />
        </div>
        <div className="h-10 w-24 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={styles.sparkColor}
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-foreground tabular-nums mb-1">{value}</p>
      <div className="flex items-center gap-1.5">
        <DeltaIcon size={12} className={deltaColor} />
        <span className={`text-xs font-medium ${deltaColor}`}>{delta}</span>
        <span className="text-2xs text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}