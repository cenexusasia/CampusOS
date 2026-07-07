export const dynamic = 'force-dynamic';

import { Building2, Plus, MoreHorizontal, Users, BookOpen, GraduationCap } from 'lucide-react';

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

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            name: 'Computer Science',
            head: 'Dr. Sarah Chen',
            faculty: 12,
            students: 320,
            courses: 24,
            budget: '$1.2M',
          },
          {
            name: 'Business Administration',
            head: 'Prof. Michael Torres',
            faculty: 18,
            students: 580,
            courses: 36,
            budget: '$2.1M',
          },
          {
            name: 'Data Science',
            head: 'Dr. James Park',
            faculty: 8,
            students: 210,
            courses: 16,
            budget: '$0.9M',
          },
          {
            name: 'English & Literature',
            head: 'Prof. Emily Davis',
            faculty: 14,
            students: 450,
            courses: 28,
            budget: '$1.5M',
          },
          {
            name: 'Mathematics',
            head: 'Dr. Robert Kim',
            faculty: 10,
            students: 380,
            courses: 20,
            budget: '$1.1M',
          },
          {
            name: 'Physics',
            head: 'Prof. Lisa Martinez',
            faculty: 7,
            students: 160,
            courses: 14,
            budget: '$0.8M',
          },
        ].map((dept) => (
          <div
            key={dept.name}
            className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{dept.name}</h3>
                  <p className="text-xs text-muted-foreground">Head: {dept.head}</p>
                </div>
              </div>
              <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Faculty</span>
                </div>
                <p className="mt-1 text-lg font-bold">{dept.faculty}</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>Students</span>
                </div>
                <p className="mt-1 text-lg font-bold">{dept.students}</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Courses</span>
                </div>
                <p className="mt-1 text-lg font-bold">{dept.courses}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
              <span>Annual Budget</span>
              <span className="font-semibold text-foreground">{dept.budget}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
