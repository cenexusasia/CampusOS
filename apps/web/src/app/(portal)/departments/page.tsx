'use client';

export const dynamic = 'force-dynamic';

import { Building2, Plus, MoreHorizontal, Users, BookOpen, DollarSign, GraduationCap } from 'lucide-react';

interface Department {
  name: string;
  head: string;
  facultyCount: number;
  courseCount: number;
  budget: string;
}

const SAMPLE_DEPARTMENTS: Department[] = [
  { name: 'Computer Science', head: 'Dr. Sarah Chen', facultyCount: 12, courseCount: 24, budget: '$1,200,000' },
  { name: 'Business Administration', head: 'Prof. Michael Torres', facultyCount: 18, courseCount: 36, budget: '$2,100,000' },
  { name: 'Data Science', head: 'Dr. James Park', facultyCount: 8, courseCount: 16, budget: '$900,000' },
  { name: 'English & Literature', head: 'Prof. Emily Davis', facultyCount: 14, courseCount: 28, budget: '$1,500,000' },
  { name: 'Mathematics', head: 'Dr. Robert Kim', facultyCount: 10, courseCount: 20, budget: '$1,100,000' },
  { name: 'Physics', head: 'Prof. Lisa Martinez', facultyCount: 7, courseCount: 14, budget: '$800,000' },
];

const totalBudget = SAMPLE_DEPARTMENTS.reduce((sum, d) => sum + parseFloat(d.budget.replace(/[$,]/g, '')), 0);
const totalFaculty = SAMPLE_DEPARTMENTS.reduce((sum, d) => sum + d.facultyCount, 0);
const totalCourses = SAMPLE_DEPARTMENTS.reduce((sum, d) => sum + d.courseCount, 0);

const maxFaculty = Math.max(...SAMPLE_DEPARTMENTS.map((d) => d.facultyCount));
const maxBudget = Math.max(...SAMPLE_DEPARTMENTS.map((d) => parseFloat(d.budget.replace(/[$,]/g, ''))));

export default function DepartmentsPage() {
  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize and manage academic departments and their resources.
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Department
        </button>
      </div>

      {/* Aggregate metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{SAMPLE_DEPARTMENTS.length}</p>
              <p className="text-xs text-muted-foreground">Departments</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalFaculty}</p>
              <p className="text-xs text-muted-foreground">Faculty Members</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCourses}</p>
              <p className="text-xs text-muted-foreground">Courses</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">${(totalBudget / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-muted-foreground">Total Budget</p>
            </div>
          </div>
        </div>
      </div>

      {/* Department cards with progress bars */}
      <div className="grid gap-4 lg:grid-cols-2">
        {SAMPLE_DEPARTMENTS.map((dept) => {
          const budgetValue = parseFloat(dept.budget.replace(/[$,]/g, ''));
          const facultyPct = (dept.facultyCount / maxFaculty) * 100;
          const budgetPct = (budgetValue / maxBudget) * 100;

          return (
            <div
              key={dept.name}
              className="card-lift rounded-xl border bg-card p-5 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{dept.name}</h3>
                    <p className="text-xs text-muted-foreground">Head: {dept.head}</p>
                  </div>
                </div>
                <button className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              {/* Progress bars */}
              <div className="mt-5 space-y-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <GraduationCap className="h-3 w-3" />
                      Faculty
                    </span>
                    <span className="font-medium">{dept.facultyCount}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-400 transition-all duration-500"
                      style={{ width: `${facultyPct}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <BookOpen className="h-3 w-3" />
                      Courses
                    </span>
                    <span className="font-medium">{dept.courseCount}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${(dept.courseCount / Math.max(...SAMPLE_DEPARTMENTS.map((d) => d.courseCount))) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      Budget
                    </span>
                    <span className="font-mono font-medium">{dept.budget}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500"
                      style={{ width: `${budgetPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Head</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Faculty</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Courses</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Budget</th>
                <th className="w-16 px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SAMPLE_DEPARTMENTS.map((dept) => (
                <tr key={dept.name} className="transition-colors hover:bg-muted/30">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{dept.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-muted-foreground">{dept.head}</td>
                  <td className="px-6 py-3.5 text-sm">{dept.facultyCount}</td>
                  <td className="px-6 py-3.5 text-sm">{dept.courseCount}</td>
                  <td className="px-6 py-3.5 font-mono text-sm font-medium">{dept.budget}</td>
                  <td className="px-6 py-3.5 text-right">
                    <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
