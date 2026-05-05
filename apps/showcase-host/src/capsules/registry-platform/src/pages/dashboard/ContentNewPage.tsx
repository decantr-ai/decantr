import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { JsonViewer } from '../../components/JsonViewer';

type ContentType = 'pattern' | 'theme' | 'blueprint' | 'shell';

export default function ContentNewPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState<ContentType>('pattern');
  const [namespace, setNamespace] = useState('@official');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('1.0.0');

  const previewData = useMemo(
    () => ({
      name: name || 'untitled',
      type,
      namespace,
      version,
      description: description || '',
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
    }),
    [name, type, namespace, version, description],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="d-label" data-anchor="">
        Publish Content
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="d-label" htmlFor="content-name">
              Name
            </label>
            <input
              id="content-name"
              type="text"
              className="d-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hero Section"
            />
          </div>

          <div>
            <label className="d-label" htmlFor="content-type">
              Type
            </label>
            <select
              id="content-type"
              className="d-control"
              value={type}
              onChange={(e) => setType(e.target.value as ContentType)}
            >
              <option value="pattern">Pattern</option>
              <option value="theme">Theme</option>
              <option value="blueprint">Blueprint</option>
              <option value="shell">Shell</option>
            </select>
          </div>

          <div>
            <label className="d-label" htmlFor="content-namespace">
              Namespace
            </label>
            <input
              id="content-namespace"
              type="text"
              className="d-control"
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
            />
          </div>

          <div>
            <label className="d-label" htmlFor="content-description">
              Description
            </label>
            <textarea
              id="content-description"
              className="d-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe what this content does..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div>
            <label className="d-label" htmlFor="content-version">
              Version
            </label>
            <input
              id="content-version"
              type="text"
              className="d-control"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              style={{ maxWidth: '160px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button
              type="button"
              className="d-interactive"
              data-variant="primary"
              style={{ padding: '0.5rem 1.25rem' }}
            >
              Publish
            </button>
            <button
              type="button"
              className="d-interactive"
              data-variant="ghost"
              onClick={() => navigate(-1)}
              style={{ padding: '0.5rem 1.25rem' }}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* JSON preview */}
        <div>
          <JsonViewer data={previewData} title="Preview" />
        </div>
      </div>
    </div>
  );
}
