'use client';

import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';
import type { ChatMessage } from './use-ai-chat';

interface AiChatMessageProps {
  message: ChatMessage;
}

export function AiChatMessage({ message }: AiChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-3',
        isUser ? 'bg-muted/50' : 'bg-background'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 space-y-1 overflow-hidden">
        <p className="text-xs font-medium text-muted-foreground">
          {isUser ? 'You' : 'CampusOS AI'}
        </p>
        <div className="prose prose-sm max-w-none text-sm whitespace-pre-wrap break-words">
          {message.content}
        </div>
        <p className="text-xs text-muted-foreground">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
