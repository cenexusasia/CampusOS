export const dynamic = 'force-dynamic';

import { Users, Search, Filter, Plus, MoreHorizontal } from 'lucide-react';

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage student records, enrollments, and academic progress.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Add Student
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search students..."
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent">
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="grid grid-cols-5 gap-4 border-b px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span className="col-span-2">Name</span>
          <span>ID</span>
          <span>Course</span>
          <span className="text-right">Actions</span>
        </div>
        {[
          { name: 'Alex Johnson', id: 'STU-2024-001', course: 'Computer Science' },
          { name: 'Maria Garcia', id: 'STU-2024-002', course: 'Business Administration' },
          { name: 'James Wilson', id: 'STU-2024-003', course: 'Data Science' },
        ].map((student) => (
          <div
            key={student.id}
            className="grid grid-cols-5 gap-4 border-b px-6 py-4 text-sm last:border-0"
          >
            <div className="col-span-2 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {student.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <span className="font-medium">{student.name}</span>
            </div>
            <span className="self-center text-muted-foreground">{student.id}</span>
            <span className="self-center text-muted-foreground">{student.course}</span>
            <div className="flex items-center justify-end self-center">
              <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
