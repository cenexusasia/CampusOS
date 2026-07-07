import { AiChat } from '@/components/ai-chat';
import { Sparkles, Zap, Shield, Globe } from 'lucide-react';

export const dynamic = 'force-dynamic';

const CAPABILITIES = [
  {
    icon: Sparkles,
    title: 'Natural Language',
    description: 'Ask questions in plain English about your institution.',
    gradient: 'from-blue-500/10 to-cyan-500/5',
    iconColor: 'text-blue-600',
  },
  {
    icon: Zap,
    title: 'Real-Time Data',
    description: 'Get up-to-date information across all connected systems.',
    gradient: 'from-amber-500/10 to-orange-500/5',
    iconColor: 'text-amber-600',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data stays within your institution\'s environment.',
    gradient: 'from-emerald-500/10 to-teal-500/5',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Globe,
    title: 'Multi-System',
    description: 'Seamlessly query LMS, SIS, HRIS, and ERP data.',
    gradient: 'from-purple-500/10 to-fuchsia-500/5',
    iconColor: 'text-purple-600',
  },
];

export default function AIPage() {
  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask questions about courses, students, or get help with administrative tasks.
        </p>
      </div>

      {/* Capability cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CAPABILITIES.map((cap, i) => (
          <div
            key={cap.title}
            className={`rounded-xl border bg-card p-4 shadow-sm slide-up delay-${(i + 1) * 100}`}
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${cap.gradient}`}>
              <cap.icon className={`h-4.5 w-4.5 ${cap.iconColor}`} />
            </div>
            <h3 className="mt-3 text-sm font-semibold">{cap.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{cap.description}</p>
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div className="min-h-[600px]">
        <AiChat />
      </div>
    </div>
  );
}
