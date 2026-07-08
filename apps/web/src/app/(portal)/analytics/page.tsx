'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  Activity,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api-production-bdc0.up.railway.app';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface OverviewMetrics {
  totalStudents: number;
  activeCourses: number;
  faculty: number;
  revenue: string;
  studentChange: string;
  courseChange: string;
  facultyChange: string;
  revenueChange: string;
}

interface EnrollmentItem {
  dept: string;
  count: number;
  pct: number;
}

interface TrendItem {
  month: string;
  value: number;
}

interface PerformanceKpi {
  label: string;
  value: string;
  target: string;
}

interface AnalyticsData {
  metrics: OverviewMetrics | null;
  enrollments: EnrollmentItem[];
  trends: TrendItem[];
  kpis: PerformanceKpi[];
}

type TimeFrame = '7d' | '30d' | '90d' | '1y';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function parseMetrics(raw: Record<string, unknown>): OverviewMetrics {
  return {
    totalStudents: Number(raw.totalStudents ?? 0),
    activeCourses: Number(raw.activeCourses ?? 0),
    faculty: Number(raw.faculty ?? 0),
    revenue: String(raw.revenue ?? '$0'),
    studentChange: String(raw.studentChange ?? '+0%'),
    courseChange: String(raw.courseChange ?? '+0%'),
    facultyChange: String(raw.facultyChange ?? '+0%'),
    revenueChange: String(raw.revenueChange ?? '+0%'),
  };
}

function parseEnrollments(raw: unknown): EnrollmentItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: Record<string, unknown>) => ({
    dept: String(item.dept ?? ''),
    count: Number(item.count ?? 0),
    pct: Number(item.pct ?? 0),
  }));
}

function parseTrends(raw: unknown): TrendItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: Record<string, unknown>) => ({
    month: String(item.month ?? ''),
    value: Number(item.value ?? 0),
  }));
}

