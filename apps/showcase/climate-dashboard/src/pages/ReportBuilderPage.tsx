import { useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { ArrowLeft, CheckCircle, Circle, Save } from 'lucide-react';
import { csrdSections } from '@/data/mock';
import { useAnimatedValue } from '@/hooks/useAnimatedValue';

function SectionBar({ completeness }: { completeness: number }) {
  const animated = useAnimatedValue(completeness, 600);
  return (
    <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'var(--d-border)' }}>
      <div style={{ width: `${animated}%`, height: '100%', borderRadius: 4, background: completeness === 100 ? 'var(--d-success)' : completeness >= 70 ? 'var(--d-primary)' : 'var(--d-warning)', transition: 'width 0.3s ease' }} />
    </div>
  );
}

export function ReportBuilderPage() {
  const [activeSection, setActiveSection] = useState('e1');
  const [reportTitle, setReportTitle] = useState('CSRD Annual Disclosure 2025');
  const overallCompleteness = Math.round(csrdSections.reduce((sum, s) => sum + s.completeness, 0) / csrdSections.length);

  return (
    <div className={css('_flex _col _gap6')}>
      <div className={css('_flex _jcsb _aic _wrap _gap3')}>
        <div>
          <Link to="/reports" className={css('_flex _aic _gap1')} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textDecoration: 'none', marginBottom: '0.5rem' }}>
            <ArrowLeft size={14} /> Back to reports
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Report Builder</h1>
        </div>
        <button className="d-interactive" data-variant="primary">
          <Save size={16} /> Save Draft
        </button>
      </div>

      {/* Report header */}
      <div className="d-surface earth-card">
        <div className={css('_grid _gc1 lg:_gc3 _gap4')}>
          <div className={css('_flex _col _gap1')} style={{ gridColumn: 'span 2' }}>
            <label className="d-label">Report Title</label>
            <input className="d-control earth-input" value={reportTitle} onChange={e => setReportTitle(e.target.value)} />
          </div>
          <div>
            <label className="d-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Overall Progress</label>
            <div className={css('_flex _aic _gap3')}>
              <SectionBar completeness={overallCompleteness} />
              <span style={{ fontWeight: 700, fontSize: '1.125rem', flexShrink: 0 }}>{overallCompleteness}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className={css('_grid _gc1 lg:_gc4 _gap6')}>
        {/* Section nav */}
        <div className={css('_flex _col _gap1')}>
          <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>ESRS Sections</div>
          {csrdSections.map(s => (
            <button
              key={s.id}
              className="d-interactive"
              data-variant={activeSection === s.id ? 'primary' : 'ghost'}
              onClick={() => setActiveSection(s.id)}
              style={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%', padding: '0.5rem 0.75rem', border: 'none' }}
            >
              <div className={css('_flex _aic _gap2')} style={{ width: '100%' }}>
                {s.completeness === 100 ? (
                  <CheckCircle size={14} style={{ color: 'var(--d-success)', flexShrink: 0 }} />
                ) : (
                  <Circle size={14} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} />
                )}
                <span style={{ flex: 1, fontSize: '0.8125rem' }}>{s.code}: {s.title}</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', flexShrink: 0 }}>{s.completeness}%</span>
              </div>
            </button>
          ))}
        </div>

        {/* Section content */}
        <div className={css('_flex _col _gap4')} style={{ gridColumn: 'span 3' }}>
          {csrdSections.filter(s => s.id === activeSection).map(section => (
            <div key={section.id}>
              <div className="d-surface earth-card" style={{ marginBottom: '1.5rem' }}>
                <div className={css('_flex _jcsb _aic')} style={{ marginBottom: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{section.code}: {section.title}</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>{section.description}</p>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '1.25rem', color: section.completeness === 100 ? 'var(--d-success)' : 'var(--d-text)' }}>
                    {section.completeness}%
                  </span>
                </div>
                <SectionBar completeness={section.completeness} />
              </div>

              {/* Form sections */}
              <div className={css('_flex _col _gap4')}>
                <div className="d-surface earth-card">
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Governance & Strategy</h3>
                  <div className={css('_flex _col _gap4')}>
                    <div className={css('_flex _col _gap1')}>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Describe the governance body overseeing climate-related matters</label>
                      <textarea className="d-control earth-input" rows={4} placeholder="The board-level sustainability committee, chaired by..." style={{ resize: 'vertical' }} />
                    </div>
                    <div className={css('_flex _col _gap1')}>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Transition plan summary</label>
                      <textarea className="d-control earth-input" rows={4} placeholder="Our organization has committed to a net-zero pathway..." style={{ resize: 'vertical' }} />
                    </div>
                  </div>
                </div>

                <div className="d-surface earth-card">
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Metrics & Targets</h3>
                  <div className={css('_flex _col _gap4')}>
                    <div className={css('_flex _col _gap1')}>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>GHG emissions (Scope 1, 2, 3)</label>
                      <textarea className="d-control earth-input" rows={3} placeholder="Scope 1: 6,120 tCO2e | Scope 2: 8,430 tCO2e | Scope 3: 9,800 tCO2e" style={{ resize: 'vertical' }} />
                    </div>
                    <div className={css('_flex _col _gap1')}>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Reduction targets and progress</label>
                      <textarea className="d-control earth-input" rows={3} placeholder="Net zero by 2040, interim 50% reduction by 2030..." style={{ resize: 'vertical' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
