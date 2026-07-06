'use client';

import { useAuth, signOut } from '@/hooks/useAuth';
import { User, Settings, LogOut, Building2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function UserMenu() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
        <User className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <a
        href="/login"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-accent"
        title="Sign in"
      >
        <User className="h-4 w-4 text-muted-foreground" />
      </a>
    );
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary hover:bg-primary/20"
        title={user.name ?? user.email ?? 'User'}
      >
        {user.image ? (
          <img
            src={user.image}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-card p-1 shadow-lg">
          <div className="border-b px-3 py-2">
            <p className="truncate text-sm font-medium">
              {user.name ?? 'User'}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
          <div className="py-1">
            <a
              href="/settings"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              Settings
            </a>
            {user.email && ( // will check tenant admin role here
              <a
                href="/admin/tenants"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Building2 className="h-4 w-4" />
                Tenant
              </a>
            )}
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