function parseKpis(raw: unknown): PerformanceKpi[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: Record<string, unknown>) => ({
    label: String(item.label ?? ''),
    value: String(item.value ?? ''),
    target: String(item.target ?? ''),
  }));
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [timeframe, setTimeframe] = useState<TimeFrame>('30d');
  const [data, setData] = useState<AnalyticsData>({
    metrics: null,
    enrollments: [],
    trends: [],
    kpis: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [overviewRes, enrollmentsRes, trendsRes, kpisRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/analytics/overview`),
        fetch(`${API_BASE}/api/v1/analytics/enrollments`),
        fetch(`${API_BASE}/api/v1/analytics/trends`),
        fetch(`${API_BASE}/api/v1/analytics/performance`),
      ]);

      const [overviewRaw, enrollmentsRaw, trendsRaw, kpisRaw] = await Promise.all([
        overviewRes.ok ? overviewRes.json() : {},
        enrollmentsRes.ok ? enrollmentsRes.json() : [],
        trendsRes.ok ? trendsRes.json() : [],
        kpisRes.ok ? kpisRes.json() : [],
      ]);

      setData({
        metrics: parseMetrics(overviewRaw),
        enrollments: parseEnrollments(enrollmentsRaw),
        trends: parseTrends(trendsRaw),
        kpis: parseKpis(kpisRaw),
      });
    } catch {
      setError('Unable to fetch analytics data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isAuthLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect('/login');
  }

  /* ---------- derive card props from real data ---------- */

  const m = data.metrics;

  const metricCards = m
    ? [
        {
          label: 'Total Students',
          value: m.totalStudents.toLocaleString(),
          change: m.studentChange,
          changeUp: !m.studentChange.startsWith('-'),
          icon: Users,
          gradient: 'from-blue-500 to-cyan-400',
          bgGradient: 'from-blue-500/10 to-cyan-500/5',
        },
        {
          label: 'Active Courses',
          value: String(m.activeCourses),
          change: m.courseChange,
          changeUp: !m.courseChange.startsWith('-'),
          icon: BookOpen,
          gradient: 'from-emerald-500 to-teal-400',
          bgGradient: 'from-emerald-500/10 to-teal-500/5',
        },
        {
          label: 'Faculty',
          value: String(m.faculty),
          change: m.facultyChange,
          changeUp: !m.facultyChange.startsWith('-'),
          icon: GraduationCap,
          gradient: 'from-purple-500 to-fuchsia-400',
          bgGradient: 'from-purple-500/10 to-fuchsia-500/5',
        },
        {
          label: 'Revenue',
          value: m.revenue,
          change: m.revenueChange,
          changeUp: !m.revenueChange.startsWith('-'),
          icon: DollarSign,
          gradient: 'from-amber-500 to-orange-400',
          bgGradient: 'from-amber-500/10 to-orange-500/5',
        },
      ]
    : [];

  const maxEnrollment = Math.max(...data.enrollments.map((e) => e.pct), 1);

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Institution-wide metrics, trends, and data-driven insights.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-3.5 py-1.5 text-xs font-medium shadow-sm transition-all hover:border-primary/30 disabled:opacity-50"
          >
            <RefreshCw className={isLoading ? 'animate-spin' : ''} style={{ height: 12, width: 12 }} />
            Refresh
          </button>
          <div className="flex items-center gap-1.5 rounded-xl border bg-card p-1 shadow-sm">
            {([
              { key: '7d' as const, label: '7 days' },
              { key: '30d' as const, label: '30 days' },
              { key: '90d' as const, label: '90 days' },
              { key: '1y' as const, label: 'This year' },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTimeframe(key)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                  timeframe === key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 slide-up">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          <p className="flex-1 text-sm text-destructive">{error}</p>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-24">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Metric cards */}
          {metricCards.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metricCards.map((metric, i) => (
                <div
                  key={metric.label}
                  className={`card-lift rounded-xl border bg-card p-5 shadow-sm slide-up delay-${(i + 1) * 100}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="mt-1 text-3xl font-bold tracking-tight">{metric.value}</p>
                    </div>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${metric.bgGradient}`}
                    >
                      <metric.icon
                        className={`h-5 w-5 bg-gradient-to-br ${metric.gradient} bg-clip-text text-transparent`}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    {metric.changeUp ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
                    )}
                    <span
                      className={`text-xs font-medium ${metric.changeUp ? 'text-emerald-600' : 'text-destructive'}`}
                    >
                      {metric.change}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs last {timeframe === '1y' ? 'year' : timeframe}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-xl border bg-card py-12">
              <p className="text-sm text-muted-foreground">No metrics available.</p>
            </div>
          )}

          {/* Charts row */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Bar chart - Enrollment by Department */}
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Enrollment by Department
              </h3>
              {data.enrollments.length > 0 ? (
                <div className="mt-6 flex items-end gap-3" style={{ height: 200 }}>
                  {data.enrollments.map((item) => (
                    <div key={item.dept} className="flex flex-1 flex-col items-center justify-end gap-2">
                      <span className="text-[10px] font-medium text-muted-foreground">{item.count}</span>
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/60 transition-all duration-700 ease-out hover:from-primary/90 hover:to-primary/50"
                        style={{ height: `${(item.pct / maxEnrollment) * 100}%`, minHeight: 4 }}
                      />
                      <span className="text-[11px] font-medium text-muted-foreground">{item.dept}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 flex items-center justify-center" style={{ height: 200 }}>
                  <p className="text-xs text-muted-foreground">No enrollment data available.</p>
                </div>
              )}
            </div>

            {/* Line chart - Enrollment Trend */}
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Activity className="h-4 w-4 text-muted-foreground" />
                Monthly Trend
              </h3>
              {data.trends.length > 0 ? (
                <>
                  <div className="relative mt-4" style={{ height: 200 }}>
                    <svg viewBox="0 0 500 180" className="h-full w-full" preserveAspectRatio="none">
                      {/* Grid lines */}
                      {[0, 25, 50, 75, 100].map((y) => (
                        <line
                          key={y}
                          x1="0"
                          y1={y * 1.6}
                          x2="500"
                          y2={y * 1.6}
                          stroke="currentColor"
                          strokeOpacity="0.06"
                          strokeWidth="1"
                        />
                      ))}
                      {/* Area fill */}
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" className="text-primary" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0.01" className="text-primary" />
                        </linearGradient>
                      </defs>
                      <polygon
                        fill="url(#areaGradient)"
                        points={
                          data.trends
                            .map((d, i) => {
                              const x = (i / (data.trends.length - 1)) * 500;
                              const y = 160 - (d.value / Math.max(...data.trends.map((t) => t.value), 1)) * 160;
                              return `${x},${y}`;
                            })
                            .join(' ') + ' 500,160 0,160'
                        }
                      />
                      {/* Line */}
                      <polyline
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                        points={data.trends
                          .map((d, i) => {
                            const x = (i / (data.trends.length - 1)) * 500;
                            const y = 160 - (d.value / Math.max(...data.trends.map((t) => t.value), 1)) * 160;
                            return `${x},${y}`;
                          })
                          .join(' ')}
                      />
                      {/* Dots */}
                      {data.trends.map((d, i) => {
                        const x = (i / (data.trends.length - 1)) * 500;
                        const y = 160 - (d.value / Math.max(...data.trends.map((t) => t.value), 1)) * 160;
                        return (
                          <g key={d.month}>
                            <circle cx={x} cy={y} r="4" fill="currentColor" className="text-primary" />
                            <circle cx={x} cy={y} r="7" fill="currentColor" className="text-primary opacity-20" />
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <div className="mt-2 flex justify-between px-1 text-[11px] text-muted-foreground">
                    {data.trends
                      .filter((_, i) => i % 2 === 0 || i === data.trends.length - 1)
                      .map((d) => (
                        <span key={d.month}>{d.month}</span>
                      ))}
                  </div>
                </>
              ) : (
                <div className="mt-6 flex items-center justify-center" style={{ height: 200 }}>
                  <p className="text-xs text-muted-foreground">No trend data available.</p>
                </div>
              )}
            </div>
          </div>

          {/* KPI Grid */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold">
              <Filter className="h-4 w-4 text-muted-foreground" />
              Key Performance Indicators
            </h3>
            {data.kpis.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.kpis.map((kpi) => {
                  const numValue = parseFloat(kpi.value);
                  const numTarget = parseFloat(kpi.target);
                  const isPositive = !isNaN(numValue) && !isNaN(numTarget) ? numValue >= numTarget : true;
                  return (
                    <div
                      key={kpi.label}
                      className="group rounded-xl border bg-muted/20 p-4 transition-all hover:bg-muted/40 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium">{kpi.label}</p>
                        <div
                          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            isPositive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          Target: {kpi.target}
                        </div>
                      </div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight">{kpi.value}</span>
                        <span className="text-xs text-muted-foreground">current</span>
                      </div>
                      {/* Mini progress bar */}
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isPositive
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                              : 'bg-gradient-to-r from-amber-500 to-orange-400'
                          }`}
                          style={{
                            width:
                              isPositive || isNaN(numValue) || isNaN(numTarget) || numTarget === 0
                                ? '100%'
                                : `${(numValue / numTarget) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">No KPI data available.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
