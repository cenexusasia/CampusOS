export const dynamic = 'force-dynamic';

import { GraduationCap, Search, Filter, Plus, MoreHorizontal, Mail, Phone } from 'lucide-react';

export default function FacultyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Faculty</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage teaching staff, assignments, and faculty profiles.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Add Faculty
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search faculty..."
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent">
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            name: 'Dr. Sarah Chen',
            department: 'Computer Science',
            title: 'Associate Professor',
            email: 'sarah.chen@campus.edu',
            phone: '(555) 123-4567',
            courses: 3,
          },
          {
            name: 'Prof. Michael Torres',
            department: 'Business',
            title: 'Department Chair',
            email: 'michael.torres@campus.edu',
            phone: '(555) 234-5678',
            courses: 2,
          },
          {
            name: 'Dr. James Park',
            department: 'Data Science',
            title: 'Assistant Professor',
            email: 'james.park@campus.edu',
            phone: '(555) 345-6789',
            courses: 4,
          },
          {
            name: 'Prof. Emily Davis',
            department: 'English',
            title: 'Senior Lecturer',
            email: 'emily.davis@campus.edu',
            phone: '(555) 456-7890',
            courses: 5,
          },
          {
            name: 'Dr. Robert Kim',
            department: 'Mathematics',
            title: 'Professor',
            email: 'robert.kim@campus.edu',
            phone: '(555) 567-8901',
            courses: 3,
          },
        ].map((faculty) => (
          <div
            key={faculty.email}
            className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                {faculty.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-semibold">{faculty.name}</h3>
                <p className="text-xs text-muted-foreground">{faculty.title}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 border-t pt-4 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Department</span>
                <span className="font-medium text-foreground">{faculty.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Courses</span>
                <span className="font-medium text-foreground">{faculty.courses}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-accent">
                  <Mail className="h-3 w-3" />
                  Email
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-accent">
                  <Phone className="h-3 w-3" />
                  Call
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
