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
  TrendingUp,
  TrendingDown,
  ArrowRight,
  MessageSquare,
  FileText,
  Calendar,
  Zap,
  Bot,
  UserPlus,
  Database,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

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
      <div className="space-y-6 page-enter">
        {/* Skeleton welcome card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/80 via-primary/70 to-violet-600/80 p-6 md:p-8">
          <div className="relative z-10">
            <div className="h-8 w-64 skeleton rounded-md" />
            <div className="mt-3 h-4 w-96 skeleton rounded-md" />
            <div className="mt-2 h-4 w-80 skeleton rounded-md" />
          </div>
        </div>

        {/* Skeleton stat cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 skeleton rounded-xl" />
                <div className="h-4 w-12 skeleton rounded-md" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-8 w-20 skeleton rounded-md" />
                <div className="h-4 w-24 skeleton rounded-md" />
              </div>
            </div>
          ))}
        </div>

        {/* Skeleton overview + system status */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-2">
            <div className="h-4 w-32 skeleton rounded-md" />
            <div className="mt-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 skeleton rounded-lg" />
              ))}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="h-4 w-28 skeleton rounded-md" />
            <div className="mt-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-5 skeleton rounded-md" />
              ))}
            </div>
          </div>
        </div>

        {/* Skeleton AI chat area */}
        <div className="h-[400px] sm:h-[600px] skeleton rounded-xl" />
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
      trend: '+0%',
      trendUp: true,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
      description: 'Total enrolled students',
    },
    {
      label: 'Courses',
      value: data.stats.courses,
      icon: BookOpen,
      trend: '+0%',
      trendUp: true,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
      description: 'Active courses',
    },
    {
      label: 'Faculty',
      value: data.stats.faculty,
      icon: GraduationCap,
      trend: '+0%',
      trendUp: true,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
      description: 'Teaching staff',
    },
    {
      label: 'Departments',
      value: data.stats.departments,
      icon: Layers,
      trend: '0%',
      trendUp: true,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
      description: 'Academic departments',
    },
  ];

  const quickActions = [
    { label: 'AI Chat', icon: MessageSquare, href: '/dashboard#ai-chat', color: 'text-violet-500' },
    { label: 'Courses', icon: BookOpen, href: '/courses', color: 'text-emerald-500' },
    { label: 'Students', icon: Users, href: '/students', color: 'text-blue-500' },
    { label: 'Reports', icon: FileText, href: '/analytics', color: 'text-orange-500' },
    { label: 'Schedule', icon: Calendar, href: '/dashboard', color: 'text-rose-500' },
  ];

  return (
    <div className="space-y-6 page-enter">
      {/* Welcome card with gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary/90 to-violet-600 p-5 md:p-8 text-primary-foreground shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight fade-in">
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </h1>
            <p className="mt-1.5 md:mt-2 text-xs sm:text-sm text-primary-foreground/80 max-w-lg slide-up">
              Here is what is happening across your institution today. Track metrics, manage resources, and stay on top of your campus operations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchData}
              disabled={isDataLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/25 disabled:opacity-50"
            >
              <RefreshCw className={isDataLoading ? 'animate-spin' : ''} style={{ height: 14, width: 14 }} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Quick actions - full width on mobile */}
      <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            aria-label={`Quick action: ${action.label}`}
            className="inline-flex items-center justify-between gap-2 rounded-lg border bg-card px-4 py-3 sm:py-2 text-sm font-medium shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md sm:hover:-translate-y-0.5"
          >
            <span className="inline-flex items-center gap-2">
              <action.icon className={`h-4 w-4 ${action.color}`} />
              {action.label}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          </Link>
        ))}
      </div>

      {/* Stats grid */}
      {isDataLoading ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 skeleton rounded-xl" />
                <div className="h-4 w-12 skeleton rounded-md" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-8 w-20 skeleton rounded-md" />
                <div className="h-4 w-24 skeleton rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {dataError && (
            <div role="alert" className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 slide-up">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <p className="flex-1 text-sm text-destructive">{dataError}</p>
              <button
                onClick={fetchData}
                className="btn-secondary text-xs py-1 px-3"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>
            </div>
          )}

          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, i) => (
              <div
                key={stat.label}
                className="card-lift rounded-xl border bg-card p-5"
                style={{ animationDelay: `${i * 0.1}s` }}
                aria-label={`${stat.label}: ${stat.value ?? '—'} (${stat.trend}, ${stat.description})`}
              >
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium">
                    {stat.trendUp ? (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                    )}
                    <span className={stat.trendUp ? 'text-emerald-600' : 'text-destructive'}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold tracking-tight">{stat.value ?? '—'}</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{stat.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Recent Activity */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { id: 1, icon: <RefreshCw className="h-4 w-4 text-blue-600" />, message: 'Moodle sync completed — 12 courses updated', time: '2 hours ago', color: 'bg-blue-50' },
            { id: 2, icon: <Bot className="h-4 w-4 text-green-600" />, message: 'AI Agent answered 3 questions in Knowledge Base', time: '4 hours ago', color: 'bg-green-50' },
            { id: 3, icon: <UserPlus className="h-4 w-4 text-purple-600" />, message: 'Student Jane Doe enrolled in CS 101', time: '1 day ago', color: 'bg-purple-50' },
            { id: 4, icon: <Database className="h-4 w-4 text-orange-600" />, message: 'Connector ERPNext synced 45 invoices', time: '1 day ago', color: 'bg-orange-50' },
          ].map(a => (
            <div key={a.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
              <div className={`w-8 h-8 rounded-full ${a.color} flex items-center justify-center flex-shrink-0`}>
                {a.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{a.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* System health + quick info */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="flex flex-col rounded-xl border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Quick Overview
            </h3>
          </div>
          <div className="mt-4 flex-1 space-y-3">
            <div className="flex items-start gap-3 rounded-lg border bg-gradient-to-r from-blue-50/50 to-transparent p-3 dark:from-blue-950/20">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">AI Chat is ready</p>
                <p className="text-xs text-muted-foreground">
                  Ask questions about your institution data using the AI Assistant below.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-gradient-to-r from-green-50/50 to-transparent p-3 dark:from-green-950/20">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">All systems operational</p>
                <p className="text-xs text-muted-foreground">
                  CampusOS core services are running normally. No incidents reported.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-gradient-to-r from-purple-50/50 to-transparent p-3 dark:from-purple-950/20">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
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

        <div className="flex flex-col rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              System Status
            </h3>
            {isSystemHealthy && (
              <span className="badge-success">Live</span>
            )}
          </div>

          {health ? (
            <div className="mt-4 flex-1 space-y-3">
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
                <span className="text-xs font-mono font-medium">{health.version ?? 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Uptime</span>
                <span className="flex items-center gap-1 text-xs font-medium">
                  <Clock className="h-3 w-3" />
                  {health.uptime ? formatUptime(health.uptime) : 'N/A'}
                </span>
              </div>
              {health.database && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Database</span>
                  <span className="text-xs font-medium text-green-600">Connected</span>
                </div>
              )}
              {health.redis && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Redis</span>
                  <span className="text-xs font-medium text-green-600">Connected</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Last checked</span>
                <span className="text-xs font-medium">
                  {health.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex-1 flex items-center justify-center">
              <p className="text-xs text-muted-foreground">
                {isDataLoading ? 'Fetching system status...' : 'System status unavailable'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI Chat section */}
      <div id="ai-chat" aria-label="AI Assistant" className="h-[400px] sm:h-[600px]">
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
