'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import { AiChat } from '@/components/ai-chat';
import {
  Activity,
  AlertCircle,
  Users,
  BookOpen,
  GraduationCap,
  Server,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';

interface SystemHealth {
  status: string;
  version: string;
  uptime: number;
  timestamp: string;
  database?: string;
  redis?: string;
}

interface DashboardStats {
  systemHealth: SystemHealth | null;
  stats: {
    students: number;
    courses: number;
    faculty: number;
    departments: number;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api-production-bdc0.up.railway.app';

export function DashboardClient() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [data, setData] = useState<DashboardStats>({
    systemHealth: null,
    stats: { students: 0, courses: 0, faculty: 0, departments: 0 },
  });
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsDataLoading(true);
    setDataError(null);

    try {
      const [healthRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/health`),
      ]);

      let systemHealth: SystemHealth | null = null;
      if (healthRes.ok) {
        systemHealth = await healthRes.json();
      }

      setData({
        systemHealth,
        stats: {
          students: 0,
          courses: 0,
          faculty: 0,
          departments: 0,
        },
      });
    } catch {
      setDataError('Unable to fetch dashboard data. Please try again.');
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect('/login');
  }

  const health = data.systemHealth;
  const isSystemHealthy = health?.status === 'ok';

  const statCards = [
    {
      label: 'Students',
      value: data.stats.students,
      icon: Users,
      description: 'Total enrolled students',
    },
    {
      label: 'Courses',
      value: data.stats.courses,
      icon: BookOpen,
      description: 'Active courses',
    },
    {
      label: 'Faculty',
      value: data.stats.faculty,
      icon: GraduationCap,
      description: 'Teaching staff',
    },
    {
      label: 'Departments',
      value: data.stats.departments,
      icon: Layers,
      description: 'Academic departments',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-lg border bg-card p-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here is what is happening across your institution today.
        </p>
      </div>

      {/* Stats grid */}
      {isDataLoading ? (
        <div className="flex items-center justify-center rounded-lg border bg-card py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <>
          {dataError && (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <p className="flex-1 text-sm text-destructive">{dataError}</p>
              <button
                onClick={fetchData}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="flex items-start gap-4 rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value ?? '—'}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* System health + quick info */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              System Status
            </h3>
            <button
              onClick={fetchData}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              title="Refresh data"
            >
              <RefreshCw className={isDataLoading ? 'animate-spin' : ''} style={{ height: 14, width: 14 }} />
            </button>
          </div>

          {health ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">API Status</span>
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  {isSystemHealthy ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-green-600">Operational</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5 text-destructive" />
                      <span className="text-destructive">Degraded</span>
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Version</span>
                <span className="text-xs font-medium">{health.version ?? 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Uptime</span>
                <span className="flex items-center gap-1 text-xs font-medium">
                  <Clock className="h-3 w-3" />
                  {health.uptime ? formatUptime(health.uptime) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Last checked</span>
                <span className="text-xs font-medium">
                  {health.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">
              {isDataLoading ? 'Fetching system status...' : 'System status unavailable'}
            </p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm lg:col-span-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Quick Overview
          </h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3 rounded-md border bg-muted/30 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">AI Chat is ready</p>
                <p className="text-xs text-muted-foreground">
                  Ask questions about your institution data using the AI Assistant below.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md border bg-muted/30 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">All systems operational</p>
                <p className="text-xs text-muted-foreground">
                  CampusOS core services are running normally. No incidents reported.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md border bg-muted/30 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Connectors status</p>
                <p className="text-xs text-muted-foreground">
                  LMS, SIS, HRIS, and ERP connector integrations are coming in future updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat section */}
      <div className="h-[600px]">
        <AiChat />
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
