export const dynamic = 'force-dynamic';

import { Settings, User, Bell, Shield, Palette, Link, Database, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const sections = [
    {
      title: 'Profile',
      description: 'Manage your personal information and preferences.',
      icon: User,
      items: ['Name', 'Email', 'Avatar', 'Timezone'],
    },
    {
      title: 'Notifications',
      description: 'Configure how and when you receive notifications.',
      icon: Bell,
      items: ['Email alerts', 'Push notifications', 'Digest frequency', 'Quiet hours'],
    },
    {
      title: 'Security',
      description: 'Password, two-factor authentication, and session management.',
      icon: Shield,
      items: ['Password', '2FA', 'Active sessions', 'API tokens'],
    },
    {
      title: 'Appearance',
      description: 'Customize the look and feel of your CampusOS interface.',
      icon: Palette,
      items: ['Theme', 'Font size', 'Sidebar behavior', 'Compact mode'],
    },
    {
      title: 'Integrations',
      description: 'Connect third-party services and configure APIs.',
      icon: Link,
      items: ['LMS connector', 'SIS integration', 'Calendar sync', 'Webhooks'],
    },
    {
      title: 'Data',
      description: 'Export, import, and manage institution data.',
      icon: Database,
      items: ['Data export', 'Backup settings', 'Retention policy', 'Audit logs'],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, institution configuration, and integrations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <section.icon className="h-4.5 w-4.5 text-primary" style={{ height: 18, width: 18 }} />
              </div>
              <div>
                <h3 className="font-semibold">{section.title}</h3>
                <p className="text-xs text-muted-foreground">{section.description}</p>
              </div>
            </div>
            <div className="mt-4 space-y-1 border-t pt-4">
              {section.items.map((item) => (
                <button
                  key={item}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <span>{item}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
