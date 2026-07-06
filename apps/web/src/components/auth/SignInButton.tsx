'use client';

import { signIn, signOut } from '@/hooks/useAuth';
import { LogIn, LogOut } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';

interface SignInButtonProps extends ComponentPropsWithoutRef<'button'> {
  provider?: string;
  callbackUrl?: string;
}

export function SignInButton({
  provider,
  callbackUrl = '/dashboard',
  children,
  ...props
}: SignInButtonProps) {
  if (!provider) {
    return (
      <a
        href="/login"
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <LogIn className="h-4 w-4" />
        Sign In
      </a>
    );
  }

  return (
    <button
      onClick={() => signIn(provider, { callbackUrl })}
      className="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
      {...props}
    >
      {children ?? 'Sign in'}
    </button>
  );
}

interface SignOutButtonProps extends ComponentPropsWithoutRef<'button'> {
  callbackUrl?: string;
}

export function SignOutButton({ callbackUrl, ...props }: SignOutButtonProps) {
  return (
    <button
      onClick={() => signOut(callbackUrl)}
      className="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
      {...props}
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
}
