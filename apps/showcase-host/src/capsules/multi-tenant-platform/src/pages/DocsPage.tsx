import { BookOpen, Key, Users, Zap, CreditCard, Shield, Code, Terminal, ArrowRight } from 'lucide-react';
import { docCategories } from '@/data/mock';

const iconMap: Record<string, typeof BookOpen> = {
  'book-open': BookOpen, key: Key, users: Users, zap: Zap, 'credit-card': CreditCard,
  shield: Shield, code: Code, terminal: Terminal,
};

export function DocsPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 2rem' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Documentation</h1>
        <p style={{ color: 'var(--d-text-muted)' }}>Everything you need to build multi-tenant SaaS on Tenantly.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {docCategories.map(cat => {
          const Icon = iconMap[cat.icon] || BookOpen;
          return (
            <a key={cat.title} href="#" className="lp-card-elevated" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'color-mix(in srgb, var(--d-primary) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} style={{ color: 'var(--d-primary)' }} />
                </div>
                <ArrowRight size={16} style={{ color: 'var(--d-text-muted)' }} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.35rem' }}>{cat.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginBottom: '0.75rem' }}>{cat.description}</p>
              <div className="d-annotation">{cat.count} articles</div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
