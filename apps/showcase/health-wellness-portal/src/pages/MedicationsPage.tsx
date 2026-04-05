import { Pill, Plus, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { medications } from '@/data/mock';

export function MedicationsPage() {
  const needsRefill = medications.filter(m => m.refillsRemaining <= 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1400 }}>
      <PageHeader
        title="Medications"
        description="Your current prescriptions, refill schedule, and adherence."
        actions={
          <button className="hw-button-primary" style={{ padding: '0.625rem 1.125rem', fontSize: '0.9375rem' }}>
            <Plus size={18} /> Request Refill
          </button>
        }
      />

      {/* Refill alerts */}
      {needsRefill.length > 0 && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--d-radius-lg)',
          background: 'color-mix(in srgb, var(--d-warning) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--d-warning) 30%, transparent)',
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        }}>
          <AlertCircle size={20} style={{ color: 'var(--d-warning)', flexShrink: 0, marginTop: 2 }} aria-hidden />
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              {needsRefill.length} medication{needsRefill.length > 1 ? 's' : ''} need attention soon
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
              {needsRefill.map(m => m.name).join(', ')} — refill within two weeks to avoid running out.
            </div>
          </div>
        </div>
      )}

      {/* Medications data table */}
      <div>
        <SectionLabel style={{ marginBottom: '0.875rem' }}>Current Prescriptions</SectionLabel>
        <div className="hw-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="d-data">
            <thead>
              <tr>
                <th className="d-data-header">Medication</th>
                <th className="d-data-header">Dosage</th>
                <th className="d-data-header">Schedule</th>
                <th className="d-data-header">Adherence</th>
                <th className="d-data-header">Refills Left</th>
                <th className="d-data-header">Next Refill</th>
                <th className="d-data-header">Prescribed By</th>
              </tr>
            </thead>
            <tbody>
              {medications.map(m => (
                <tr key={m.id} className="d-data-row">
                  <td className="d-data-cell">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{
                        width: 36, height: 36,
                        borderRadius: 'var(--d-radius)',
                        background: 'color-mix(in srgb, var(--d-secondary) 12%, transparent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }} aria-hidden>
                        <Pill size={16} style={{ color: 'var(--d-secondary)' }} />
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{m.name}</span>
                    </div>
                  </td>
                  <td className="d-data-cell">
                    <span className="hw-med-dose">{m.dosage}</span>
                  </td>
                  <td className="d-data-cell" style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>{m.frequency}</td>
                  <td className="d-data-cell">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 140 }}>
                      <div className="hw-progress-track" style={{ flex: 1, height: 6 }}>
                        <div className="hw-progress-fill" style={{ width: `${m.adherence}%` }} />
                      </div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, minWidth: 32 }}>{m.adherence}%</span>
                    </div>
                  </td>
                  <td className="d-data-cell">
                    <span
                      className="d-annotation"
                      data-status={m.refillsRemaining === 0 ? 'error' : m.refillsRemaining <= 2 ? 'warning' : 'success'}
                    >
                      {m.refillsRemaining} left
                    </span>
                  </td>
                  <td className="d-data-cell" style={{ fontSize: '0.875rem' }}>{m.nextRefill}</td>
                  <td className="d-data-cell" style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>{m.prescribedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's schedule */}
      <div>
        <SectionLabel style={{ marginBottom: '0.875rem' }}>Today's Schedule</SectionLabel>
        <div className="hw-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { time: '8:00 AM', label: 'Metformin 500 mg · with breakfast', taken: true },
              { time: '8:00 AM', label: 'Lisinopril 10 mg', taken: true },
              { time: '8:00 AM', label: 'Vitamin D3 2000 IU · with meal', taken: false },
              { time: '6:00 PM', label: 'Metformin 500 mg · with dinner', taken: false },
              { time: '10:00 PM', label: 'Atorvastatin 20 mg · bedtime', taken: false },
            ].map((dose, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.75rem', borderRadius: 'var(--d-radius)',
                background: dose.taken ? 'color-mix(in srgb, var(--d-success) 6%, transparent)' : 'var(--d-surface-raised)',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  border: `2px solid ${dose.taken ? 'var(--d-success)' : 'var(--d-border)'}`,
                  background: dose.taken ? 'var(--d-success)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }} aria-label={dose.taken ? 'Taken' : 'Not yet taken'}>
                  {dose.taken && <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, width: 72, color: 'var(--d-text-muted)' }}>{dose.time}</span>
                <span style={{ flex: 1, fontSize: '0.9375rem', textDecoration: dose.taken ? 'line-through' : 'none', color: dose.taken ? 'var(--d-text-muted)' : 'var(--d-text)' }}>
                  {dose.label}
                </span>
                {!dose.taken && (
                  <button className="d-interactive" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                    Mark taken
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
