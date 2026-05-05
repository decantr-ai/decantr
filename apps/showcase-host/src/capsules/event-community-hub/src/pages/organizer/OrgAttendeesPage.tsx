import { css } from '@decantr/css';
import { Download, Mail } from 'lucide-react';
import { attendees } from '../../data/mock';

const ticketTypes = ['GA', 'VIP', 'Early Bird'];
const statuses = ['Confirmed', 'Checked In', 'Confirmed', 'Pending', 'Confirmed', 'Checked In', 'Confirmed', 'Confirmed'];

export function OrgAttendeesPage() {
  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header className={css('_flex _aic _jcsb')}>
        <div>
          <span className="display-label">Attendees</span>
          <h1 className="display-heading" style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>
            Neon Bloom · {attendees.length} guests
          </h1>
        </div>
        <div className={css('_flex _gap2')}>
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.5rem 0.875rem' }}>
            <Mail size={14} /> Email all
          </button>
          <button className="d-interactive cta-glossy" style={{ padding: '0.5rem 0.875rem' }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </header>

      <div className="feature-tile" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Attendee</th>
              <th className="d-data-header">Location</th>
              <th className="d-data-header">Tier</th>
              <th className="d-data-header">Status</th>
              <th className="d-data-header">Purchased</th>
            </tr>
          </thead>
          <tbody>
            {attendees.map((a, i) => (
              <tr key={a.id} className="d-data-row">
                <td className="d-data-cell">
                  <div className={css('_flex _aic _gap2')}>
                    <img src={a.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                    <div>
                      <div className={css('_fontmedium')} style={{ fontSize: '0.875rem' }}>{a.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{a.handle}</div>
                    </div>
                  </div>
                </td>
                <td className="d-data-cell" style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem' }}>{a.location}</td>
                <td className="d-data-cell">
                  <span className="cat-chip" data-tone={i % 3 === 1 ? 'accent' : 'soft'}>{ticketTypes[i % 3]}</span>
                </td>
                <td className="d-data-cell">
                  <span className="d-annotation" data-status={statuses[i] === 'Checked In' ? 'success' : statuses[i] === 'Pending' ? 'warning' : 'info'}>
                    {statuses[i]}
                  </span>
                </td>
                <td className="d-data-cell" style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem' }}>
                  Apr {i + 1}, 2026
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
