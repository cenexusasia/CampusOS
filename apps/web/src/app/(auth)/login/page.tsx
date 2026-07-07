'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, GraduationCap, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = error || (errorParam === 'CredentialsSignin' ? 'Invalid email or password. Please try again.' : null);

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
          <GraduationCap className="h-7 w-7 text-primary-foreground" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">CampusOS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI Operating System for Education
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border bg-card p-8 shadow-lg ring-1 ring-black/5 fade-in">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold tracking-tight">Welcome back</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to your CampusOS account
          </p>
        </div>

        {/* Error message with animation */}
        {displayError && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive slide-up">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); }}
              placeholder="name@school.edu"
              required
              disabled={isLoading}
              autoComplete="email"
              className="input-modern"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); }}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                autoComplete="current-password"
                className="input-modern pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          SSO and OAuth providers will be available in a future update.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border bg-card p-8 shadow-lg ring-1 ring-black/5">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
