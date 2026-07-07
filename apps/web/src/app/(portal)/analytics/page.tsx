export const dynamic = 'force-dynamic';

import { BarChart3, TrendingUp, Users, BookOpen, GraduationCap, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Institution-wide metrics, trends, and data-driven insights.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Enrollment', value: '2,100', change: '+5.2%', icon: Users, color: 'text-blue-600 bg-blue-100' },
          { label: 'Active Courses', value: '138', change: '+3.8%', icon: BookOpen, color: 'text-green-600 bg-green-100' },
          { label: 'Faculty Count', value: '69', change: '+2.1%', icon: GraduationCap, color: 'text-purple-600 bg-purple-100' },
          { label: 'Revenue (YTD)', value: '$14.2M', change: '+8.4%', icon: DollarSign, color: 'text-amber-600 bg-amber-100' },
        ].map((metric) => (
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Enrollment by Department
          </h3>
          <div className="space-y-4">
            {[
              { dept: 'Computer Science', count: 320, pct: 15 },
              { dept: 'Business Administration', count: 580, pct: 28 },
              { dept: 'Data Science', count: 210, pct: 10 },
              { dept: 'English & Literature', count: 450, pct: 21 },
              { dept: 'Mathematics', count: 380, pct: 18 },
              { dept: 'Other', count: 160, pct: 8 },
            ].map((item) => (
              <div key={item.dept}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{item.dept}</span>
                  <span className="text-muted-foreground">{item.count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Key Performance Indicators
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Graduation Rate', value: '87%', target: '85%' },
              { label: 'Retention Rate', value: '92%', target: '90%' },
              { label: 'Student-Faculty Ratio', value: '18:1', target: '20:1' },
              { label: 'Course Completion Rate', value: '94%', target: '90%' },
              { label: 'Job Placement Rate', value: '78%', target: '80%' },
              { label: 'Average GPA', value: '3.42', target: '3.30' },
            ].map((kpi) => (
              <div key={kpi.label} className="flex items-center justify-between border-b pb-3 text-sm last:border-0 last:pb-0">
                <span className="text-muted-foreground">{kpi.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Target: {kpi.target}</span>
                  <span className={`font-semibold ${
                    kpi.value >= kpi.target ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {kpi.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
