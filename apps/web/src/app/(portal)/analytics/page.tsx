'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
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
} from 'lucide-react';

const METRICS = [
  {
    label: 'Total Students',
    value: '2,100',
    change: '+5.2%',
    changeUp: true,
    icon: Users,
    gradient: 'from-blue-500 to-cyan-400',
    bgGradient: 'from-blue-500/10 to-cyan-500/5',
  },
  {
    label: 'Active Courses',
    value: '138',
    change: '+3.8%',
    changeUp: true,
    icon: BookOpen,
    gradient: 'from-emerald-500 to-teal-400',
    bgGradient: 'from-emerald-500/10 to-teal-500/5',
  },
  {
    label: 'Faculty',
    value: '69',
    change: '+2.1%',
    changeUp: true,
    icon: GraduationCap,
    gradient: 'from-purple-500 to-fuchsia-400',
    bgGradient: 'from-purple-500/10 to-fuchsia-500/5',
  },
  {
    label: 'Revenue',
    value: '$14.2M',
    change: '+8.4%',
    changeUp: true,
    icon: DollarSign,
    gradient: 'from-amber-500 to-orange-400',
    bgGradient: 'from-amber-500/10 to-orange-500/5',
  },
];

const ENROLLMENT_DATA = [
  { dept: 'CS', count: 320, pct: 15 },
  { dept: 'Business', count: 580, pct: 28 },
  { dept: 'Data Sci', count: 210, pct: 10 },
  { dept: 'English', count: 450, pct: 21 },
  { dept: 'Math', count: 380, pct: 18 },
  { dept: 'Physics', count: 160, pct: 8 },
];

const MONTHLY_TREND = [
  { month: 'Jan', value: 40 },
  { month: 'Feb', value: 55 },
  { month: 'Mar', value: 48 },
  { month: 'Apr', value: 65 },
  { month: 'May', value: 72 },
  { month: 'Jun', value: 68 },
  { month: 'Jul', value: 80 },
  { month: 'Aug', value: 85 },
  { month: 'Sep', value: 92 },
  { month: 'Oct', value: 88 },
  { month: 'Nov', value: 95 },
  { month: 'Dec', value: 100 },
];

const KPIS = [
  { label: 'Graduation Rate', value: '87%', target: '85%' },
  { label: 'Retention Rate', value: '92%', target: '90%' },
  { label: 'Student-Faculty Ratio', value: '18:1', target: '20:1' },
  { label: 'Course Completion Rate', value: '94%', target: '90%' },
  { label: 'Job Placement Rate', value: '78%', target: '80%' },
  { label: 'Average GPA', value: '3.42', target: '3.30' },
];

type TimeFrame = '7d' | '30d' | '90d' | '1y';

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<TimeFrame>('30d');

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

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((metric, i) => (
          <div
            key={metric.label}
            className={`card-lift rounded-xl border bg-card p-5 shadow-sm slide-up delay-${(i + 1) * 100}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">{metric.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${metric.bgGradient}`}>
                <metric.icon className={`h-5 w-5 bg-gradient-to-br ${metric.gradient} bg-clip-text text-transparent`} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              {metric.changeUp ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
              )}
              <span className={`text-xs font-medium ${metric.changeUp ? 'text-emerald-600' : 'text-destructive'}`}>
                {metric.change}
              </span>
              <span className="text-xs text-muted-foreground">vs last {timeframe === '1y' ? 'year' : timeframe}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Bar chart - Enrollment by Department */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Enrollment by Department
          </h3>
          <div className="mt-6 flex items-end gap-3" style={{ height: 200 }}>
            {ENROLLMENT_DATA.map((item) => (
              <div key={item.dept} className="flex flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[10px] font-medium text-muted-foreground">{item.count}</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/60 transition-all duration-700 ease-out hover:from-primary/90 hover:to-primary/50"
                  style={{ height: `${item.pct * 1.8}%`, minHeight: 4 }}
                />
                <span className="text-[11px] font-medium text-muted-foreground">{item.dept}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Line chart - Enrollment Trend */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Monthly Enrollment Trend
          </h3>
          <div className="relative mt-4" style={{ height: 200 }}>
            <svg viewBox="0 0 500 180" className="h-full w-full" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="0" y1={y * 1.6} x2="500" y2={y * 1.6}
                  stroke="currentColor" strokeOpacity="0.06" strokeWidth="1"
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
                points={MONTHLY_TREND.map((d, i) => {
                  const x = (i / (MONTHLY_TREND.length - 1)) * 500;
                  const y = 160 - (d.value / 100) * 160;
                  return `${x},${y}`;
                }).join(' ') + ' 500,160 0,160'}
              />
              {/* Line */}
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
                points={MONTHLY_TREND.map((d, i) => {
                  const x = (i / (MONTHLY_TREND.length - 1)) * 500;
                  const y = 160 - (d.value / 100) * 160;
                  return `${x},${y}`;
                }).join(' ')}
              />
              {/* Dots */}
              {MONTHLY_TREND.map((d, i) => {
                const x = (i / (MONTHLY_TREND.length - 1)) * 500;
                const y = 160 - (d.value / 100) * 160;
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
            {MONTHLY_TREND.filter((_, i) => i % 2 === 0).map((d) => (
              <span key={d.month}>{d.month}</span>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold">
          <Filter className="h-4 w-4 text-muted-foreground" />
          Key Performance Indicators
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {KPIS.map((kpi) => {
            const isPositive = kpi.value >= kpi.target;
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
                    style={{ width: isPositive ? '100%' : `${(parseFloat(kpi.value) / parseFloat(kpi.target)) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
