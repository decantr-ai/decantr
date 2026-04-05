import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Video, Pill, Activity } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { Calendar as CalendarView } from '@/components/Calendar';
import { vitals, appointments, medications, upcomingDays } from '@/data/mock';
import { useAuth } from '@/hooks/useAuth';

export function DashboardPage() {
  const { user } = useAuth();
  const upcoming = appointments.filter(a => a.status === 'upcoming').slice(0, 3);
  const eventDays = upcomingDays.map(d => d.day);
  const keyVitals = vitals.slice(0, 4);
  const needsRefill = medications.filter(m => m.refillsRemaining <= 2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1400 }}>
      <PageHeader
        title={`Good morning, ${user?.name.split(' ')[0] ?? 'there'}`}
        description="Here is a gentle overview of your health today."
        actions={
          <Link to="/appointments/book" className="hw-button-primary" style={{ padding: '0.625rem 1.125rem', fontSize: '0.9375rem' }}>
            <Calendar size={18} /> Book Appointment
          </Link>
        }
      />

      {/* KPI grid */}
      <div>
        <SectionLabel style={{ marginBottom: '0.75rem' }}>At a glance</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="hw-kpi">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Calendar size={18} style={{ color: 'var(--d-primary)' }} aria-hidden />
              <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', fontWeight: 500 }}>Next visit</div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Apr 8</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>Dr. Patel · 10:30 AM</div>
          </div>
          <div className="hw-kpi" data-tone="teal">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Activity size={18} style={{ color: 'var(--d-secondary)' }} aria-hidden />
              <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', fontWeight: 500 }}>Vitals tracked</div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{vitals.length} of 6</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--d-success)', marginTop: '0.25rem', fontWeight: 600 }}>5 in normal range</div>
          </div>
          <div className="hw-kpi" data-tone="warning">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Pill size={18} style={{ color: 'var(--d-warning)' }} aria-hidden />
              <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', fontWeight: 500 }}>Refills due</div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{needsRefill.length}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>Within 2 weeks</div>
          </div>
          <div className="hw-kpi" data-tone="success">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Activity size={18} style={{ color: 'var(--d-success)' }} aria-hidden />
              <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', fontWeight: 500 }}>Medication adherence</div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.01em' }}>89%</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--d-success)', marginTop: '0.25rem', fontWeight: 600 }}>Great work this month</div>
          </div>
        </div>
      </div>

      {/* Upcoming + calendar-view */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.25rem' }}>
        <div className="hw-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Upcoming Appointments</h2>
            <Link to="/appointments" style={{ fontSize: '0.875rem', color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 600 }}>
              View all <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcoming.map(apt => (
              <Link
                key={apt.id}
                to={`/appointments/${apt.id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem',
                  border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)',
                  textDecoration: 'none', color: 'inherit', transition: 'background 120ms ease, border-color 120ms ease',
                }}
              >
                <div style={{
                  width: 44, height: 44,
                  borderRadius: 'var(--d-radius)',
                  background: apt.type === 'telehealth'
                    ? 'color-mix(in srgb, var(--d-primary) 12%, transparent)'
                    : 'color-mix(in srgb, var(--d-secondary) 12%, transparent)',
                  color: apt.type === 'telehealth' ? 'var(--d-primary)' : 'var(--d-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }} aria-hidden>
                  {apt.type === 'telehealth' ? <Video size={20} /> : <Calendar size={20} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.125rem' }}>{apt.providerName}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
                    {apt.specialty} · {apt.reason}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{apt.date.split('-').slice(1).join('/')}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{apt.time}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="hw-card" style={{ padding: '1.25rem' }}>
          <CalendarView eventDays={eventDays} monthLabel="April 2026" />
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--d-border)' }}>
            <div className="d-label" style={{ marginBottom: '0.5rem' }}>This month</div>
            {upcomingDays.map(d => (
              <div key={d.day} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.375rem 0', fontSize: '0.8125rem' }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--d-secondary)', flexShrink: 0,
                }} aria-hidden />
                <span style={{ fontWeight: 600, width: 48 }}>{d.month} {d.day}</span>
                <span style={{ color: 'var(--d-text-muted)' }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vitals snapshot */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.875rem' }}>
          <SectionLabel>Recent vitals</SectionLabel>
          <Link to="/vitals" style={{ fontSize: '0.875rem', color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 600 }}>
            See all vitals <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {keyVitals.map(v => (
            <div key={v.id} className="hw-card" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>{v.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.625rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>{v.value}</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{v.unit}</span>
              </div>
              <span className="hw-vital-status" data-status={v.status} style={{ fontSize: '0.75rem' }}>
                {v.statusLabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
