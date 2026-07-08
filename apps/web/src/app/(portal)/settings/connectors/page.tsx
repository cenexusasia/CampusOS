'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  Plug,
  Unplug,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ExternalLink,
  Cpu,
  BookOpen,
  GraduationCap,
  Building2,
  MessageSquare,
  Globe,
  Puzzle,
} from 'lucide-react';

interface Connector {
  id: string;
  provider: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string | null;
  config?: Record<string, unknown>;
}

interface ConnectorState {
  connectors: Connector[];
  loading: boolean;
  error: string | null;
  syncing: Record<string, boolean>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api-production-bdc0.up.railway.app';

const CONNECTOR_DEFINITIONS: Record<
  string,
  {
    label: string;
    description: string;
    icon: typeof Database;
    gradient: string;
    accent: string;
    bgClass: string;
  }
> = {
  moodle: {
    label: 'Moodle',
    description: 'LMS integration — sync courses, enrollments, and grades from your Moodle instance.',
    icon: BookOpen,
    gradient: 'from-orange-500 to-amber-400',
    accent: 'text-orange-600 dark:text-orange-400',
    bgClass: 'bg-orange-50 dark:bg-orange-950/30',
  },
  opensis: {
    label: 'OpenSIS',
    description: 'SIS integration — sync student records, demographics, and academic history.',
    icon: GraduationCap,
    gradient: 'from-emerald-500 to-teal-400',
    accent: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  'google-workspace': {
    label: 'Google Workspace',
    description: 'Connect Google Workspace — enable SSO, email sync, and Drive integration.',
    icon: Globe,
    gradient: 'from-blue-500 to-cyan-400',
    accent: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
  },
  erp: {
    label: 'ERP',
    description: 'Enterprise resource planning integration — coming in a future release.',
    icon: Building2,
    gradient: 'from-purple-500 to-fuchsia-400',
    accent: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-50 dark:bg-purple-950/30',
  },
  crm: {
    label: 'CRM',
    description: 'Customer relationship management integration — coming in a future release.',
    icon: Cpu,
    gradient: 'from-rose-500 to-pink-400',
    accent: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-50 dark:bg-rose-950/30',
  },
  chatbot: {
    label: 'Chatbot',
    description: 'AI-powered chatbot integration — coming in a future release.',
    icon: MessageSquare,
    gradient: 'from-violet-500 to-indigo-400',
    accent: 'text-violet-600 dark:text-violet-400',
    bgClass: 'bg-violet-50 dark:bg-violet-950/30',
  },
};

// "Coming Soon" connectors are pre-defined and never fetched from API
const COMING_SOON_PROVIDERS = new Set(['erp', 'crm', 'chatbot']);

function formatLastSync(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function ConnectorsPage() {
  const { data: session } = useSession();
  const [state, setState] = useState<ConnectorState>({
    connectors: [],
    loading: true,
    error: null,
    syncing: {},
  });

  const getAuthHeaders = useCallback((): HeadersInit => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = (session as unknown as Record<string, unknown>)?.accessToken;
    if (token && typeof token === 'string') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [session]);

  const fetchConnectors = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE}/api/v1/connectors`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch connectors (${res.status})`);
      }
      const data: Connector[] = await res.json();
      setState((prev) => ({ ...prev, connectors: data, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Unable to load connectors',
      }));
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchConnectors();
  }, [fetchConnectors]);

  const handleSync = async (connector: Connector) => {
    if (connector.provider !== 'moodle') return;

    setState((prev) => ({
      ...prev,
      syncing: { ...prev.syncing, [connector.id]: true },
    }));

    try {
      const res = await fetch(`${API_BASE}/api/v1/connectors/moodle/${connector.id}/sync`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error(`Sync failed (${res.status})`);
      }
      // Refresh connector data after sync
      await fetchConnectors();
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setState((prev) => ({
        ...prev,
        syncing: { ...prev.syncing, [connector.id]: false },
      }));
    }
  };

  const handleDisconnect = async (connector: Connector) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/connectors/${connector.provider}/${connector.id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );
      if (!res.ok) {
        throw new Error(`Disconnect failed (${res.status})`);
      }
      await fetchConnectors();
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  const handleConnect = async (provider: string) => {
    // For Google Workspace — this would typically redirect to OAuth
    window.open(`${API_BASE}/api/auth/${provider}/connect`, '_blank');
  };

  const getConnectorForProvider = (provider: string): Connector | undefined => {
    return state.connectors.find(
      (c) => c.provider === provider || c.provider === provider.replace('-', '')
    );
  };

  const renderConnectorCard = (
    providerKey: string,
    _index: number
  ) => {
    const def = CONNECTOR_DEFINITIONS[providerKey];
    const isComingSoon = COMING_SOON_PROVIDERS.has(providerKey);
    const connector = getConnectorForProvider(providerKey);
    const isConnected = connector?.status === 'connected';
    const isSyncing = connector ? state.syncing[connector.id] : false;

    const Icon = def.icon;

    return (
      <div
        key={providerKey}
        className={`card-lift group relative overflow-hidden rounded-xl border bg-card shadow-sm ${
          isConnected ? 'ring-1 ring-primary/20' : ''
        }`}
      >
        {/* Gradient accent bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${def.gradient}`}
        />

        <div className="p-5 pt-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${def.bgClass}`}>
              <Icon className={`h-5 w-5 ${def.accent}`} />
            </div>
            {isComingSoon ? (
              <span className="badge-neutral">Coming Soon</span>
            ) : isConnected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                <Wifi className="h-3 w-3" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
                <WifiOff className="h-3 w-3" />
                Disconnected
              </span>
            )}
          </div>

          {/* Title & description */}
          <h3 className="mt-3 text-sm font-semibold">{def.label}</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {def.description}
          </p>

          {/* Last sync info */}
          {!isComingSoon && (
            <div className="mt-4 space-y-2 border-t pt-4">
              {connector?.lastSync ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>Last sync: <span className="font-medium text-foreground">{formatLastSync(connector.lastSync)}</span></span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>Last sync: <span className="font-medium">Never</span></span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {!isComingSoon && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {isConnected && connector && (
                <>
                  <button
                    onClick={() => handleSync(connector)}
                    disabled={isSyncing}
                    className="btn-primary flex-1 sm:flex-none text-xs py-2 px-3"
                  >
                    {isSyncing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                  <button
                    onClick={() => handleDisconnect(connector)}
                    className="btn-secondary flex-1 sm:flex-none text-xs py-2 px-3"
                  >
                    <Unplug className="h-3.5 w-3.5" />
                    Disconnect
                  </button>
                </>
              )}
              {!isConnected && !isComingSoon && (
                <button
                  onClick={() => handleConnect(providerKey)}
                  className="btn-primary text-xs py-2 px-3"
                >
                  <Plug className="h-3.5 w-3.5" />
                  Connect
                </button>
              )}
              {connector?.status === 'error' && (
                <button
                  onClick={() => handleDisconnect(connector)}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  <Unplug className="h-3.5 w-3.5" />
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const providers = Object.keys(CONNECTOR_DEFINITIONS);
  const connectedCount = state.connectors.filter((c) => c.status === 'connected').length;
  const totalCount = providers.filter((p) => !COMING_SOON_PROVIDERS.has(p)).length;

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Connectors</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage third-party integrations for your campus systems.
          </p>
        </div>
        <button
          onClick={fetchConnectors}
          disabled={state.loading}
          className="btn-secondary text-xs py-2 px-3"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${state.loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        <div className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2 shadow-sm">
          <Puzzle className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{totalCount} Available</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-emerald-600">{connectedCount} Connected</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            {totalCount - connectedCount} Disconnected
          </span>
        </div>
      </div>

      {/* Error state */}
      {state.error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 slide-up">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          <p className="flex-1 text-sm text-destructive">{state.error}</p>
          <button
            onClick={fetchConnectors}
            className="btn-secondary text-xs py-1 px-3"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {state.loading && !state.error ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-20 shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading connectors...</p>
          </div>
        </div>
      ) : (
        /* Connector cards grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider, i) => renderConnectorCard(provider, i))}
        </div>
      )}

      {/* Info footer */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <ExternalLink className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium">About Connectors</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Connectors allow CampusOS to integrate with your existing campus infrastructure.
              Connected connectors enable automatic data synchronization, single sign-on (SSO),
              and unified search across systems. New connector types are added regularly —
              check back for updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
