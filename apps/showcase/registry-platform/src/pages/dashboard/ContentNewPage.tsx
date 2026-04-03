import { useState, useMemo } from 'react';
import { css } from '@decantr/css';
import { useNavigate } from 'react-router-dom';
import { JsonViewer } from '@/components/JsonViewer';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function ContentNewPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: 'pattern' as string,
    name: '',
    slug: '',
    namespace: '@official',
    description: '',
    version: '1.0.0',
    tags: '',
  });
  const [slugEdited, setSlugEdited] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && !slugEdited) {
        next.slug = toSlug(value);
      }
      return next;
    });
  }

  const preview = useMemo(
    () => ({
      type: form.type,
      name: form.name || undefined,
      slug: form.slug || undefined,
      namespace: form.namespace,
      description: form.description || undefined,
      version: form.version || undefined,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
    }),
    [form],
  );

  return (
    <div className={css('_flex _col _gap6')}>
      <h3 className={css('_textlg _fontsemi')}>Publish New Content</h3>

      {/* Form card */}
      <div className="d-surface" style={{ maxWidth: '40rem' }}>
        {/* Basic Info */}
        <section className={css('_flex _col _gap4')}>
          <span
            className={css('_db _mb2') + ' d-label'}
            style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
          >
            Basic Info
          </span>

          <div className={css('_flex _col _gap1')}>
            <label className={css('_textsm _fontsemi')} htmlFor="type">Type</label>
            <select
              id="type"
              className="d-control"
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
            >
              <option value="pattern">Pattern</option>
              <option value="theme">Theme</option>
              <option value="blueprint">Blueprint</option>
              <option value="shell">Shell</option>
            </select>
          </div>

          <div className={css('_flex _col _gap1')}>
            <label className={css('_textsm _fontsemi')} htmlFor="name">Name</label>
            <input
              id="name"
              className="d-control"
              type="text"
              placeholder="My Pattern"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
          </div>

          <div className={css('_flex _col _gap1')}>
            <label className={css('_textsm _fontsemi')} htmlFor="slug">Slug</label>
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

          <div className={css('_flex _col _gap1')}>
            <label className={css('_textsm _fontsemi')} htmlFor="namespace">Namespace</label>
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
        <section className={css('_flex _col _gap4')} style={{ marginTop: '1.5rem' }}>
          <span
            className={css('_db _mb2') + ' d-label'}
            style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
          >
            Details
          </span>

          <div className={css('_flex _col _gap1')}>
            <label className={css('_textsm _fontsemi')} htmlFor="description">Description</label>
            <textarea
              id="description"
              className="d-control"
              placeholder="Describe your content item..."
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              style={{ minHeight: '6rem', resize: 'vertical' }}
            />
          </div>

          <div className={css('_flex _col _gap1')}>
            <label className={css('_textsm _fontsemi')} htmlFor="version">Version</label>
            <input
              id="version"
              className="d-control"
              type="text"
              placeholder="1.0.0"
              value={form.version}
              onChange={(e) => update('version', e.target.value)}
            />
          </div>

          <div className={css('_flex _col _gap1')}>
            <label className={css('_textsm _fontsemi')} htmlFor="tags">Tags</label>
            <input
              id="tags"
              className="d-control"
              type="text"
              placeholder="tag1, tag2, tag3"
              value={form.tags}
              onChange={(e) => update('tags', e.target.value)}
            />
          </div>
        </section>

        {/* Actions */}
        <div className={css('_flex _aic _gap3')} style={{ marginTop: '1.5rem' }}>
          <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.875rem' }}>
            Publish
          </button>
          <button
            className="d-interactive"
            data-variant="ghost"
            style={{ fontSize: '0.875rem' }}
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Live JSON preview */}
      <div style={{ maxWidth: '40rem' }}>
        <span
          className={css('_db _mb3') + ' d-label'}
          style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
        >
          Preview
        </span>
        <JsonViewer data={preview} />
      </div>
    </div>
  );
}
