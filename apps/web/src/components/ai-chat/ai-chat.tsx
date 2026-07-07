'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import { useAiChat } from './use-ai-chat';
import { AiChatMessage } from './ai-chat-message';
import { cn } from '@/lib/utils';

export function AiChat() {
  const { messages, isLoading, error, sendMessage, clearMessages, retryLastMessage } = useAiChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="font-semibold text-sm">AI Assistant</h3>
          <p className="text-xs text-muted-foreground">
            Ask questions across all your connected systems.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            title="Clear conversation"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Send className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-medium text-sm">Start a conversation</h4>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
              Ask about student data, course analytics, or anything related to your institution.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {[
                'How many students are enrolled this semester?',
                'Show me course completion rates',
                'What is the average GPA by department?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => { sendMessage(suggestion); }}
                  className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {messages.map((message) => (
              <AiChatMessage key={message.id} message={message} />
            ))}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 px-4 py-3 bg-background">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground">CampusOS AI</p>
              <p className="mt-1 text-sm text-muted-foreground animate-pulse">Thinking...</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 border-t border-destructive/30 bg-destructive/5 px-4 py-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="flex-1 text-xs text-destructive">{error}</p>
            <button
              onClick={retryLastMessage}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex items-end gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); }}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your institution..."
            disabled={isLoading}
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors',
              'hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          CampusOS AI may produce inaccurate information. Verify important responses.
        </p>
      </div>
    </div>
  );
}
