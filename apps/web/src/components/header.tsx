'use client';

import { Bell, Search, LogOut, Settings, User, ChevronDown, X, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const userName = user?.name ?? 'User';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Search keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setDropdownOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur-lg px-3 md:px-6">
      {/* Left: Menu toggle on mobile + Search */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Hamburger — visible on mobile only */}
        <button
          onClick={onMenuToggle}
          className="touch-target inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {searchOpen ? (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 shadow-sm scale-in flex-1 md:flex-none">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything..."
              aria-label="Search"
              className="w-full md:w-64 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setSearchOpen(false);
                  setSearchQuery('');
                }
              }}
            />
            <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              esc
            </kbd>
            <button
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
              }}
              aria-label="Close search"
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className="touch-target flex items-center gap-2 rounded-lg border border-transparent px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-0.5 md:gap-1">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setDropdownOpen(false);
            }}
            className={cn(
              'touch-target relative rounded-lg p-2 transition-colors',
              notifOpen
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-lg border bg-card shadow-lg scale-in z-50">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h3 className="text-sm font-semibold">Notifications</h3>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  2 new
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                <div className="px-4 py-3 text-sm hover:bg-muted/50 cursor-pointer transition-colors">
                  <p className="font-medium text-foreground">System update completed</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    CampusOS v0.1.0 has been deployed successfully.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <div className="px-4 py-3 text-sm hover:bg-muted/50 cursor-pointer transition-colors">
                  <p className="font-medium text-foreground">Welcome to CampusOS</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Get started by exploring your dashboard.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="border-t px-4 py-2.5">
                <button className="w-full text-center text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotifOpen(false);
            }}
            className={cn(
              'touch-target flex items-center gap-2 rounded-lg p-1.5 transition-colors',
              dropdownOpen
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
            aria-label="User menu"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {userInitials}
            </div>
            <span className="hidden lg:inline text-sm font-medium text-foreground">
              {user?.name ?? 'User'}
            </span>
            <ChevronDown className={cn(
              'hidden lg:block h-3.5 w-3.5 transition-transform duration-200',
              dropdownOpen && 'rotate-180',
            )} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-card shadow-lg scale-in z-50">
              <div className="border-b px-4 py-3">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">{user?.email ?? 'user@school.edu'}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="touch-target flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  Profile
                </button>
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="touch-target flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Settings
                </button>
              </div>
              <div className="border-t py-1">
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="touch-target flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
