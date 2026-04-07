'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/lib/api';
import { JsonViewer } from '@/components/json-viewer';

const CONTENT_TYPES = ['pattern', 'theme', 'blueprint', 'shell', 'archetype'] as const;

export default function PublishContentPage() {
  const router = useRouter();
  const [type, setType] = useState('pattern');
  const [namespace, setNamespace] = useState('@community');
  const [slug, setSlug] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [jsonInput, setJsonInput] = useState('{\n  \n}');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  let parsedJson: unknown = null;
  try {
    parsedJson = JSON.parse(jsonInput);
  } catch {
    // invalid json
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!parsedJson) {
      setError('Invalid JSON');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      await api.publishContent(session.access_token, {
        type,
        namespace,
        slug,
        version,
        data: parsedJson,
      });

      router.push('/dashboard/content');
    } catch (err: any) {
      setError(err.message || 'Failed to publish');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold">Publish Content</h3>

      <div className="flex gap-6" style={{ flexWrap: 'wrap' }}>
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ flex: 1, minWidth: 300, maxWidth: 480 }}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Type</label>
            <select className="d-control" value={type} onChange={(e) => setType(e.target.value)}>
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Namespace</label>
            <input
              className="d-control"
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
              placeholder="@community"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Slug</label>
            <input
              className="d-control"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-pattern"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Version</label>
            <input
              className="d-control"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0.0"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Content JSON</label>
            <textarea
              className="d-control"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              style={{ minHeight: '12rem', fontFamily: 'var(--d-font-mono, monospace)', fontSize: '0.8125rem' }}
            />
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--d-error)' }}>{error}</p>}

          <button
            className="d-interactive"
            data-variant="primary"
            type="submit"
            disabled={loading || !parsedJson}
          >
            {loading ? 'Publishing...' : 'Publish'}
          </button>
        </form>

        {/* Live preview */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <span className="d-label block mb-2">Live Preview</span>
          {parsedJson ? (
            <JsonViewer data={parsedJson} title="Preview" />
          ) : (
            <div className="d-surface" style={{ padding: '2rem', textAlign: 'center' }}>
              <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                Enter valid JSON to see a preview
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
