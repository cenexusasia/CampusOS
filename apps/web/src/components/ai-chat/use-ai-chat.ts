'use client';

import { useState, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setError(null);
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://api-production-60fbe.up.railway.app';
      const token = typeof window !== 'undefined' ? (await import('next-auth/react')).getSession() : null;

      // Get auth token from session
      let authToken = '';
      try {
        const session = await (await import('next-auth/react')).getSession();
        if (session?.user) {
          // Try to get from the session's access token
          const res = await fetch('/api/auth/session');
          const data = await res.json();
          if (data.accessToken) authToken = data.accessToken;
        }
      } catch {}

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`${apiUrl}/api/v1/ai/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`AI service responded with status ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content ?? 'No response received.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const retryLastMessage = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      // Remove the last assistant response if any
      setMessages((prev) => {
        const lastAssistantIdx = prev.length - 1;
        if (prev[lastAssistantIdx]?.role === 'assistant') {
          return prev.slice(0, -1);
        }
        return prev;
      });
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage,
  };
}
