'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Search, Plus, MoreHorizontal, Users, UserPlus, ChevronDown } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';

interface Student {
  name: string;
  email: string;
  course: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  enrolledDate: string;
}

const SAMPLE_STUDENTS: Student[] = [
  { name: 'Alex Johnson', email: 'alex.johnson@campus.edu', course: 'Computer Science', status: 'Active', enrolledDate: '2024-01-15' },
  { name: 'Maria Garcia', email: 'maria.garcia@campus.edu', course: 'Business Administration', status: 'Active', enrolledDate: '2023-08-22' },
  { name: 'James Wilson', email: 'james.wilson@campus.edu', course: 'Data Science', status: 'Active', enrolledDate: '2024-03-10' },
  { name: 'Emma Brown', email: 'emma.brown@campus.edu', course: 'English Literature', status: 'Active', enrolledDate: '2023-09-05' },
  { name: 'Liam Davis', email: 'liam.davis@campus.edu', course: 'Mathematics', status: 'Inactive', enrolledDate: '2024-02-18' },
  { name: 'Sophia Martinez', email: 'sophia.martinez@campus.edu', course: 'Physics', status: 'Active', enrolledDate: '2023-07-30' },
  { name: 'Noah Anderson', email: 'noah.anderson@campus.edu', course: 'Computer Science', status: 'Suspended', enrolledDate: '2024-05-01' },
  { name: 'Olivia Taylor', email: 'olivia.taylor@campus.edu', course: 'Data Science', status: 'Active', enrolledDate: '2024-01-20' },
];

const statusClasses: Record<Student['status'], string> = {
  Active: 'badge-success',
  Inactive: 'badge-neutral',
  Suspended: 'badge-error',
};

const statusDot: Record<Student['status'], string> = {
  Active: 'bg-emerald-500',
  Inactive: 'bg-muted-foreground',
  Suspended: 'bg-red-500',
};

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('');
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400',
    'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
    'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400',
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-400',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Student['status'] | 'All'>('All');
  const [sortField, setSortField] = useState<keyof Student | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const toggleSort = (field: keyof Student) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = SAMPLE_STUDENTS
    .filter(
      (s) =>
        (statusFilter === 'All' || s.status === statusFilter) &&
        (s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.email.toLowerCase().includes(search.toLowerCase()) ||
          s.course.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      const aVal = a[sortField];
      const bVal = b[sortField];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const statusCounts = {
    All: SAMPLE_STUDENTS.length,
    Active: SAMPLE_STUDENTS.filter((s) => s.status === 'Active').length,
    Inactive: SAMPLE_STUDENTS.filter((s) => s.status === 'Inactive').length,
    Suspended: SAMPLE_STUDENTS.filter((s) => s.status === 'Suspended').length,
  };

  const hasStudents = SAMPLE_STUDENTS.length > 0;

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage student records, enrollments, and academic progress.
          </p>
        </div>
        <button className="btn-primary">
          <UserPlus className="h-4 w-4" />
          Add Student
        </button>
      </div>

      {/* Stats summary bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {([
          { label: 'Total', count: statusCounts.All, color: 'text-foreground' },
          { label: 'Active', count: statusCounts.Active, color: 'text-emerald-600' },
          { label: 'Inactive', count: statusCounts.Inactive, color: 'text-muted-foreground' },
          { label: 'Suspended', count: statusCounts.Suspended, color: 'text-destructive' },
        ]).map((item) => (
          <div key={item.label} className="rounded-xl border bg-card px-4 py-3 shadow-sm">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className={`mt-0.5 text-xl font-bold ${item.color}`}>{item.count}</p>
          </div>
        ))}
      </div>

      {/* Search & filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search by name, email, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-modern pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['All', 'Active', 'Inactive', 'Suspended'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {status}
              <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                statusFilter === status ? 'bg-primary-foreground/20' : 'bg-muted'
              }`}>
                {statusCounts[status]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Empty state when no students at all */}
      {!hasStudents ? (
        <EmptyState
          icon={Users}
          title="No students yet"
          description="Sync from Moodle or OpenSIS to get started."
          action={{ label: 'Add Student', onClick: () => {} }}
        />
      ) : (
        <>
          {/* Table view (desktop) */}
          <div className="hidden overflow-hidden rounded-xl border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {([
                      { key: 'name' as const, label: 'Student' },
                      { key: 'email' as const, label: 'Email' },
                      { key: 'course' as const, label: 'Course' },
                      { key: 'status' as const, label: 'Status' },
                      { key: 'enrolledDate' as const, label: 'Enrolled' },
                    ]).map(({ key, label }) => (
                      <th
                        key={key}
                        onClick={() => toggleSort(key)}
                        className="cursor-pointer select-none px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          {sortField === key && (
                            <ChevronDown
                              className={`h-3 w-3 transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`}
                            />
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="w-16 px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState
                          icon={Users}
                          title="No students found"
                          description="Try adjusting your search or filter criteria."
                          action={{ label: 'Clear filters', onClick: () => { setSearch(''); setStatusFilter('All'); } }}
                        />
                      </td>
                    </tr>
                  ) : (
                    filtered.map((student) => (
                      <tr
                        key={student.email}
                        className="group transition-colors hover:bg-muted/30"
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(student.name)}`}>
                              {getInitials(student.name)}
                            </div>
                            <span className="text-sm font-medium">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-muted-foreground">{student.email}</td>
                        <td className="px-6 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-sm">
                            <span className={`h-1.5 w-1.5 rounded-full ${statusDot[student.status]}`} />
                            {student.course}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={statusClasses[student.status]}>{student.status}</span>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-muted-foreground">{student.enrolledDate}</td>
                        <td className="px-6 py-3.5 text-right">
                          <button className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-accent hover:text-foreground group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && (
              <div className="flex items-center justify-between border-t px-6 py-3 text-xs text-muted-foreground">
                <span>Showing {filtered.length} of {SAMPLE_STUDENTS.length} students</span>
                <span>{filtered.length} results</span>
              </div>
            )}
          </div>

          {/* Card view (mobile) */}
          <div className="space-y-3 md:hidden">
            {filtered.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No students found"
                description="Try adjusting your search or filter criteria."
                action={{ label: 'Clear filters', onClick: () => { setSearch(''); setStatusFilter('All'); } }}
              />
            ) : (
              filtered.map((student) => (
                <div
                  key={student.email}
                  className="card-lift rounded-xl border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(student.name)}`}>
                        {getInitials(student.name)}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">{student.name}</h3>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                    <span className={statusClasses[student.status]}>{student.status}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[student.status]}`} />
                      {student.course}
                    </span>
                    <span>Enrolled: {student.enrolledDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
