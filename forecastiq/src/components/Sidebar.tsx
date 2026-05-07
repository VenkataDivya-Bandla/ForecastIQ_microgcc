'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  MapPin,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Activity,
  AlertTriangle,
  Settings,
  HelpCircle,
  Cpu,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  badgeVariant?: 'warning' | 'error' | 'success';
}

const navItems: NavItem[] = [
  {
    id: 'nav-dashboard',
    label: 'Forecasting Dashboard',
    href: '/',
    icon: <LayoutDashboard size={18} />,
  },
  {
    id: 'nav-state-detail',
    label: 'State Forecast Detail',
    href: '/state-forecast-detail',
    icon: <MapPin size={18} />,
  },
  {
    id: 'nav-api-docs',
    label: 'API Documentation',
    href: '/api-documentation',
    icon: <BookOpen size={18} />,
  },
];


const bottomItems: NavItem[] = [
  { id: 'nav-settings', label: 'Settings', href: '#', icon: <Settings size={18} /> },
  { id: 'nav-help', label: 'Help & Docs', href: '#', icon: <HelpCircle size={18} /> },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const getBadgeClass = (variant?: string) => {
    if (variant === 'error') return 'bg-destructive text-destructive-foreground';
    if (variant === 'warning') return 'bg-warning text-warning-foreground';
    return 'bg-primary text-primary-foreground';
  };

  return (
    <aside
      className={`flex flex-col h-screen bg-card border-r border-border sidebar-transition fixed left-0 top-0 z-40 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-14 border-b border-border px-3 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <AppLogo size={28} />
          {!collapsed && (
            <span className="font-semibold text-sm text-foreground truncate tracking-tight">
              ForecastIQ
            </span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Collapsed toggle */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="flex items-center justify-center h-8 mx-2 mt-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Expand sidebar"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Primary Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3 space-y-1">
        {!collapsed && (
          <p className="section-header mb-2">Core</p>
        )}
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`nav-item ${isActive(item.href) ? 'active' : ''} ${
              collapsed ? 'justify-center px-0' : ''
            }`}
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && (
              <span className="flex-1 truncate">{item.label}</span>
            )}
            {!collapsed && item.badge && (
              <span
                className={`text-2xs px-1.5 py-0.5 rounded-full font-semibold ${getBadgeClass(
                  item.badgeVariant
                )}`}
              >
                {item.badge}
              </span>
            )}
          </Link>
        ))}

        <div className="my-3 border-t border-border" />


      </nav>

      {/* Bottom Nav */}
      <div className="px-2 py-3 border-t border-border space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`nav-item ${collapsed ? 'justify-center px-0' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        ))}

        {/* User */}
        <div
          className={`flex items-center gap-2 p-2 mt-2 rounded-md bg-muted/30 border border-border ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-semibold text-xs">AR</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">Arjun Rao</p>
              <p className="text-2xs text-muted-foreground truncate">Data Science</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}