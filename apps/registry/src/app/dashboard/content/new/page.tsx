'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JsonViewer } from '@/components/json-viewer';
import { api, type MeResponse } from '@/lib/api';
import { CONTENT_TYPES } from '@/lib/content-types';

type RegistryThumbnailMeta = {
  path: string;
  alt?: string;
  width?: number;
  height?: number;
};

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function getImageDimensions(
  file: File,
): Promise<Pick<RegistryThumbnailMeta, 'width' | 'height'> | null> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const dimensions = await new Promise<Pick<RegistryThumbnailMeta, 'width' | 'height'> | null>((resolve) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.width, height: image.height });
      image.onerror = () => resolve(null);
      image.src = objectUrl;
    });

    return dimensions;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function mergeRegistryPresentation(
  value: unknown,
  thumbnail: RegistryThumbnailMeta | null,
  fallbackAlt: string,
) {
  const base =
    value && typeof value === 'object' && !Array.isArray(value)
      ? { ...(value as Record<string, unknown>) }
      : {};

  if (!thumbnail) {
    return base;
  }

  const currentPresentation =
    base.registry_presentation &&
    typeof base.registry_presentation === 'object' &&
    !Array.isArray(base.registry_presentation)
      ? { ...(base.registry_presentation as Record<string, unknown>) }
      : {};

  return {
    ...base,
    registry_presentation: {
      ...currentPresentation,
      thumbnail: {
        ...thumbnail,
        alt: thumbnail.alt || fallbackAlt,
      },
    },
  };
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
  const [thumbnailMeta, setThumbnailMeta] = useState<RegistryThumbnailMeta | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

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

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
    };
  }, [thumbnailPreviewUrl]);

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
    const presentationData = mergeRegistryPresentation(
      parsedData,
      thumbnailMeta,
      `${form.name || form.slug || 'Registry item'} thumbnail`,
    );
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
      data: presentationData,
    };
  }, [form, jsonData, me, thumbnailMeta]);

  async function handleThumbnailSelect(file: File | null) {
    if (!file) {
      if (thumbnailPreviewUrl) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
      setThumbnailPreviewUrl(null);
      setThumbnailMeta(null);
      setThumbnailError(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setThumbnailError('Thumbnail must be an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setThumbnailError('Thumbnail must be 5 MB or smaller.');
      return;
    }

    if (form.target === 'organization' && !form.org_slug) {
      setThumbnailError('Select an organization before uploading an organization thumbnail.');
      return;
    }

    setThumbnailError(null);
    setIsUploadingThumbnail(true);

    try {
      const dimensions = await getImageDimensions(file);
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token ?? '';

      if (!token) {
        throw new Error('You must be signed in to upload a thumbnail.');
      }

      const uploadTarget = await api.createThumbnailUploadTarget(token, {
        file_name: file.name,
        target: form.target === 'organization' ? 'organization' : form.target === 'personal' ? 'personal' : 'community',
        org_slug: form.target === 'organization' ? form.org_slug : undefined,
      });

      const { error } = await supabase.storage
        .from(uploadTarget.bucket)
        .uploadToSignedUrl(uploadTarget.path, uploadTarget.token, file, {
          upsert: true,
          cacheControl: '3600',
          contentType: file.type,
        });

      if (error) {
        throw error;
      }

      const nextPreviewUrl = URL.createObjectURL(file);
      if (thumbnailPreviewUrl) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }

      setThumbnailPreviewUrl(nextPreviewUrl);
      setThumbnailMeta({
        path: uploadTarget.path,
        alt: `${form.name || form.slug || 'Registry item'} thumbnail`,
        width: dimensions?.width,
        height: dimensions?.height,
      });
    } catch (error) {
      setThumbnailError(error instanceof Error ? error.message : 'Failed to upload thumbnail.');
    } finally {
      setIsUploadingThumbnail(false);
    }
  }

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

    const mergedData = mergeRegistryPresentation(
      parsed,
      thumbnailMeta,
      `${form.name || form.slug || 'Registry item'} thumbnail`,
    );
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
          data: mergedData,
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
              className="d-annotation registry-inline-error"
              data-status="error"
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
              <p className="registry-form-hint">
                {form.target === 'community'
                  ? 'Community packages are always public.'
                  : form.target === 'personal'
                  ? 'Personal private packages are unlocked on Pro and above.'
                  : 'Organization packages can be public or private to the org.'}
              </p>
            </div>
          </section>

          {/* Details */}
          <section className="registry-form-grid registry-section-spacer">
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
                placeholder="Describe your content item..."
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                className="d-control registry-description-textarea"
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
              <label className="text-sm font-semibold" htmlFor="thumbnail">
                Thumbnail
              </label>
              <input
                id="thumbnail"
                className="d-control"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                onChange={(e) => {
                  void handleThumbnailSelect(e.target.files?.[0] ?? null);
                }}
              />
              <p className="registry-helper-copy">
                Upload a 16:9 preview image. It will render on registry cards when available.
              </p>
              {isUploadingThumbnail ? (
                <p className="registry-helper-copy">Uploading thumbnail…</p>
              ) : null}
              {thumbnailError ? (
                <p className="registry-error-copy">{thumbnailError}</p>
              ) : null}
              {thumbnailPreviewUrl ? (
                <div className="registry-thumbnail-preview">
                  <img
                    src={thumbnailPreviewUrl}
                    alt="Thumbnail preview"
                    className="registry-thumbnail-preview-image"
                  />
                </div>
              ) : null}
            </div>

            <div className="registry-form-grid">
              <label className="text-sm font-semibold" htmlFor="json-data">
                JSON Data
              </label>
              <textarea
                id="json-data"
                className="d-control registry-json-textarea"
                value={jsonData}
                onChange={(e) => handleJsonChange(e.target.value)}
                spellCheck={false}
              />
              {parseError && (
                <p className="registry-error-copy">
                  {parseError}
                </p>
              )}
            </div>
          </section>

          {/* Actions */}
          <div className="registry-inline-actions registry-form-actions">
            <button
              type="submit"
              className="d-interactive"
              data-variant="primary"
              disabled={isPending || !!parseError}
            >
              {isPending ? 'Publishing...' : 'Publish'}
            </button>
            <button
              type="button"
              className="d-interactive"
              data-variant="ghost"
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
