import { css } from '@decantr/css';
import { Send, Clock, ExternalLink } from 'lucide-react';
import { articles } from '../data/mock';

export function PublishedPage() {
  return (
    <div className="entrance-fade" style={{ maxWidth: '56rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem', fontFamily: "'Georgia', serif" }}>Published</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
          {articles.length} published articles
        </p>
      </div>

      <table className="d-data">
        <thead>
          <tr>
            <th className="d-data-header">Article</th>
            <th className="d-data-header">Category</th>
            <th className="d-data-header">Date</th>
            <th className="d-data-header" style={{ width: 60 }}></th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id} className="d-data-row">
              <td className="d-data-cell">
                <div className={css('_flex _aic _gap3')}>
                  <Send size={16} style={{ color: 'var(--d-accent)', flexShrink: 0 }} />
                  <div>
                    <p className={css('_fontsemi _textsm')} style={{ fontFamily: 'system-ui, sans-serif' }}>{article.title}</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>{article.excerpt.slice(0, 80)}...</p>
                  </div>
                </div>
              </td>
              <td className="d-data-cell">
                <span className="d-annotation">{article.category}</span>
              </td>
              <td className="d-data-cell">
                <span className={css('_flex _aic _gap1 _textsm')} style={{ color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
                  <Clock size={12} />
                  {article.date}
                </span>
              </td>
              <td className="d-data-cell">
                <a
                  href={`#/articles/${article.id}`}
                  className="d-interactive"
                  data-variant="ghost"
                  style={{ padding: '0.25rem', border: 'none' }}
                  aria-label="View article"
                >
                  <ExternalLink size={14} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
