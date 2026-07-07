'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Search, Plus, Mail, Phone, BookOpen, GraduationCap } from 'lucide-react';

interface FacultyMember {
  name: string;
  department: string;
  title: string;
  email: string;
  courses: number;
}

const SAMPLE_FACULTY: FacultyMember[] = [
  { name: 'Dr. Sarah Chen', department: 'Computer Science', title: 'Associate Professor', email: 'sarah.chen@campus.edu', courses: 3 },
  { name: 'Prof. Michael Torres', department: 'Business Administration', title: 'Department Chair', email: 'michael.torres@campus.edu', courses: 2 },
  { name: 'Dr. James Park', department: 'Data Science', title: 'Assistant Professor', email: 'james.park@campus.edu', courses: 4 },
  { name: 'Prof. Emily Davis', department: 'English & Literature', title: 'Senior Lecturer', email: 'emily.davis@campus.edu', courses: 5 },
  { name: 'Dr. Robert Kim', department: 'Mathematics', title: 'Professor', email: 'robert.kim@campus.edu', courses: 3 },
  { name: 'Prof. Lisa Martinez', department: 'Physics', title: 'Assistant Professor', email: 'lisa.martinez@campus.edu', courses: 2 },
  { name: 'Dr. William Foster', department: 'Computer Science', title: 'Professor', email: 'william.foster@campus.edu', courses: 4 },
];

const departmentColors: Record<string, string> = {
  'Computer Science': 'from-blue-500/20 to-cyan-500/10',
  'Business Administration': 'from-amber-500/20 to-orange-500/10',
  'Data Science': 'from-purple-500/20 to-fuchsia-500/10',
  'English & Literature': 'from-rose-500/20 to-pink-500/10',
  'Mathematics': 'from-emerald-500/20 to-teal-500/10',
  'Physics': 'from-indigo-500/20 to-violet-500/10',
};

function getInitials(name: string): string {
  return name.split(' ').map((n) => n.replace(/^(Dr\.|Prof\.)\s*/, '')[0]).join('');
}

export default function FacultyPage() {
  const [search, setSearch] = useState('');

  const filtered = SAMPLE_FACULTY.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.department.toLowerCase().includes(search.toLowerCase()) ||
      f.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Faculty</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage teaching staff, assignments, and faculty profiles.
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Faculty
        </button>
      </div>

      {/* Quick stats + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2 shadow-sm">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{SAMPLE_FACULTY.length} Members</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2 shadow-sm">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {SAMPLE_FACULTY.reduce((sum, f) => sum + f.courses, 0)} Courses
            </span>
          </div>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search by name, department, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-modern pl-10"
          />
        </div>
      </div>

      {/* Faculty grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
            <GraduationCap className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="mt-4 text-sm font-medium">No faculty members found</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search criteria.
          </p>
          <button
            onClick={() => setSearch('')}
            className="mt-4 text-xs font-medium text-primary hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((faculty) => (
            <div
              key={faculty.email}
              className="card-lift group relative rounded-xl border bg-card p-5 shadow-sm"
            >
              {/* Avatar + info */}
              <div className="flex flex-col items-center text-center">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${departmentColors[faculty.department] || 'from-primary/20 to-primary/10'} text-lg font-bold text-primary ring-2 ring-background transition-transform duration-200 group-hover:scale-105`}>
                  {getInitials(faculty.name)}
                </div>
                <h3 className="mt-3 font-semibold text-sm">{faculty.name}</h3>
                <p className="text-xs text-muted-foreground">{faculty.title}</p>
              </div>

              {/* Department tag */}
              <div className="mt-3 flex justify-center">
                <span className="inline-flex items-center rounded-full bg-muted/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {faculty.department}
                </span>
              </div>

              {/* Detail rows */}
              <div className="mt-4 space-y-2 border-t pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Email</span>
                  <a href={`mailto:${faculty.email}`} className="font-medium text-primary hover:underline">
                    {faculty.email}
                  </a>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Courses</span>
                  <span className="inline-flex items-center gap-1 font-medium">
                    <BookOpen className="h-3 w-3 text-muted-foreground" />
                    {faculty.courses}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex gap-2">
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border bg-background py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                  <Mail className="h-3 w-3" />
                  Email
                </button>
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border bg-background py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                  <Phone className="h-3 w-3" />
                  Call
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
