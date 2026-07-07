'use client';

export const dynamic = 'force-dynamic';

import { BarChart3, TrendingUp, Users, BookOpen, GraduationCap, DollarSign, Activity } from 'lucide-react';

const METRICS = [
  { label: 'Total Students', value: '2,100', change: '+5.2%', icon: Users, color: 'text-blue-600 bg-blue-100' },
  { label: 'Active Courses', value: '138', change: '+3.8%', icon: BookOpen, color: 'text-green-600 bg-green-100' },
  { label: 'Faculty', value: '69', change: '+2.1%', icon: GraduationCap, color: 'text-purple-600 bg-purple-100' },
  { label: 'Revenue', value: '$14.2M', change: '+8.4%', icon: DollarSign, color: 'text-amber-600 bg-amber-100' },
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

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Institution-wide metrics, trends, and data-driven insights.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((metric) => (
          <div key={metric.label} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${metric.color}`}>
                <metric.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{metric.value}</p>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              <span className="font-medium text-green-600">{metric.change}</span>
              <span className="text-muted-foreground">vs last year</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* CSS Bar chart - Enrollment by Department */}
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="mb-5 flex items-center gap-2 font-semibold">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Enrollment by Department
          </h3>
          <div className="flex items-end gap-3" style={{ height: 200 }}>
            {ENROLLMENT_DATA.map((item) => (
              <div key={item.dept} className="flex flex-1 flex-col items-center justify-end gap-2">
                <div className="w-full rounded-t-sm bg-primary transition-all duration-500 ease-out"
                  style={{ height: `${item.pct * 1.8}%`, minHeight: 4 }}
                />
                <span className="text-xs text-muted-foreground">{item.dept}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
            {ENROLLMENT_DATA.map((item) => (
              <div key={item.dept} className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CSS Line chart - Enrollment Trend */}
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="mb-5 flex items-center gap-2 font-semibold">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Monthly Enrollment Trend
          </h3>
          <div className="relative" style={{ height: 200 }}>
            <svg viewBox="0 0 500 180" className="h-full w-full" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line key={y} x1="0" y1={y * 1.6} x2="500" y2={y * 1.6} stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
              ))}
              {/* Area fill */}
              <polygon
                fill="currentColor"
                fillOpacity="0.1"
                className="text-primary"
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
                  <circle key={d.month} cx={x} cy={y} r="3" fill="currentColor" className="text-primary" />
                );
              })}
            </svg>
          </div>
          <div className="mt-2 flex justify-between px-1 text-xs text-muted-foreground">
            {MONTHLY_TREND.filter((_, i) => i % 2 === 0).map((d) => (
              <span key={d.month}>{d.month}</span>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          Key Performance Indicators
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Graduation Rate', value: '87%', target: '85%' },
            { label: 'Retention Rate', value: '92%', target: '90%' },
            { label: 'Student-Faculty Ratio', value: '18:1', target: '20:1' },
            { label: 'Course Completion Rate', value: '94%', target: '90%' },
            { label: 'Job Placement Rate', value: '78%', target: '80%' },
            { label: 'Average GPA', value: '3.42', target: '3.30' },
          ].map((kpi) => (
            <div key={kpi.label} className="flex items-center justify-between rounded-md border bg-muted/30 px-4 py-3 text-sm">
              <span className="text-muted-foreground">{kpi.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Target: {kpi.target}</span>
                <span className={`font-semibold ${kpi.value >= kpi.target ? 'text-green-600' : 'text-amber-600'}`}>
                  {kpi.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
