import { Link } from 'react-router-dom';
import { Plus, Video, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { appointments } from '@/data/mock';

export function AppointmentsPage() {
  const upcoming = appointments.filter(a => a.status === 'upcoming');
  const past = appointments.filter(a => a.status === 'completed');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1400 }}>
      <PageHeader
        title="Appointments"
        description="Your upcoming and past visits with the Evergreen care team."
        actions={
          <Link to="/appointments/book" className="hw-button-primary" style={{ padding: '0.625rem 1.125rem', fontSize: '0.9375rem' }}>
            <Plus size={18} /> Book Appointment
          </Link>
        }
      />

      <div>
        <SectionLabel style={{ marginBottom: '0.875rem' }}>Upcoming ({upcoming.length})</SectionLabel>
        <div className="hw-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="d-data">
            <thead>
              <tr>
                <th className="d-data-header">Date &amp; Time</th>
                <th className="d-data-header">Provider</th>
                <th className="d-data-header">Type</th>
                <th className="d-data-header">Reason</th>
                <th className="d-data-header">Duration</th>
                <th className="d-data-header"></th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map(apt => (
                <tr key={apt.id} className="d-data-row">
                  <td className="d-data-cell">
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{apt.date}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{apt.time}</div>
                  </td>
                  <td className="d-data-cell">
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{apt.providerName}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{apt.specialty}</div>
                  </td>
                  <td className="d-data-cell">
                    <span className="d-annotation" data-status={apt.type === 'telehealth' ? 'info' : 'success'}>
                      {apt.type === 'telehealth' ? <><Video size={12} /> Video</> : <><MapPin size={12} /> In-person</>}
                    </span>
                  </td>
                  <td className="d-data-cell" style={{ fontSize: '0.875rem' }}>{apt.reason}</td>
                  <td className="d-data-cell" style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>{apt.duration}</td>
                  <td className="d-data-cell" style={{ textAlign: 'right' }}>
                    <Link
                      to={`/appointments/${apt.id}`}
                      className="d-interactive"
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none' }}
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <SectionLabel style={{ marginBottom: '0.875rem' }}>Past visits ({past.length})</SectionLabel>
        <div className="hw-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="d-data">
            <thead>
              <tr>
                <th className="d-data-header">Date</th>
                <th className="d-data-header">Provider</th>
                <th className="d-data-header">Type</th>
                <th className="d-data-header">Reason</th>
                <th className="d-data-header"></th>
              </tr>
            </thead>
            <tbody>
              {past.map(apt => (
                <tr key={apt.id} className="d-data-row">
                  <td className="d-data-cell" style={{ fontSize: '0.875rem' }}>{apt.date}</td>
                  <td className="d-data-cell" style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{apt.providerName}</td>
                  <td className="d-data-cell">
                    <span className="d-annotation">{apt.type === 'telehealth' ? 'Video' : 'In-person'}</span>
                  </td>
                  <td className="d-data-cell" style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>{apt.reason}</td>
                  <td className="d-data-cell" style={{ textAlign: 'right' }}>
                    <Link
                      to={`/appointments/${apt.id}`}
                      style={{ fontSize: '0.8125rem', color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 600 }}
                    >
                      View notes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
