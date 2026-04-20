'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JsonViewer } from '@/components/json-viewer';
import { api, type MeResponse } from '@/lib/api';
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
  const [me, setMe] = useState<MeResponse | null>(null);

  const [form, setForm] = useState({
    type: 'patterns',
    name: '',
    slug: '',
    target: 'community',
    org_slug: '',
    visibility: 'public',
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

  useEffect(() => {
    async function loadMe() {
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
        if (!token) return;

        const result = await api.getMe(token);
        const organizations = Array.isArray(result.organizations) ? result.organizations : [];
        setMe(result);
        setForm((prev) => ({
          ...prev,
          org_slug: prev.org_slug || organizations[0]?.slug || '',
        }));
      } catch {
        // ignore
      }
    }

    loadMe();
  }, []);

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
    const personalNamespace = me?.username ? `@${me.username}` : '@personal';
    const namespace =
      form.target === 'organization' && form.org_slug
        ? `@org:${form.org_slug}`
        : form.target === 'personal'
        ? personalNamespace
        : '@community';
    return {
      type: form.type,
      name: form.name || undefined,
      slug: form.slug || undefined,
      namespace,
      visibility: form.target === 'community' ? 'public' : form.visibility,
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
  }, [form, jsonData, me]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.slug.trim()) {
      setError('Slug is required.');
      return;
    }

    if (form.target === 'organization' && !form.org_slug.trim()) {
      setError('Select an organization before publishing an organization package.');
      return;
    }

    if (form.target === 'personal' && !me?.username) {
      setError('Set a username before publishing personal packages.');
      return;
    }

    if (
      form.target === 'personal' &&
      form.visibility === 'private' &&
      !me?.entitlements.personal_private_packages
    ) {
      setError('Private personal packages require the Pro plan or higher.');
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

        const payload = {
          type: form.type,
          slug: form.slug,
          version: form.version,
          visibility: form.target === 'community' ? 'public' : form.visibility,
          data: parsed,
        };

        if (form.target === 'organization') {
          await api.publishOrgContent(token, form.org_slug, payload);
        } else {
          await api.publishContent(token, {
            ...payload,
            namespace:
              form.target === 'personal' && me?.username
                ? `@${me.username}`
                : '@community',
          });
        }

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
    <div className="registry-page-stack">
      <h3 className="text-lg font-semibold">Publish Content</h3>

      <form
        onSubmit={handleSubmit}
        className="registry-form-grid-split"
      >
        {/* Left: form card */}
        <div className="d-surface registry-surface-stack">
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
          <section className="registry-form-grid">
            <span className="d-label registry-anchor-label">
              Basic Info
            </span>

            <div className="registry-form-grid">
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

            <div className="registry-form-grid">
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

            <div className="registry-form-grid">
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

            <div className="registry-form-grid">
              <label className="text-sm font-semibold" htmlFor="target">
                Package Target
              </label>
              <select
                id="target"
                className="d-control"
                value={form.target}
                onChange={(e) => update('target', e.target.value)}
              >
                <option value="community">Community package (@community)</option>
                <option value="personal">
                  Personal package{me?.username ? ` (@${me.username})` : ''}
                </option>
                {me?.organizations.length ? (
                  <option value="organization">Organization package</option>
                ) : null}
              </select>
            </div>

            {form.target === 'organization' && me?.organizations.length ? (
              <div className="registry-form-grid">
                <label className="text-sm font-semibold" htmlFor="org_slug">
                  Organization
                </label>
                <select
                  id="org_slug"
                  className="d-control"
                  value={form.org_slug}
                  onChange={(e) => update('org_slug', e.target.value)}
                >
                  {me.organizations.map((org) => (
                    <option key={org.id} value={org.slug}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="registry-form-grid">
              <label className="text-sm font-semibold" htmlFor="visibility">
                Visibility
              </label>
              <select
                id="visibility"
                className="d-control"
                value={form.target === 'community' ? 'public' : form.visibility}
                onChange={(e) => update('visibility', e.target.value)}
                disabled={form.target === 'community'}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                {form.target === 'community'
                  ? 'Community packages are always public.'
                  : form.target === 'personal'
                  ? 'Personal private packages are unlocked on Pro and above.'
                  : 'Organization packages can be public or private to the org.'}
              </p>
            </div>
          </section>

          {/* Details */}
          <section
            className="registry-form-grid"
            style={{ marginTop: '1.5rem' }}
          >
            <span className="d-label registry-anchor-label">
              Details
            </span>

            <div className="registry-form-grid">
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

            <div className="registry-form-grid">
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

            <div className="registry-form-grid">
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

            <div className="registry-form-grid">
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
            className="registry-inline-actions"
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
        <div className="registry-surface-stack">
          <span className="d-label registry-anchor-label">
            Preview
          </span>
          <JsonViewer data={preview} title="Preview" />
        </div>
      </form>
    </div>
  );
}
