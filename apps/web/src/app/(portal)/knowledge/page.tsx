'use client';

import { useState, useCallback, useRef } from 'react';
import { Loader2, Upload, Search, FileText, AlertCircle, BookOpen } from 'lucide-react';

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

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="mt-2 text-muted-foreground">
          Upload documents and ask questions about your institution&apos;s data.
        </p>
      </div>

      {/* Upload section */}
      <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Upload Document</h2>
            <p className="text-sm text-muted-foreground">
              Upload PDF, DOCX, or TXT files for AI-powered search and Q&A
            </p>
          </div>
          <label className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
            {isUploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Choose File
              </span>
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
        </div>
      </div>

      {/* Search section */}
      <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            disabled={isSearching}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Search results */}
      {results.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            Search Results
          </h2>
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.chunkId}
                className="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{result.documentName}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    Score: {(result.score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {result.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents list */}
      {documents.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Uploaded Documents
          </h2>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 rounded-lg border bg-card p-3 shadow-sm"
              >
                <BookOpen className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(doc.size)}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    doc.status === 'READY'
                      ? 'bg-green-100 text-green-700'
                      : doc.status === 'PROCESSING'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {documents.length === 0 && results.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card/50 py-16">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-muted-foreground">No documents yet</h3>
          <p className="mt-1 text-sm text-muted-foreground/60">
            Upload documents to make them searchable by the AI assistant.
          </p>
        </div>
      )}
    </div>
  );
}
