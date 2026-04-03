'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const CONTENT_TYPES = [
  'patterns',
  'themes',
  'blueprints',
  'shells',
  'archetypes',
];

function syntaxHighlight(json: string): string {
  return json
    .replace(
      /("(?:\\.|[^"\\])*")\s*:/g,
      '<span style="color:var(--d-coral)">$1</span>:'
    )
    .replace(
      /:\s*("(?:\\.|[^"\\])*")/g,
      ': <span style="color:var(--d-amber)">$1</span>'
    )
    .replace(
      /:\s*(\d+\.?\d*)/g,
      ': <span style="color:var(--d-cyan)">$1</span>'
    )
    .replace(
      /:\s*(true|false)/g,
      ': <span style="color:var(--d-green)">$1</span>'
    )
    .replace(
      /:\s*(null)/g,
      ': <span style="color:var(--d-text-muted)">$1</span>'
    );
}

export default function ContentNewPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState('patterns');
  const [namespace, setNamespace] = useState('');
  const [slug, setSlug] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [jsonData, setJsonData] = useState('{\n  \n}');
  const [error, setError] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  function handleJsonChange(value: string) {
    setJsonData(value);
    try {
      JSON.parse(value);
      setParseError(null);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!namespace.trim() || !slug.trim()) {
      setError('Namespace and slug are required.');
      return;
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonData);
    } catch {
      setError('JSON data is invalid. Please fix syntax errors.');
      return;
    }

    startTransition(async () => {
      try {
        // Retrieve token from supabase client-side session
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token ?? '';

        await api.publishContent(token, {
          type,
          namespace,
          slug,
          version,
          data: parsed,
        });

        router.push('/dashboard/content');
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to publish content.'
        );
      }
    });
  }

  let formattedJson = '';
  try {
    formattedJson = syntaxHighlight(JSON.stringify(JSON.parse(jsonData), null, 2));
  } catch {
    formattedJson = jsonData
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  return (
    <div className="d-section max-w-5xl" data-density="compact">
      <h1 className="d-label border-l-2 border-d-accent pl-2 text-lg mb-6">
        Publish Content
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: form fields */}
        <div className="d-surface rounded-lg p-5 flex flex-col gap-4">
          {error && (
            <div
              className="d-annotation px-3 py-2 rounded text-sm"
              data-status="error"
            >
              {error}
            </div>
          )}

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="type" className="text-sm font-medium text-d-text">
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="d-control w-full rounded-md py-2 px-3 text-sm appearance-none bg-d-bg"
            >
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Namespace */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="namespace"
              className="text-sm font-medium text-d-text"
            >
              Namespace <span className="text-d-coral">*</span>
            </label>
            <input
              id="namespace"
              type="text"
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
              placeholder="@myorg"
              className="d-control w-full rounded-md py-2 px-3 text-sm"
              required
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="slug" className="text-sm font-medium text-d-text">
              Slug <span className="text-d-coral">*</span>
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-pattern"
              className="d-control w-full rounded-md py-2 px-3 text-sm"
              required
            />
          </div>

          {/* Version */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="version"
              className="text-sm font-medium text-d-text"
            >
              Version
            </label>
            <input
              id="version"
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0.0"
              className="d-control w-full rounded-md py-2 px-3 text-sm"
            />
          </div>

          {/* JSON Data */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="json-data"
              className="text-sm font-medium text-d-text"
            >
              JSON Data <span className="text-d-coral">*</span>
            </label>
            <textarea
              id="json-data"
              value={jsonData}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="d-control w-full rounded-md py-2 px-3 text-sm font-mono min-h-[12rem] resize-y"
              spellCheck={false}
            />
            {parseError && (
              <p className="text-xs text-d-error">{parseError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending || !!parseError}
            className="d-interactive mt-2 py-2 px-4 text-sm rounded-md disabled:opacity-50 self-start"
            data-variant="primary"
          >
            {isPending ? 'Publishing...' : 'Publish'}
          </button>
        </div>

        {/* Right: JSON preview */}
        <div className="lum-code-block rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-d-border/50">
            <span className="text-xs font-medium text-d-muted">Preview</span>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(jsonData)}
              className="d-interactive py-1 px-2 text-xs rounded"
              data-variant="ghost"
            >
              Copy
            </button>
          </div>
          <pre className="p-4 text-sm font-mono overflow-x-auto leading-relaxed">
            <code dangerouslySetInnerHTML={{ __html: formattedJson }} />
          </pre>
        </div>
      </form>
    </div>
  );
}
