'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, BookOpen } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';

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

const COURSE_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2'];

function computeProgress(code: string): number {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.min(100, Math.max(10, Math.abs(hash) % 100));
}

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', code: '', description: '', credits: 3 });
  const [saving, setSaving] = useState(false);

  const filtered = SAMPLE_COURSES.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = SAMPLE_COURSES.filter((c) => c.status === 'Active').length;
  const inactiveCount = SAMPLE_COURSES.filter((c) => c.status === 'Inactive').length;
  const hasCourses = SAMPLE_COURSES.length > 0;

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
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
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

      {/* Course cards grid */}
      {hasCourses && filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description="Try adjusting your search criteria."
          action={{ label: 'Clear search', onClick: () => setSearch('') }}
        />
      ) : hasCourses ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((course, index) => {
            const progress = computeProgress(course.code);
            return (
              <Link
                key={course.code}
                href={`/courses/${course.code.toLowerCase().replace(/\s+/g, '-')}`}
                className="block group"
              >
                <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div
                    className="h-2"
                    style={{ backgroundColor: COURSE_COLORS[index % COURSE_COLORS.length] }}
                  />
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm leading-snug">
                        {course.name}
                      </h3>
                      <span
                        className={
                          course.status === 'Active'
                            ? 'badge-success shrink-0 ml-2'
                            : 'badge-neutral shrink-0 ml-2'
                        }
                      >
                        {course.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{course.code}</p>
                    <p className="text-xs text-gray-500 mt-2">{course.instructor}</p>
                    <div className="mt-3">
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{progress}% complete</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Connect your LMS to sync courses."
        />
      )}

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Add Course</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Course Name</label>
                <input value={newCourse.name} onChange={e => setNewCourse(p => ({...p, name: e.target.value}))} className="input-modern w-full mt-1" placeholder="e.g. Introduction to AI" />
              </div>
              <div>
                <label className="text-sm font-medium">Course Code</label>
                <input value={newCourse.code} onChange={e => setNewCourse(p => ({...p, code: e.target.value}))} className="input-modern w-full mt-1" placeholder="e.g. CS 401" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea value={newCourse.description} onChange={e => setNewCourse(p => ({...p, description: e.target.value}))} className="input-modern w-full mt-1" rows={3} placeholder="Course description" />
              </div>
              <div>
                <label className="text-sm font-medium">Credits</label>
                <input type="number" value={newCourse.credits} onChange={e => setNewCourse(p => ({...p, credits: parseInt(e.target.value) || 0}))} className="input-modern w-full mt-1" min={1} max={6} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowAddModal(false)} className="btn-ghost">Cancel</button>
              <button onClick={async () => {
                setSaving(true);
                await new Promise(r => setTimeout(r, 500));
                setShowAddModal(false);
                setSaving(false);
              }} disabled={saving || !newCourse.name || !newCourse.code} className="btn-primary">
                {saving ? 'Saving...' : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
