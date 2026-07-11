'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import {
  Shield,
  Plus,
  Check,
  X,
  Edit3,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  Link,
  Bot,
  UserCheck,
  Save,
  Trash2,
  AlertTriangle,
  Loader2,
  UserCog,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Permission {
  id: string;
  label: string;
  module: string;
  icon: typeof Shield;
}

interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
  userCount?: number;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const ALL_PERMISSIONS: Permission[] = [
  { id: 'users.read', label: 'View Users', module: 'users', icon: Users },
  { id: 'users.write', label: 'Manage Users', module: 'users', icon: Users },
  { id: 'users.delete', label: 'Delete Users', module: 'users', icon: Users },
  { id: 'courses.read', label: 'View Courses', module: 'courses', icon: BookOpen },
  { id: 'courses.write', label: 'Manage Courses', module: 'courses', icon: BookOpen },
  { id: 'students.read', label: 'View Students', module: 'students', icon: UserCheck },
  { id: 'students.write', label: 'Manage Students', module: 'students', icon: UserCheck },
  { id: 'analytics.read', label: 'View Analytics', module: 'analytics', icon: BarChart3 },
  { id: 'settings.read', label: 'View Settings', module: 'settings', icon: Settings },
  { id: 'settings.write', label: 'Manage Settings', module: 'settings', icon: Settings },
  { id: 'connectors.read', label: 'View Connectors', module: 'connectors', icon: Link },
  { id: 'connectors.write', label: 'Manage Connectors', module: 'connectors', icon: Link },
  { id: 'ai.chat', label: 'Use AI Chat', module: 'ai', icon: Bot },
  { id: 'roles.read', label: 'View Roles', module: 'settings', icon: Shield },
  { id: 'roles.write', label: 'Manage Roles', module: 'settings', icon: Shield },
];

const MODULE_LABELS: Record<string, string> = {
  users: 'Users',
  courses: 'Courses',
  students: 'Students',
  analytics: 'Analytics',
  settings: 'Settings & Roles',
  connectors: 'Connectors',
  ai: 'AI Features',
};

const MODULE_ICONS: Record<string, typeof Shield> = {
  users: Users,
  courses: BookOpen,
  students: UserCheck,
  analytics: BarChart3,
  settings: Settings,
  connectors: Link,
  ai: Bot,
};

const MODULE_COLORS: Record<string, string> = {
  users: 'from-blue-500/20 to-blue-600/10 text-blue-600',
  courses: 'from-emerald-500/20 to-emerald-600/10 text-emerald-600',
  students: 'from-violet-500/20 to-violet-600/10 text-violet-600',
  analytics: 'from-amber-500/20 to-amber-600/10 text-amber-600',
  settings: 'from-rose-500/20 to-rose-600/10 text-rose-600',
  connectors: 'from-cyan-500/20 to-cyan-600/10 text-cyan-600',
  ai: 'from-indigo-500/20 to-indigo-600/10 text-indigo-600',
};

