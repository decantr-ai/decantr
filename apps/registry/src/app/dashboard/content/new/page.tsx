'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { JsonViewer } from '@/components/json-viewer';
import { api } from '@/lib/api';
import { CONTENT_TYPES } from '@/lib/content-types';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function ContentNewPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: 'patterns',
    name: '',
    slug: '',
    namespace: '@official',
    description: '',
    version: '1.0.0',
    tags: '',
  });
  const [slugEdited, setSlugEdited] = useState(false);
  const [jsonData, setJsonData] = useState('{\n  \n}');
  const [parseError, setParseError] = useState<string | null>(null);

  function update(field: string, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && !slugEdited) {
        next.slug = toSlug(value);
      }
      return next;
    });
  }

  function handleJsonChange(value: string) {
    setJsonData(value);
    try {
      JSON.parse(value);
      setParseError(null);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }

  const preview = useMemo(() => {
    let parsedData: unknown = undefined;
    try {
      parsedData = JSON.parse(jsonData);
    } catch {
      parsedData = undefined;
    }
    return {
      type: form.type,
      name: form.name || undefined,
      slug: form.slug || undefined,
      namespace: form.namespace,
      description: form.description || undefined,
      version: form.version || undefined,
      tags: form.tags
        ? form.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
      data: parsedData,
    };
  }, [form, jsonData]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.namespace.trim() || !form.slug.trim()) {
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
          type: form.type,
          namespace: form.namespace,
          slug: form.slug,
          version: form.version,
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

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold">Publish Content</h3>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Left: form card */}
        <div className="d-surface" style={{ maxWidth: '40rem' }}>
          {error && (
            <div
              className="d-annotation"
              data-status="error"
              style={{ marginBottom: '1rem', display: 'block' }}
            >
              {error}
            </div>
          )}

          {/* Basic Info */}
          <section className="flex flex-col gap-4">
            <span
              className="d-label block mb-2"
              style={{
                paddingLeft: '0.75rem',
                borderLeft: '2px solid var(--d-accent)',
              }}
            >
              Basic Info
            </span>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold" htmlFor="type">
                Type
              </label>
              <select
                id="type"
                className="d-control"
                value={form.type}
                onChange={(e) => update('type', e.target.value)}
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                className="d-control"
                type="text"
                placeholder="My Pattern"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold" htmlFor="slug">
                Slug
              </label>
              <input
                id="slug"
                className="d-control"
                type="text"
                placeholder="my-pattern"
                value={form.slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  update('slug', e.target.value);
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold" htmlFor="namespace">
                Namespace
              </label>
              <select
                id="namespace"
                className="d-control"
                value={form.namespace}
                onChange={(e) => update('namespace', e.target.value)}
              >
                <option value="@official">@official</option>
                <option value="@community">@community</option>
              </select>
            </div>
          </section>

          {/* Details */}
          <section
            className="flex flex-col gap-4"
            style={{ marginTop: '1.5rem' }}
          >
            <span
              className="d-label block mb-2"
              style={{
                paddingLeft: '0.75rem',
                borderLeft: '2px solid var(--d-accent)',
              }}
            >
              Details
            </span>

            <div className="flex flex-col gap-1">
              <label
                className="text-sm font-semibold"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                id="description"
                className="d-control"
                placeholder="Describe your content item..."
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                style={{ minHeight: '6rem', resize: 'vertical' }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold" htmlFor="version">
                Version
              </label>
              <input
                id="version"
                className="d-control"
                type="text"
                placeholder="1.0.0"
                value={form.version}
                onChange={(e) => update('version', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold" htmlFor="tags">
                Tags
              </label>
              <input
                id="tags"
                className="d-control"
                type="text"
                placeholder="tag1, tag2, tag3"
                value={form.tags}
                onChange={(e) => update('tags', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold" htmlFor="json-data">
                JSON Data
              </label>
              <textarea
                id="json-data"
                className="d-control"
                value={jsonData}
                onChange={(e) => handleJsonChange(e.target.value)}
                spellCheck={false}
                style={{
                  minHeight: '8rem',
                  resize: 'vertical',
                  fontFamily: 'var(--d-font-mono, monospace)',
                  fontSize: '0.8125rem',
                }}
              />
              {parseError && (
                <p className="text-xs" style={{ color: 'var(--d-error)' }}>
                  {parseError}
                </p>
              )}
            </div>
          </section>

          {/* Actions */}
          <div
            className="flex items-center gap-3"
            style={{ marginTop: '1.5rem' }}
          >
            <button
              type="submit"
              className="d-interactive"
              data-variant="primary"
              disabled={isPending || !!parseError}
              style={{ fontSize: '0.875rem' }}
            >
              {isPending ? 'Publishing...' : 'Publish'}
            </button>
            <button
              type="button"
              className="d-interactive"
              data-variant="ghost"
              style={{ fontSize: '0.875rem' }}
              onClick={() => router.back()}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Right: JSON preview */}
        <div style={{ maxWidth: '40rem' }}>
          <span
            className="d-label block mb-3"
            style={{
              paddingLeft: '0.75rem',
              borderLeft: '2px solid var(--d-accent)',
            }}
          >
            Preview
          </span>
          <JsonViewer data={preview} title="Preview" />
        </div>
      </form>
    </div>
  );
}
