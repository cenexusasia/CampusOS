'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Users, Calendar, Clock, Loader2 } from 'lucide-react';

const MOCK_COURSES = [
  { id: 'mock-1', code: 'cs-301', name: 'Data Structures & Algorithms', status: 'ACTIVE', instructor: 'Dr. Sarah Chen', department: 'Computer Science', credits: 3, schedule: 'Mon/Wed 10:00-11:30', enrolledCount: 45, maxEnrollment: 60, description: 'Comprehensive study of data structures including arrays, linked lists, trees, graphs, and algorithm analysis.' },
  { id: 'mock-2', code: 'bus-201', name: 'Principles of Management', status: 'ACTIVE', instructor: 'Prof. Michael Torres', department: 'Business Administration', credits: 3, schedule: 'Tue/Thu 9:00-10:30', enrolledCount: 52, maxEnrollment: 65, description: 'Fundamental concepts of management theory and practice.' },
  { id: 'mock-3', code: 'ds-401', name: 'Machine Learning Fundamentals', status: 'ACTIVE', instructor: 'Dr. James Park', department: 'Data Science', credits: 4, schedule: 'Mon/Wed/Fri 2:00-3:00', enrolledCount: 38, maxEnrollment: 45, description: 'Introduction to machine learning algorithms and applications.' },
  { id: 'mock-4', code: 'eng-101', name: 'English Composition', status: 'ACTIVE', instructor: 'Prof. Emily Davis', department: 'English', credits: 3, schedule: 'Tue/Thu 11:00-12:30', enrolledCount: 60, maxEnrollment: 70, description: 'Develop critical reading and writing skills.' },
  { id: 'mock-5', code: 'math-202', name: 'Calculus II', status: 'ACTIVE', instructor: 'Dr. Robert Kim', department: 'Mathematics', credits: 4, schedule: 'Mon/Wed/Fri 9:00-10:00', enrolledCount: 35, maxEnrollment: 50, description: 'Advanced calculus techniques including integration, series, and differential equations.' },
  { id: 'mock-6', code: 'phy-101', name: 'Introduction to Physics', status: 'INACTIVE', instructor: 'Prof. Lisa Martinez', department: 'Physics', credits: 4, schedule: 'Tue/Thu 2:00-3:30', enrolledCount: 28, maxEnrollment: 45, description: 'Survey of classical mechanics, thermodynamics, and electromagnetism.' },
  { id: 'mock-7', code: 'cs-450', name: 'Operating Systems', status: 'ACTIVE', instructor: 'Dr. Sarah Chen', department: 'Computer Science', credits: 3, schedule: 'Mon/Wed 2:00-3:30', enrolledCount: 40, maxEnrollment: 55, description: 'Study of operating system concepts including process management, memory management, and file systems.' },
  { id: 'mock-8', code: 'bus-310', name: 'Marketing Strategy', status: 'ACTIVE', instructor: 'Prof. Michael Torres', department: 'Business Administration', credits: 3, schedule: 'Tue/Thu 10:00-11:30', enrolledCount: 48, maxEnrollment: 60, description: 'Strategic marketing principles and practices for modern business environments.' },
];

interface CourseDetail {
  id: string;
  name: string;
  code: string;
  description?: string;
  instructor?: string;
  department?: string;
  credits?: number;
  status: string;
  schedule?: string;
  room?: string;
  enrolledCount?: number;
  maxEnrollment?: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const code = params.code as string;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://campusos-api-production-c965.up.railway.app';
        const res = await fetch(`${API_BASE}/api/v1/courses?search=${code}`);
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data?.data;
          const found = items?.find((c: any) => {
            const slug = (c.code || '').toLowerCase().replace(/\s+/g, '-');
            return slug === code || c.code === code;
          });
          if (found) {
            setCourse(found);
            setLoading(false);
            return;
          }
        }
      } catch {}
      // Fallback to mock data
      const mock = MOCK_COURSES.find(c => c.code === code);
      if (mock) {
        setCourse(mock);
      } else {
        setError('Course not found');
      }
      setLoading(false);
    };
    fetchCourse();
  }, [code]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (error || !course) return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-xl font-semibold">Course not found</h2>
      <p className="text-muted-foreground mt-2">{error || 'The course you are looking for does not exist.'}</p>
      <button onClick={() => router.push('/courses')} className="mt-4 btn-primary">
        Back to Courses
      </button>
    </div>
  );

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{course.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{course.code}</p>
          </div>
          <span className={`badge-${course.status === 'ACTIVE' ? 'success' : 'secondary'}`}>{course.status}</span>
        </div>

        {course.description && <p className="mt-4 text-sm text-muted-foreground">{course.description}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {course.instructor && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{course.instructor}</span>
            </div>
          )}
          {course.department && (
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>{course.department}</span>
            </div>
          )}
          {course.schedule && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{course.schedule}</span>
            </div>
          )}
          {course.credits && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{course.credits} credits</span>
            </div>
          )}
        </div>

        {course.enrolledCount !== undefined && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Enrolled</span>
              <span className="font-medium">{course.enrolledCount}{course.maxEnrollment ? ` / ${course.maxEnrollment}` : ''}</span>
            </div>
            {course.maxEnrollment && (
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(100, (course.enrolledCount || 0) / course.maxEnrollment * 100)}%` }} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
