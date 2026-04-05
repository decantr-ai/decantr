import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { contacts } from '@/data/mock';

export function ContactsPage() {
  const [query, setQuery] = useState('');
  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.company.toLowerCase().includes(query.toLowerCase()) ||
    c.email.toLowerCase().includes(query.toLowerCase()),
  );

  const intentColor = (s: string) => s === 'hot' ? 'var(--d-error)' : s === 'warm' ? 'var(--d-warning)' : 'var(--d-text-muted)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title="Contacts"
        description={`${contacts.length} contacts · AI-enriched with intent signals, tech stack, and recent news`}
        actions={
          <button className="crm-button-accent" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>
            <Plus size={14} /> Add contact
          </button>
        }
      />

      <div style={{ position: 'relative', maxWidth: 400 }}>
        <Search size={14} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
        <input
          className="glass-control"
          placeholder="Search contacts, companies, emails…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
        />
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Contact</th>
              <th className="d-data-header">Company</th>
              <th className="d-data-header">Title</th>
              <th className="d-data-header">Intent</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Score</th>
              <th className="d-data-header">Last Contact</th>
              <th className="d-data-header">Owner</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="d-data-row">
                <td className="d-data-cell">
                  <Link to={`/contacts/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--d-text)', textDecoration: 'none' }}>
                    <div className="crm-avatar" style={{ width: 28, height: 28, fontSize: '0.65rem' }}>{c.avatar}</div>
                    <div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{c.email}</div>
                    </div>
                  </Link>
                </td>
                <td className="d-data-cell">
                  <div style={{ fontSize: '0.8rem' }}>{c.company}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--d-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Sparkles size={9} style={{ color: 'var(--d-accent)' }} /> {c.ai.industry} · {c.ai.companySize}
                  </div>
                </td>
                <td className="d-data-cell" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{c.title}</td>
                <td className="d-data-cell">
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                    fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
                    color: intentColor(c.ai.intentSignal),
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: intentColor(c.ai.intentSignal), boxShadow: `0 0 8px ${intentColor(c.ai.intentSignal)}` }} />
                    {c.ai.intentSignal}
                  </span>
                </td>
                <td className="d-data-cell" style={{ textAlign: 'right', fontFamily: 'var(--d-font-mono)', fontWeight: 600, color: 'var(--d-accent)' }}>{c.score}</td>
                <td className="d-data-cell" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{c.lastContact}</td>
                <td className="d-data-cell" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{c.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
