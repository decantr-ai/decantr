import { Link, useParams } from 'react-router-dom';
import { Video, MapPin, Calendar as CalIcon, Clock, ArrowLeft, FileText } from 'lucide-react';
import { appointments } from '@/data/mock';

export function AppointmentDetailPage() {
  const { id } = useParams();
  const apt = appointments.find(a => a.id === id) ?? appointments[0];
  const isUpcoming = apt.status === 'upcoming';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 960 }}>
      <Link
        to="/appointments"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
          fontSize: '0.875rem', color: 'var(--d-text-muted)',
          textDecoration: 'none', fontWeight: 500, width: 'fit-content',
        }}
      >
        <ArrowLeft size={16} /> Back to appointments
      </Link>

      {/* Detail header */}
      <div className="hw-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: 'var(--d-radius-lg)',
            background: apt.type === 'telehealth'
              ? 'color-mix(in srgb, var(--d-primary) 12%, transparent)'
              : 'color-mix(in srgb, var(--d-secondary) 12%, transparent)',
            color: apt.type === 'telehealth' ? 'var(--d-primary)' : 'var(--d-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }} aria-hidden>
            {apt.type === 'telehealth' ? <Video size={28} /> : <MapPin size={28} />}
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span className="d-annotation" data-status={isUpcoming ? 'info' : 'success'}>
                {isUpcoming ? 'Upcoming' : 'Completed'}
              </span>
              <span className="d-annotation">
                {apt.type === 'telehealth' ? 'Video visit' : 'In-person'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
              {apt.reason}
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--d-text-muted)' }}>
              with {apt.providerName} · {apt.specialty}
            </p>
          </div>
          {isUpcoming && apt.type === 'telehealth' && (
            <Link
              to="/telehealth"
              className="hw-button-primary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.9375rem', textDecoration: 'none' }}
            >
              <Video size={18} /> Join Video Visit
            </Link>
          )}
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--d-border)',
        }}>
          <div>
            <div className="d-label" style={{ marginBottom: '0.5rem' }}>
              <CalIcon size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />
              Date
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>{apt.date}</div>
          </div>
          <div>
            <div className="d-label" style={{ marginBottom: '0.5rem' }}>
              <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />
              Time
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>{apt.time} · {apt.duration}</div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <div className="d-label" style={{ marginBottom: '0.5rem' }}>Location</div>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>{apt.location}</div>
          </div>
        </div>
      </div>

      {/* Prep checklist */}
      {isUpcoming && (
        <div className="hw-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>How to prepare</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              'Review your current medications and dosages',
              'Note any symptoms or changes since last visit',
              apt.type === 'telehealth' ? 'Test your camera and microphone before joining' : 'Bring your insurance card and photo ID',
              'Prepare questions you would like to ask',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9375rem' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: 'color-mix(in srgb, var(--d-primary) 12%, transparent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
                  color: 'var(--d-primary)', fontSize: '0.75rem', fontWeight: 700,
                }} aria-hidden>{i + 1}</div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Visit notes (if completed) */}
      {!isUpcoming && (
        <div className="hw-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
            <FileText size={20} style={{ color: 'var(--d-primary)' }} aria-hidden />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Visit Summary</h2>
          </div>
          <p style={{ fontSize: '0.9375rem', color: 'var(--d-text-muted)', lineHeight: 1.7 }}>
            Patient presented with {apt.reason.toLowerCase()}. Discussed treatment options and follow-up care. All vitals reviewed. Patient tolerated exam well. Follow up as needed or in 3 months for routine check.
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {isUpcoming && (
          <>
            <button className="d-interactive" style={{ padding: '0.625rem 1rem', fontSize: '0.9375rem' }}>Reschedule</button>
            <button className="d-interactive" data-variant="danger" style={{ padding: '0.625rem 1rem', fontSize: '0.9375rem' }}>Cancel Appointment</button>
          </>
        )}
        <button className="d-interactive" style={{ padding: '0.625rem 1rem', fontSize: '0.9375rem' }}>Message Provider</button>
      </div>
    </div>
  );
}
