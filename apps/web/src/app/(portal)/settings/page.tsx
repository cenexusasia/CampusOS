'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import {
  User,
  Bell,
  Shield,
  Camera,
  Save,
  Globe,
  Palette,
  KeyRound,
  CheckCircle2,
  Upload,
} from 'lucide-react';

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
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');

  const toggleNotification = (key: keyof NotificationPreferences) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveProfile = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const hasAllNotifications = Object.values(notifications).every(Boolean);

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile, notification preferences, and security.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Section */}
        <div className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
              <User className="h-4.5 w-4.5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Profile</h2>
          </div>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Avatar upload area */}
            <div className="flex shrink-0 flex-col items-center gap-3">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 text-3xl font-bold text-primary ring-4 ring-background">
                  JA
                </div>
                <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:scale-110">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="text-center">
                <button className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                  <Upload className="h-3 w-3" />
                  Upload photo
                </button>
                <p className="mt-0.5 text-[11px] text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
              </div>
            </div>

            {/* Form fields */}
            <div className="flex-1 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-modern"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="input-modern"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Theme</label>
                  <div className="flex gap-1.5 rounded-lg border bg-background p-1">
                    {([
                      { key: 'light', label: 'Light' },
                      { key: 'dark', label: 'Dark' },
                      { key: 'system', label: 'System' },
                    ] as const).map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setTheme(key)}
                        className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                          theme === key
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t pt-5">
            {saved ? (
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Profile saved successfully
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Changes are not saved until you click Save.
              </p>
            )}
            <button onClick={handleSaveProfile} className="btn-primary">
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Password Section */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/5">
              <KeyRound className="h-4.5 w-4.5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold">Password</h2>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-modern"
                placeholder="••••••••••"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-modern"
                placeholder="••••••••••"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-modern"
                placeholder="••••••••••"
              />
            </div>
            {/* Password strength indicator */}
            {newPassword && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        i <= (newPassword.length > 8 ? 4 : newPassword.length > 5 ? 3 : newPassword.length > 3 ? 2 : 1)
                          ? 'bg-emerald-500'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {newPassword.length > 8 ? 'Strong password' : newPassword.length > 5 ? 'Fair password' : 'Weak password'}
                </p>
              </div>
            )}
            <button className="btn-primary w-full">
              <Shield className="h-4 w-4" />
              Update Password
            </button>
          </div>
        </div>

        {/* Notification Preferences - full width */}
        <div className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/5">
                <Bell className="h-4.5 w-4.5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Notification Preferences</h2>
                <p className="text-xs text-muted-foreground">
                  Choose what notifications you want to receive.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const allOn = hasAllNotifications;
                setNotifications({
                  emailAlerts: !allOn,
                  pushNotifications: !allOn,
                  dailyDigest: !allOn,
                  courseUpdates: !allOn,
                  systemAnnouncements: !allOn,
                  marketingEmails: !allOn,
                });
              }}
              className="text-xs font-medium text-primary hover:underline"
            >
              {hasAllNotifications ? 'Disable all' : 'Enable all'}
            </button>
          </div>

          <div className="mt-6 divide-y divide-border">
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
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
                <div className="flex-1 pr-4">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                </div>
                <button
                  role="switch"
                  aria-checked={notifications[key]}
                  onClick={() => toggleNotification(key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    notifications[key] ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-sm ring-0 transition duration-200 ease-in-out ${
                      notifications[key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
            <button className="rounded-lg border border-destructive/30 bg-background px-4 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
