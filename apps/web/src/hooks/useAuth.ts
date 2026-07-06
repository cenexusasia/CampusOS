'use client';

import {
  useSession as nextAuthUseSession,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from 'next-auth/react';
import type { SignInOptions } from 'next-auth/react';

export function useAuth() {
  const { data: session, status, update } = nextAuthUseSession();

  return {
    session,
    user: session?.user ?? null,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isUnauthenticated: status === 'unauthenticated',
    update,
  };
}

export async function signIn(provider?: string, options?: SignInOptions) {
  return nextAuthSignIn(provider, options);
}

export async function signOut(callbackUrl?: string) {
  return nextAuthSignOut({ callbackUrl: callbackUrl ?? '/login' });
}

export { nextAuthUseSession as useSession };
