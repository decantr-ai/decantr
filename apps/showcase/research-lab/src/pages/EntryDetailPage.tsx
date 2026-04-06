import { css } from '@decantr/css';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User, AlertTriangle } from 'lucide-react';
import { notebookEntries } from '../data/mock';

export function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const entry = notebookEntries.find((e) => e.id === id) || notebookEntries[0];

  return (
    <div style={{ maxWidth: '52rem', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <Link to="/notebook" className={css('_flex _aic _gap1')} style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
        <ArrowLeft size={14} /> Back to Notebook
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontWeight: 500, fontSize: '1.375rem', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>{entry.title}</h1>
        <div className={css('_flex _aic _gap4')} style={{ flexWrap: 'wrap' }}>
          <span className={css('_flex _aic _gap1')} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
            <User size={13} /> {entry.author}
          </span>
          <span className={css('_flex _aic _gap1')} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
            <Clock size={13} /> {entry.date}
          </span>
          <div className={css('_flex _aic _gap2')}>
            {entry.tags.map((tag) => (
              <span key={tag} className="lab-chip" data-color="cyan">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="lab-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--d-text)' }}>
          {entry.excerpt}
        </p>

        {entry.latex && (
          <div className="lab-latex">
            {entry.latex}
          </div>
        )}

        <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--d-text-muted)', marginTop: '0.75rem' }}>
          Observations recorded under standard laboratory conditions. All measurements taken at ambient temperature (22 +/- 1 C) unless otherwise noted. Reagent lot numbers verified against inventory system.
        </p>
      </div>

      {/* Protocol Steps */}
      {entry.protocols.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 500, fontSize: '1rem', marginBottom: '1rem' }}>Protocol Steps</h2>
          <div>
            {entry.protocols.map((step) => (
              <div key={step.step} className="lab-protocol" data-step={step.step}>
                <h3 style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                  {step.description}
                </p>
                <div className={css('_flex _aic _gap2')} style={{ flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                  {step.reagents.map((r) => (
                    <span key={r} className="lab-chip">{r}</span>
                  ))}
                </div>
                <div className={css('_flex _aic _gap3')}>
                  <span className="lab-reading" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                    Duration: {step.duration}
                  </span>
                  {step.safety && (
                    <span className={css('_flex _aic _gap1')} style={{ fontSize: '0.75rem', color: 'var(--d-warning)' }}>
                      <AlertTriangle size={12} /> {step.safety}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="lab-grid" style={{ padding: '1rem', fontSize: '0.8125rem' }}>
        <div className={css('_flex _jcsb _aic')} style={{ padding: '0.25rem 0', borderBottom: '1px solid var(--d-border)' }}>
          <span className="d-label">Entry ID</span>
          <span className="lab-barcode">{entry.id.toUpperCase()}</span>
        </div>
        <div className={css('_flex _jcsb _aic')} style={{ padding: '0.25rem 0', borderBottom: '1px solid var(--d-border)' }}>
          <span className="d-label">Author</span>
          <span>{entry.author}</span>
        </div>
        <div className={css('_flex _jcsb _aic')} style={{ padding: '0.25rem 0' }}>
          <span className="d-label">Created</span>
          <span className="lab-reading">{entry.date}</span>
        </div>
      </div>
    </div>
  );
}
