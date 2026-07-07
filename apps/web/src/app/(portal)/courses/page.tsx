'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { BookOpen, Search, Plus, MoreHorizontal } from 'lucide-react';

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

const statusStyles: Record<Course['status'], string> = {
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-muted text-muted-foreground',
};

export default function CoursesPage() {
  const [search, setSearch] = useState('');

  const filtered = SAMPLE_COURSES.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse and manage course offerings, curricula, and schedules.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Add Course
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search by code, name, department, or instructor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Instructor</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No courses found.
                  </td>
                </tr>
              ) : (
                filtered.map((course) => (
                  <tr key={course.code} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-medium">{course.code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{course.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{course.department}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{course.instructor}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{course.students}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[course.status]}`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
