'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Search, Plus, MoreHorizontal } from 'lucide-react';

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

const statusStyles: Record<Student['status'], string> = {
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-muted text-muted-foreground',
  Suspended: 'bg-red-100 text-red-700',
};

export default function StudentsPage() {
  const [search, setSearch] = useState('');

  const filtered = SAMPLE_STUDENTS.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.course.toLowerCase().includes(search.toLowerCase())
  );

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
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search by name, email, or course..."
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
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Enrolled Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No students found.
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <tr key={student.email} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {student.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{student.email}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{student.course}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[student.status]}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{student.enrolledDate}</td>
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
