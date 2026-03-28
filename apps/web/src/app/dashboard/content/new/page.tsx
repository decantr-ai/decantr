'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/lib/api';

const CONTENT_TYPES = ['pattern', 'theme', 'recipe', 'shell', 'blueprint', 'archetype'];

export default function NewContentPage() {
  const router = useRouter();
  const [type, setType] = useState('pattern');
  const [slug, setSlug] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [data, setData] = useState('{\n  \n}');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      let parsedData: unknown;
      try {
        parsedData = JSON.parse(data);
      } catch {
        setError('Invalid JSON in data field');
        setSubmitting(false);
        return;
      }

      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        setError('Not authenticated. Please sign in again.');
        setSubmitting(false);
        return;
      }

      await api.publishContent(token, {
        type,
        slug,
        version,
        visibility,
        data: parsedData,
      });

      router.push('/dashboard/content');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to publish content');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Create Content</h1>
        <p className="text-[var(--fg-muted)] mt-1">Publish a new content item to the registry.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--fg)] mb-2">Type</label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className="cursor-pointer"
                >
                  <Badge variant={type === t ? 'official' : 'default'}>{t}</Badge>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-[var(--fg)] mb-2">
              Slug
            </label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-content-slug"
              required
            />
          </div>

          <div>
            <label htmlFor="version" className="block text-sm font-medium text-[var(--fg)] mb-2">
              Version
            </label>
            <Input
              id="version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0.0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--fg)] mb-2">Visibility</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className="cursor-pointer"
              >
                <Badge variant={visibility === 'public' ? 'success' : 'default'}>Public</Badge>
              </button>
              <button
                type="button"
                onClick={() => setVisibility('private')}
                className="cursor-pointer"
              >
                <Badge variant={visibility === 'private' ? 'warning' : 'default'}>Private</Badge>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="data" className="block text-sm font-medium text-[var(--fg)] mb-2">
              Data (JSON)
            </label>
            <textarea
              id="data"
              value={data}
              onChange={(e) => setData(e.target.value)}
              rows={12}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-md)] px-4 py-3 text-[var(--fg)] placeholder:text-[var(--fg-dim)] focus:outline-none focus:border-[var(--primary)] transition-colors font-mono text-sm resize-y"
              required
            />
          </div>

          {error && (
            <div className="text-[var(--error)] text-sm">{error}</div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Publishing...' : 'Publish'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/dashboard/content')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
