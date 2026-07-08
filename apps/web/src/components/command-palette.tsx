'use client';
import { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, BookOpen, GraduationCap,
  Building2, BarChart3, Bot, Settings, Search
} from 'lucide-react';

const pages = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'students', name: 'Students', icon: Users, href: '/students' },
  { id: 'courses', name: 'Courses', icon: BookOpen, href: '/courses' },
  { id: 'faculty', name: 'Faculty', icon: GraduationCap, href: '/faculty' },
  { id: 'departments', name: 'Departments', icon: Building2, href: '/departments' },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, href: '/analytics' },
  { id: 'ai', name: 'AI Chat', icon: Bot, href: '/ai' },
  { id: 'settings', name: 'Settings', icon: Settings, href: '/settings/connectors' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === '/' && !(e.metaKey || e.ctrlKey) && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50" onClick={() => setOpen(false)}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg mx-auto" onClick={e => e.stopPropagation()}>
            <Command className="rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
              <div className="flex items-center border-b border-gray-100 px-3">
                <Search className="w-4 h-4 text-gray-400" />
                <Command.Input
                  placeholder="Search pages, courses, or ask AI..."
                  className="flex-1 px-2 py-3 text-sm outline-none bg-transparent"
                  autoFocus
                />
              </div>
              <Command.List className="max-h-64 overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-gray-400">
                  No results found.
                </Command.Empty>
                <Command.Group heading="Pages" className="text-xs text-gray-400 font-medium px-2 py-1.5">
                  {pages.map(page => (
                    <Command.Item
                      key={page.id}
                      value={page.name}
                      onSelect={() => runCommand(() => router.push(page.href))}
                      className="flex items-center gap-2 px-2 py-2 text-sm rounded-lg cursor-pointer aria-selected:bg-blue-50 aria-selected:text-blue-600"
                    >
                      <page.icon className="w-4 h-4" />
                      {page.name}
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
              <div className="border-t border-gray-100 px-3 py-2 text-xs text-gray-400 flex gap-3">
                <span>⌘K to open</span>
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
                <span>Esc to close</span>
              </div>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
