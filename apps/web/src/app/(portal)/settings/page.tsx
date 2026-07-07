'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { User, Bell, Shield, Camera, Save } from 'lucide-react';

interface NotificationPreferences {
  emailAlerts: boolean;
  pushNotifications: boolean;
  dailyDigest: boolean;
  courseUpdates: boolean;
  systemAnnouncements: boolean;
  marketingEmails: boolean;
}

export default function SettingsPage() {
  const [name, setName] = useState('John Admin');
  const [email, setEmail] = useState('john.admin@campus.edu');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailAlerts: true,
    pushNotifications: true,
    dailyDigest: false,
    courseUpdates: true,
    systemAnnouncements: true,
    marketingEmails: false,
  });
  const [saved, setSaved] = useState(false);

  const toggleNotification = (key: keyof NotificationPreferences) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveProfile = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, notification preferences, and security.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Section */}
        <div className="rounded-lg border bg-card p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
            <User className="h-5 w-5 text-muted-foreground" />
            Profile
          </h2>

          <div className="mb-6 flex items-center gap-5">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                JA
              </div>
              <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upload a new avatar. JPG, PNG or GIF.</p>
              <p className="mt-1 text-xs text-muted-foreground">Recommended: 256x256px</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              {saved ? (
                <>Profile Saved</>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Password Change */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
            <Shield className="h-5 w-5 text-muted-foreground" />
            Password
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <button className="w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
              Update Password
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="rounded-lg border bg-card p-6 shadow-sm lg:col-span-3">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
            <Bell className="h-5 w-5 text-muted-foreground" />
            Notification Preferences
          </h2>

          <div className="space-y-1">
            {[
              { key: 'emailAlerts' as const, label: 'Email Alerts', description: 'Receive important updates via email' },
              { key: 'pushNotifications' as const, label: 'Push Notifications', description: 'Get real-time alerts in your browser' },
              { key: 'dailyDigest' as const, label: 'Daily Digest', description: 'Receive a daily summary of campus activities' },
              { key: 'courseUpdates' as const, label: 'Course Updates', description: 'Get notified about changes to course schedules' },
              { key: 'systemAnnouncements' as const, label: 'System Announcements', description: 'Stay informed about platform updates and maintenance' },
              { key: 'marketingEmails' as const, label: 'Marketing Emails', description: 'Receive newsletters and promotional content' },
            ].map(({ key, label, description }) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-muted/30"
              >
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <button
                  role="switch"
                  aria-checked={notifications[key]}
                  onClick={() => toggleNotification(key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifications[key] ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                      notifications[key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
