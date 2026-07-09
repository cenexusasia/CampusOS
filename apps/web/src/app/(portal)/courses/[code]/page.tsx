'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Users, Calendar, Clock, Loader2 } from 'lucide-react';

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
        if (!res.ok) throw new Error('Failed to fetch course');
        const data = await res.json();
        const found = Array.isArray(data) ? data.find((c: any) => c.code === code) : data;
        if (!found) throw new Error('Course not found');
        setCourse(found);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
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
