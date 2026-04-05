import { Link, useParams } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Sparkles, ExternalLink, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { ActivityFeed } from '@/components/ActivityFeed';
import { AIBadge } from '@/components/AIBadge';
import { RelationshipGraph } from '@/components/RelationshipGraph';
import { contacts, activityEvents, deals } from '@/data/mock';

export function ContactDetailPage() {
  const { id } = useParams();
  const contact = contacts.find(c => c.id === id) ?? contacts[0];
  const contactDeals = deals.filter(d => d.contactId === contact.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Link to="/contacts" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
        <ArrowLeft size={14} /> Back to contacts
      </Link>

      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
        <div className="crm-avatar" style={{ width: 72, height: 72, fontSize: '1.25rem' }}>{contact.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{contact.name}</h1>
            <AIBadge>AI Enriched · {contact.ai.lastEnriched}</AIBadge>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>
            {contact.title} · {contact.company}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.875rem', fontSize: '0.78rem', color: 'var(--d-text-muted)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Mail size={12} /> {contact.email}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Phone size={12} /> {contact.phone}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><MapPin size={12} /> {contact.location}</span>
            <a href={`https://${contact.linkedin}`} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--d-accent)', textDecoration: 'none' }}>
              <Linkedin size={12} /> LinkedIn <ExternalLink size={10} />
            </a>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--d-text-muted)' }}>Lead Score</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--d-font-mono)', color: 'var(--d-accent)' }}>{contact.score}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--d-content-gap)' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* AI Enrichment */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <Sparkles size={14} style={{ color: 'var(--d-accent)' }} />
              <SectionLabel>AI Enrichment</SectionLabel>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.875rem', fontSize: '0.82rem' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Industry</div>
                <div style={{ marginTop: '0.25rem' }}>{contact.ai.industry}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Company Size</div>
                <div style={{ marginTop: '0.25rem' }}>{contact.ai.companySize}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Intent Signal</div>
                <div style={{ marginTop: '0.25rem', textTransform: 'capitalize', color: contact.ai.intentSignal === 'hot' ? 'var(--d-error)' : contact.ai.intentSignal === 'warm' ? 'var(--d-warning)' : 'var(--d-text-muted)', fontWeight: 600 }}>{contact.ai.intentSignal}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Recent News</div>
                <div style={{ marginTop: '0.25rem' }}>{contact.ai.recentNews}</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Tech Stack</div>
                <div style={{ marginTop: '0.375rem', display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {contact.ai.techStack.map(t => (
                    <span key={t} style={{
                      fontSize: '0.7rem', padding: '0.125rem 0.5rem',
                      background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.2)',
                      color: 'var(--d-primary)', borderRadius: 'var(--d-radius-full)',
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Deals */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <SectionLabel style={{ marginBottom: '0.875rem' }}>Deals ({contactDeals.length})</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {contactDeals.map(d => (
                <Link key={d.id} to={`/deals/${d.id}`} style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 'var(--d-radius-sm)',
                  textDecoration: 'none', color: 'var(--d-text)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 500 }}>{d.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', textTransform: 'capitalize' }}>{d.stage} · {d.probability}%</div>
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--d-font-mono)', color: 'var(--d-accent)' }}>
                    ${(d.value / 1000).toFixed(0)}k
                  </span>
                </Link>
              ))}
              {contactDeals.length === 0 && <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>No deals yet.</div>}
            </div>
          </div>

          {/* Relationship graph */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <SectionLabel style={{ marginBottom: '0.875rem' }}>Relationship Graph</SectionLabel>
            <RelationshipGraph height={380} />
          </div>
        </div>

        {/* Right column */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <SectionLabel style={{ marginBottom: '0.875rem' }}>Activity</SectionLabel>
          <ActivityFeed events={activityEvents.slice(0, 6)} />
        </div>
      </div>
    </div>
  );
}