const DEFAULT_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access',
    isSystem: true,
    permissions: ALL_PERMISSIONS.map((p) => p.id),
    userCount: 3,
  },
  {
    id: 'instructor',
    name: 'Instructor',
    description: 'Course management and student views',
    isSystem: true,
    permissions: [
      'courses.read',
      'courses.write',
      'students.read',
      'analytics.read',
      'ai.chat',
      'users.read',
    ],
    userCount: 28,
  },
  {
    id: 'staff',
    name: 'Staff',
    description: 'Limited operational access',
    isSystem: false,
    permissions: ['students.read', 'courses.read', 'analytics.read', 'ai.chat', 'users.read'],
    userCount: 15,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getModulePermissions(module: string): Permission[] {
  return ALL_PERMISSIONS.filter((p) => p.module === module);
}

function getModules(): string[] {
  return [...new Set(ALL_PERMISSIONS.map((p) => p.module))];
}

// ─── Components ──────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        checked ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-sm ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function CreateRoleDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Role name is required');
      return;
    }
    onSave(trimmed, description.trim());
    setName('');
    setDescription('');
    setError('');
    onClose();
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="mx-4 w-full max-w-md rounded-xl border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="text-lg font-semibold">Create Custom Role</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Define a new role with custom permissions.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Role Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="input-modern"
              placeholder="e.g., Department Head"
              autoFocus
            />
            {error && (
              <p className="mt-1 text-xs text-destructive">{error}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-modern"
              placeholder="Brief description of this role"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={handleCancel} className="btn-secondary text-sm py-2 px-4">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary text-sm py-2 px-4">
            <Plus className="h-4 w-4" />
            Create Role
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmDialog({
  open,
  roleName,
  onClose,
  onConfirm,
}: {
  open: boolean;
  roleName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="mx-4 w-full max-w-sm rounded-xl border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Delete Role</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{roleName}</strong>?
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Users assigned to this role will lose their associated permissions.
          This action cannot be undone.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-secondary text-sm py-2 px-4">
            Cancel
          </button>
          <button onClick={onConfirm} className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90">
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(DEFAULT_ROLES[0].id);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? roles[0];

  const handleTogglePermission = (permissionId: string) => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== selectedRoleId) return role;
        const has = role.permissions.includes(permissionId);
        return {
          ...role,
          permissions: has
            ? role.permissions.filter((p) => p !== permissionId)
            : [...role.permissions, permissionId],
        };
      })
    );
  };

  const handleCreateRole = (name: string, description: string) => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const newRole: Role = {
      id,
      name,
      description,
      isSystem: false,
      permissions: [],
      userCount: 0,
    };
    setRoles((prev) => [...prev, newRole]);
    setSelectedRoleId(id);
  };

  const handleDeleteRole = (roleId: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    setShowDeleteDialog(null);
    if (selectedRoleId === roleId) {
      setSelectedRoleId(roles.filter((r) => r.id !== roleId)[0]?.id ?? '');
    }
  };

  const startEditing = (role: Role) => {
    if (role.isSystem) return;
    setEditingRoleId(role.id);
    setEditName(role.name);
  };

  const saveEditName = () => {
    if (!editingRoleId) return;
    const trimmed = editName.trim();
    if (!trimmed) return;
    setRoles((prev) =>
      prev.map((r) => (r.id === editingRoleId ? { ...r, name: trimmed } : r))
    );
    setEditingRoleId(null);
    setEditName('');
  };

  const handleSave = () => {
    setSaving(true);
    setSaved(false);
    // Simulate API save
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 600);
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage user roles and their access permissions across the platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-xs py-2 px-3"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Changes
          </button>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="btn-secondary text-xs py-2 px-3"
          >
            <Plus className="h-3.5 w-3.5" />
            New Role
          </button>
        </div>
      </div>

      {/* Saved indicator */}
      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
          <Check className="h-4 w-4" />
          Roles and permissions saved successfully
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* ─── Role list sidebar ─────────────────────────────────── */}
        <div className="space-y-1.5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Roles ({roles.length})
            </span>
          </div>
          {roles.map((role) => {
            const isSelected = role.id === selectedRoleId;
            const moduleCount = [...new Set(role.permissions.map((p) => p.split('.')[0]))].length;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`w-full rounded-lg border px-3 py-2.5 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-primary/30 bg-primary/5 shadow-sm ring-1 ring-primary/20'
                    : 'border-transparent hover:border-border hover:bg-accent/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {editingRoleId === role.id ? (
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="input-modern text-xs py-1 px-2 flex-1 min-w-0"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditName();
                          if (e.key === 'Escape') setEditingRoleId(null);
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          saveEditName();
                        }}
                        className="rounded p-0.5 text-emerald-600 hover:bg-emerald-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRoleId(null);
                        }}
                        className="rounded p-0.5 text-muted-foreground hover:bg-muted"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Shield className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{role.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {role.userCount ?? 0} users · {moduleCount} modules
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Row actions */}
                {isSelected && editingRoleId !== role.id && !role.isSystem && (
                  <div className="mt-2 flex items-center justify-end gap-1 border-t pt-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(role);
                      }}
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      title="Rename role"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteDialog(role.id);
                      }}
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      title="Delete role"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* System badge */}
                {role.isSystem && (
                  <div className="mt-1.5">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      System
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ─── Permission editor ─────────────────────────────────── */}
        <div className="space-y-6">
          {/* Selected role header */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{selectedRole.name}</h2>
                  <p className="text-xs text-muted-foreground">{selectedRole.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <UserCog className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {selectedRole.userCount ?? 0} users
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Shield className="h-3 w-3" />
                {selectedRole.permissions.length} permissions
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {[...new Set(selectedRole.permissions.map((p) => p.split('.')[0]))].length} modules
              </span>
              {selectedRole.isSystem && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                  System role — some permissions are fixed
                </span>
              )}
            </div>
          </div>

          {/* Permission grids by module */}
          {getModules().map((module) => {
            const perms = getModulePermissions(module);
            const ModuleIcon = MODULE_ICONS[module];
            const colorClass = MODULE_COLORS[module];
            const modulePermCount = perms.filter((p) =>
              selectedRole.permissions.includes(p.id)
            ).length;

            return (
              <div
                key={module}
                className="rounded-xl border bg-card shadow-sm overflow-hidden"
              >
                {/* Module header */}
                <div className="flex items-center justify-between border-b bg-muted/30 px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${colorClass}`}
                    >
                      <ModuleIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">
                        {MODULE_LABELS[module]}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {modulePermCount}/{perms.length}
                  </span>
                </div>

                {/* Permission toggles */}
                <div className="divide-y divide-border">
                  {perms.map((perm) => {
                    const isChecked = selectedRole.permissions.includes(perm.id);
                    const PermIcon = perm.icon;
                    return (
                      <div
                        key={perm.id}
                        className={`flex items-center justify-between px-5 py-3 transition-colors ${
                          isChecked ? 'bg-primary/[0.02]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                              isChecked
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <PermIcon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{perm.label}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {perm.id}
                            </p>
                          </div>
                        </div>
                        <Toggle
                          checked={isChecked}
                          onChange={() => handleTogglePermission(perm.id)}
                          label={perm.label}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Save footer */}
          <div className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">
              Changes are applied locally. Click <strong>Save Changes</strong> to persist.
            </p>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-xs py-2 px-4">
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CreateRoleDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSave={handleCreateRole}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog !== null}
        roleName={roles.find((r) => r.id === showDeleteDialog)?.name ?? ''}
        onClose={() => setShowDeleteDialog(null)}
        onConfirm={() => showDeleteDialog && handleDeleteRole(showDeleteDialog)}
      />
    </div>
  );
}
