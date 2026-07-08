'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Settings,
  Users,
  BookOpen,
  BarChart3,
  GraduationCap,
  Building2,
  Bot,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'AI', href: '/ai', icon: Bot },
  { name: 'Faculty', href: '/faculty', icon: GraduationCap },
  { name: 'Departments', href: '/departments', icon: Building2 },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const mainLinks = navigation.slice(0, 4);

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Close mobile sidebar / drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [mobileOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    if (mobileOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => { document.removeEventListener('keydown', handleEscape); };
  }, [mobileOpen]);

  // Shared nav link renderer
  const renderNavLinks = (links: typeof navigation, showLabels: boolean) =>
    links.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
      return (
        <Link
          key={item.href}
          href={item.href}
          title={!showLabels ? item.name : undefined}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
            isActive
              ? 'bg-sidebar-primary/15 text-sidebar-primary ring-1 ring-sidebar-primary/20'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
            !showLabels && 'justify-center px-2',
          )}
        >
          <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-sidebar-primary')} />
          {showLabels && <span>{item.name}</span>}
        </Link>
      );
    });

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground animate-in fade-in slide-in-from-left-2 duration-200">
            CampusOS
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {renderNavLinks(navigation, !collapsed)}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ===================== */}
      {/* Desktop sidebar (lg+) */}
      {/* ===================== */}
      <aside
        ref={sidebarRef}
        className={cn(
          'hidden lg:flex flex-col bg-sidebar-background transition-all duration-300 ease-in-out',
          collapsed ? 'w-[var(--sidebar-collapsed-width)]' : 'w-[var(--sidebar-width)]',
        )}
      >
        {sidebarContent}
      </aside>

      {/* ================================================== */}
      {/* Tablet sidebar (md to lg) — collapsible with toggle */}
      {/* ================================================== */}
      <aside
        className={cn(
          'hidden md:flex lg:hidden flex-col bg-sidebar-background border-r border-sidebar-border transition-all duration-300 ease-in-out',
          collapsed ? 'w-[var(--sidebar-collapsed-width)]' : 'w-[var(--sidebar-width)]',
        )}
      >
        {sidebarContent}
      </aside>

      {/* ================== */}
      {/* Mobile overlay      */}
      {/* ================== */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={() => { setMobileOpen(false); }}
        />
      )}

      {/* ================================================== */}
      {/* Mobile drawer — slide-out with ALL navigation links */}
      {/* ================================================== */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar-width)] flex-col bg-sidebar-background',
          'transition-transform duration-300 ease-in-out md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Drawer header */}
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
            CampusOS
          </span>
        </div>

        {/* All navigation (including "more" items) */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {renderNavLinks(navigation, true)}
        </nav>

        {/* Close button */}
        <button
          onClick={() => { setMobileOpen(false); }}
          className="absolute right-3 top-3 rounded-md p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </aside>

      {/* ================== */}
      {/* Mobile bottom tab   */}
      {/* ================== */}
      {isMobile && (
        <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t bg-background px-2 pb-safe shadow-[0_-1px_0_rgba(0,0,0,0.05)] md:hidden">
          {mainLinks.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 px-2 min-w-0 transition-colors min-h-[44px] min-w-[44px]',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium truncate max-w-[56px]">{item.name}</span>
              </Link>
            );
          })}

          {/* "More" button — opens side drawer for remaining links */}
          <button
            onClick={() => { setMobileOpen(true); }}
            className="flex flex-col items-center gap-0.5 py-2 px-2 min-w-0 text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px]"
            aria-label="More navigation options"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </nav>
      )}
    </>
  );
}
