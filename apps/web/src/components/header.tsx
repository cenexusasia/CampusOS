'use client';

import { Bell, Search, User } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        {searchOpen ? (
          <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-64 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
              onBlur={() => { setSearchOpen(false); }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSearchOpen(false);
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => { setSearchOpen(true); }}
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Search className="h-4 w-4" />
            Search...
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
          <Bell className="h-4 w-4" />
        </button>
        <button className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
          <User className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
