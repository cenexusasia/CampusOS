'use client';

import { useState, useCallback, useRef, DragEvent } from 'react';
import {
  Loader2,
  Upload,
  Search,
  FileText,
  AlertCircle,
  BookOpen,
  UploadCloud,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface Document {
  id: string;
  name: string;
  status: 'PROCESSING' | 'READY' | 'ERROR';
  size: number;
  createdAt: string;
}

interface SearchResult {
  chunkId: string;
  documentId: string;
  content: string;
  documentName: string;
  score: number;
}

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/api/v1/ai/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const doc = await res.json();
      setDocuments((prev) => [doc, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/ai/documents/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), limit: 10 }),
      });

      if (!res.ok) throw new Error('Search failed');

      const data: SearchResult[] = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearch();
    },
    [handleSearch],
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    // Handle file drop - this is a visual cue; actual upload goes through the input
  }, []);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'bg-emerald-500';
    if (score >= 0.6) return 'bg-amber-500';
    return 'bg-muted-foreground';
  };

  return (
    <div className="space-y-8 page-enter">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload documents and ask questions about your institution&apos;s data.
        </p>
      </div>

      {/* Upload area with drag-and-drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-border bg-card hover:border-primary/30 hover:bg-muted/20'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200 ${
            isDragOver ? 'bg-primary/10 scale-110' : 'bg-muted/50'
          }`}>
            <UploadCloud className={`h-8 w-8 transition-colors duration-200 ${
              isDragOver ? 'text-primary' : 'text-muted-foreground/60'
            }`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              {isDragOver ? 'Drop files here' : 'Upload documents'}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Drag & drop PDF, DOCX, TXT, MD, or CSV files, or click to browse.
            </p>
          </div>
          <label className="btn-primary text-xs touch-target w-full sm:w-auto">
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Choose Files
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md,.csv"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
          <p className="text-[11px] text-muted-foreground">Max file size: 25MB</p>
        </div>
      </div>

      {/* Search section */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Search className="h-4.5 w-4.5 text-primary" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            disabled={isSearching}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); }}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="btn-primary text-xs px-4 py-2"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          <p className="flex-1 text-sm text-destructive">{error}</p>
          <button
            onClick={() => setError(null)}
            className="rounded-md p-1 text-destructive/70 hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search results */}
      {results.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="h-5 w-5 text-primary" />
              Search Results
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {results.length}
              </span>
            </h2>
          </div>
          <div className="space-y-3">
            {results.map((result) => {
              const scorePct = Math.round(result.score * 100);
              const scoreColor = getScoreColor(result.score);
              return (
                <div
                  key={result.chunkId}
                  className="group rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">{result.documentName}</span>
                        <p className="text-xs text-muted-foreground">Document</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Relevance bar */}
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${scoreColor} transition-all duration-500`}
                            style={{ width: `${scorePct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium tabular-nums">{scorePct}%</span>
                      </div>
                      <span className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground leading-relaxed">
                    {result.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Documents list */}
      {documents.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Uploaded Documents
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {documents.length}
              </span>
            </h2>
          </div>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(doc.size)} &middot; {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Just now'}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    doc.status === 'READY'
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : doc.status === 'PROCESSING'
                        ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {doc.status === 'PROCESSING' && <Loader2 className="h-3 w-3 animate-spin" />}
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {documents.length === 0 && results.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-card/50 py-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/30">
            <BookOpen className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <h3 className="mt-5 text-base font-medium text-muted-foreground">No documents yet</h3>
          <p className="mt-1 text-sm text-muted-foreground/60">
            Upload documents to make them searchable by the AI assistant.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary mt-5 text-sm"
          >
            <Upload className="h-4 w-4" />
            Upload your first document
          </button>
        </div>
      )}
    </div>
  );
}
