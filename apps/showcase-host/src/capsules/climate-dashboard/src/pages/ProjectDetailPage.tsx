import { useParams, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { ArrowLeft, Star, MapPin, Calendar, Shield, Leaf } from 'lucide-react';
import { offsetProjects } from '@/data/mock';

export function ProjectDetailPage() {
  const { id } = useParams();
  const project = offsetProjects.find(p => p.id === id);

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--d-text-muted)', marginBottom: '1rem' }}>Project not found</p>
        <Link to="/offsets" className="d-interactive" style={{ textDecoration: 'none' }}>Back to marketplace</Link>
      </div>
    );
  }

  return (
    <div className={css('_flex _col _gap6')}>
      <div>
        <Link to="/offsets" className={css('_flex _aic _gap1')} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textDecoration: 'none', marginBottom: '0.5rem' }}>
          <ArrowLeft size={14} /> Back to marketplace
        </Link>
        <div className={css('_flex _aic _gap3 _wrap')}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{project.name}</h1>
          <span className="earth-badge" style={{ fontSize: '0.75rem', background: 'color-mix(in srgb, var(--d-accent) 15%, transparent)', color: 'var(--d-accent)', padding: '0.125rem 0.625rem', borderRadius: 'var(--d-radius-full)' }}>
            {project.type}
          </span>
        </div>
      </div>

      {/* Hero image placeholder */}
      <div style={{ height: 200, background: 'linear-gradient(135deg, color-mix(in srgb, var(--d-primary) 20%, transparent), color-mix(in srgb, var(--d-accent) 20%, transparent))', borderRadius: 'var(--d-radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Leaf size={48} style={{ color: 'var(--d-primary)', opacity: 0.4 }} />
      </div>

      <div className={css('_grid _gc1 lg:_gc3 _gap6')}>
        {/* Main Content */}
        <div className={css('_flex _col _gap4')} style={{ gridColumn: 'span 2' }}>
          <div className="d-surface earth-card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>About this project</h2>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--d-text)' }}>{project.description}</p>
          </div>

          <div className="d-surface earth-card">
            <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>Co-Benefits</div>
            <div className={css('_flex _wrap _gap2')}>
              {project.co_benefits.map(b => (
                <span key={b} className="earth-badge" style={{ padding: '0.25rem 0.75rem', borderRadius: 'var(--d-radius-full)', background: 'color-mix(in srgb, var(--d-primary) 10%, transparent)', fontSize: '0.8125rem', fontWeight: 500 }}>
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={css('_flex _col _gap4')}>
          <div className="d-surface earth-card">
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>${project.price}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>per tCO2e</div>
            <button className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem', marginBottom: '0.75rem' }}>
              Purchase Credits
            </button>
            <div className={css('_flex _col _gap3')} style={{ fontSize: '0.8125rem' }}>
              <div className={css('_flex _aic _gap2')}>
                <MapPin size={14} style={{ color: 'var(--d-text-muted)' }} />
                <span>{project.location}</span>
              </div>
              <div className={css('_flex _aic _gap2')}>
                <Calendar size={14} style={{ color: 'var(--d-text-muted)' }} />
                <span>Vintage: {project.vintage}</span>
              </div>
              <div className={css('_flex _aic _gap2')}>
                <Shield size={14} style={{ color: 'var(--d-text-muted)' }} />
                <span>{project.standard}</span>
              </div>
              <div className={css('_flex _aic _gap2')}>
                <Star size={14} style={{ color: 'var(--d-warning)' }} fill="var(--d-warning)" />
                <span>{project.rating} / 5.0</span>
              </div>
            </div>
          </div>

          <div className="d-surface earth-card">
            <div className="d-label" style={{ marginBottom: '0.5rem' }}>Available Credits</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{project.available.toLocaleString()}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>tCO2e remaining</div>
          </div>
        </div>
      </div>
    </div>
  );
}
