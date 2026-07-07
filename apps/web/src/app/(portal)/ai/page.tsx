import { AiChat } from '@/components/ai-chat';

export const dynamic = 'force-dynamic';

export default function AIPage() {
  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Assistant</h1>
        <p className="mt-2 text-muted-foreground">
          Ask questions about courses, students, or get help with administrative tasks.
        </p>
      </div>
      <AiChat />
    </div>
  );
}
