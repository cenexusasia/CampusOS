export const dynamic = 'force-dynamic';

import { BookOpen, Search, Filter, Plus, MoreHorizontal } from 'lucide-react';

export default function CoursesPage() {
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
          Create Course
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            code: 'CS 301',
            title: 'Data Structures & Algorithms',
            instructor: 'Dr. Sarah Chen',
            students: 45,
            status: 'Active',
          },
          {
            code: 'BUS 201',
            title: 'Principles of Management',
            instructor: 'Prof. Michael Torres',
            students: 62,
            status: 'Active',
          },
          {
            code: 'DS 401',
            title: 'Machine Learning Fundamentals',
            instructor: 'Dr. James Park',
            students: 38,
            status: 'Active',
          },
          {
            code: 'ENG 101',
            title: 'English Composition',
            instructor: 'Prof. Emily Davis',
            students: 78,
            status: 'Active',
          },
          {
            code: 'MATH 202',
            title: 'Calculus II',
            instructor: 'Dr. Robert Kim',
            students: 55,
            status: 'Active',
          },
          {
            code: 'PHY 101',
            title: 'Introduction to Physics',
            instructor: 'Prof. Lisa Martinez',
            students: 50,
            status: 'Inactive',
          },
        ].map((course) => (
          <div
            key={course.code}
            className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  course.status === 'Active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {course.status}
              </span>
            </div>
            <h3 className="mt-4 font-semibold">{course.title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{course.code}</p>
            <div className="mt-4 space-y-2 border-t pt-4 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Instructor</span>
                <span className="font-medium text-foreground">{course.instructor}</span>
              </div>
              <div className="flex justify-between">
                <span>Enrolled</span>
                <span className="font-medium text-foreground">{course.students}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
