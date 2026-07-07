'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Search, Plus, BookOpen, Users, GraduationCap, Clock } from 'lucide-react';

interface Course {
  code: string;
  name: string;
  department: string;
  instructor: string;
  students: number;
  status: 'Active' | 'Inactive';
}

const SAMPLE_COURSES: Course[] = [
  { code: 'CS 301', name: 'Data Structures & Algorithms', department: 'Computer Science', instructor: 'Dr. Sarah Chen', students: 45, status: 'Active' },
  { code: 'BUS 201', name: 'Principles of Management', department: 'Business Administration', instructor: 'Prof. Michael Torres', students: 62, status: 'Active' },
  { code: 'DS 401', name: 'Machine Learning Fundamentals', department: 'Data Science', instructor: 'Dr. James Park', students: 38, status: 'Active' },
  { code: 'ENG 101', name: 'English Composition', department: 'English & Literature', instructor: 'Prof. Emily Davis', students: 78, status: 'Active' },
  { code: 'MATH 202', name: 'Calculus II', department: 'Mathematics', instructor: 'Dr. Robert Kim', students: 55, status: 'Active' },
  { code: 'PHY 101', name: 'Introduction to Physics', department: 'Physics', instructor: 'Prof. Lisa Martinez', students: 50, status: 'Inactive' },
  { code: 'CS 450', name: 'Operating Systems', department: 'Computer Science', instructor: 'Dr. Sarah Chen', students: 32, status: 'Active' },
  { code: 'BUS 310', name: 'Marketing Strategy', department: 'Business Administration', instructor: 'Prof. Michael Torres', students: 41, status: 'Active' },
];

const gradientBorders = [
  'from-blue-500 to-cyan-400',
  'from-emerald-500 to-teal-400',
  'from-purple-500 to-fuchsia-400',
  'from-amber-500 to-orange-400',
  'from-rose-500 to-pink-400',
  'from-indigo-500 to-violet-400',
];

function getInstructorInitials(name: string): string {
  return name.split(' ').map((n) => n.replace(/^(Dr\.|Prof\.)\s*/, '')[0]).join('');
}

export default function CoursesPage() {
  const [search, setSearch] = useState('');

  const filtered = SAMPLE_COURSES.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = SAMPLE_COURSES.filter((c) => c.status === 'Active').length;
  const inactiveCount = SAMPLE_COURSES.filter((c) => c.status === 'Inactive').length;

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse and manage course offerings, curricula, and schedules.
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Course
        </button>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        <div className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2 shadow-sm">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{SAMPLE_COURSES.length} Total</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-emerald-600">{activeCount} Active</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">{inactiveCount} Inactive</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search by code, name, department, or instructor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-modern pl-10"
        />
      </div>

      {/* Course cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
            <BookOpen className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="mt-4 text-sm font-medium">No courses found</h3>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course, i) => (
            <div
              key={course.code}
              className="card-lift group relative overflow-hidden rounded-xl border bg-card shadow-sm"
            >
              {/* Gradient accent border top */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientBorders[i % gradientBorders.length]}`} />

              <div className="p-5 pt-6">
                {/* Course code + status */}
                <div className="flex items-start justify-between">
                  <span className="rounded-lg bg-muted px-2 py-0.5 text-xs font-mono font-medium text-muted-foreground">
                    {course.code}
                  </span>
                  <span className={course.status === 'Active' ? 'badge-success' : 'badge-neutral'}>
                    {course.status}
                  </span>
                </div>

                {/* Course name */}
                <h3 className="mt-3 text-sm font-semibold leading-snug">{course.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{course.department}</p>

                <div className="mt-4 space-y-2.5 border-t pt-4">
                  {/* Instructor */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                      {getInstructorInitials(course.instructor)}
                    </div>
                    <span className="text-xs text-muted-foreground">{course.instructor}</span>
                  </div>

                  {/* Enrollment */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <Users className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium">{course.students}</span>
                      <span className="text-xs text-muted-foreground">students enrolled</span>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Fall 2024</span>
                    </div>
                  </div>
                </div>

                {/* Hover overlay action */}
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-primary/0 opacity-0 transition-all duration-200 group-hover:bg-primary/5 group-hover:opacity-100">
                  <button className="btn-primary scale-90 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
