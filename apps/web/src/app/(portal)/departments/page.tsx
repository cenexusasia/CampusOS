'use client';

export const dynamic = 'force-dynamic';

import { Building2, Plus, MoreHorizontal } from 'lucide-react';

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

export default function DepartmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize and manage academic departments and their resources.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Add Department
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Head</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Faculty Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Course Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Budget</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_DEPARTMENTS.map((dept) => (
                <tr key={dept.name} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{dept.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{dept.head}</td>
                  <td className="px-6 py-4 text-sm">{dept.facultyCount}</td>
                  <td className="px-6 py-4 text-sm">{dept.courseCount}</td>
                  <td className="px-6 py-4 text-sm font-mono font-medium">{dept.budget}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent">
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
