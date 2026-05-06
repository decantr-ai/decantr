import { css } from '@decantr/css';
import { Mail, Clock, Users } from 'lucide-react';
import { newsletterArchive } from '../data/mock';

export function NewsletterArchivePage() {
  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Newsletter Archive</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
          Past issues of The Paragraph newsletter.
        </p>
      </div>

      <div className={css('_flex _col')}>
        {newsletterArchive.map((issue) => (
          <div
            key={issue.id}
            style={{
              padding: '1.25rem 0',
              borderBottom: '1px solid var(--d-border)',
            }}
          >
            <div className={css('_flex _aic _gap3')} style={{ marginBottom: '0.5rem' }}>
              <span className="editorial-caption" style={{ color: 'var(--d-accent)' }}>
                {issue.id.replace('issue-', 'Issue #')}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--d-border)' }}>|</span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>{issue.date}</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.3 }}>
              {issue.title}
            </h2>
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6, marginBottom: '0.75rem', fontFamily: 'system-ui, sans-serif' }}>
              {issue.description}
            </p>
            <div className={css('_flex _aic _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
              <span className={css('_flex _aic _gap1')} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
                <Clock size={12} />
                {issue.readingTime}
              </span>
              <span className={css('_flex _aic _gap1')} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
                <Users size={12} />
                {issue.subscriberCount.toLocaleString()} subscribers
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
