import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, MapPin, Clock, ArrowLeft, Check } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { Calendar } from '@/components/Calendar';
import { providers } from '@/data/mock';

const timeSlots = ['8:00 AM', '9:00 AM', '10:00 AM', '10:30 AM', '11:00 AM', '1:00 PM', '2:00 PM', '2:30 PM', '3:00 PM', '4:00 PM'];

export function BookAppointmentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<string>(providers[0].id);
  const [selectedDay, setSelectedDay] = useState<number | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [visitType, setVisitType] = useState<'telehealth' | 'in-person'>('telehealth');

  const provider = providers.find(p => p.id === selectedProvider);

  function handleBook() {
    // Simulated booking
    navigate('/appointments');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 960 }}>
      <PageHeader
        title="Book an Appointment"
        description="Four quick steps. We will confirm via email and text."
      />

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {[
          { n: 1, label: 'Visit type' },
          { n: 2, label: 'Provider' },
          { n: 3, label: 'Date & time' },
          { n: 4, label: 'Confirm' },
        ].map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: i < 3 ? 1 : 'none' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: step >= s.n ? 'var(--d-primary)' : 'var(--d-surface-raised)',
              color: step >= s.n ? '#fff' : 'var(--d-text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.875rem', fontWeight: 700, flexShrink: 0,
            }} aria-current={step === s.n ? 'step' : undefined}>
              {step > s.n ? <Check size={16} /> : s.n}
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: step === s.n ? 600 : 500, color: step >= s.n ? 'var(--d-text)' : 'var(--d-text-muted)' }}>
              {s.label}
            </span>
            {i < 3 && <div style={{ flex: 1, height: 2, background: step > s.n ? 'var(--d-primary)' : 'var(--d-border)', borderRadius: 1 }} />}
          </div>
        ))}
      </div>

      <div className="hw-card" style={{ padding: '2rem' }}>
        {step === 1 && (
          <div>
            <SectionLabel style={{ marginBottom: '1rem' }}>How would you like to visit?</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { id: 'telehealth' as const, icon: Video, title: 'Video visit', desc: 'Meet your provider from home. Best for follow-ups, medication reviews, and non-urgent concerns.' },
                { id: 'in-person' as const, icon: MapPin, title: 'In-person', desc: 'Visit an Evergreen clinic. Best for physicals, labs, imaging, and hands-on exams.' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setVisitType(opt.id)}
                  style={{
                    padding: '1.5rem', textAlign: 'left',
                    border: `2px solid ${visitType === opt.id ? 'var(--d-primary)' : 'var(--d-border)'}`,
                    borderRadius: 'var(--d-radius-lg)',
                    background: visitType === opt.id ? 'color-mix(in srgb, var(--d-primary) 6%, transparent)' : 'var(--d-surface)',
                    cursor: 'pointer',
                    transition: 'border-color 150ms ease, background 150ms ease',
                  }}
                >
                  <opt.icon size={28} style={{ color: visitType === opt.id ? 'var(--d-primary)' : 'var(--d-text-muted)', marginBottom: '0.75rem' }} aria-hidden />
                  <div style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.375rem' }}>{opt.title}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.55 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <SectionLabel style={{ marginBottom: '1rem' }}>Choose a provider</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {providers.map(p => (
                <button
                  key={p.id}
                  onClick={() => p.available && setSelectedProvider(p.id)}
                  disabled={!p.available}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                    border: `2px solid ${selectedProvider === p.id ? 'var(--d-primary)' : 'var(--d-border)'}`,
                    borderRadius: 'var(--d-radius-lg)',
                    background: selectedProvider === p.id ? 'color-mix(in srgb, var(--d-primary) 6%, transparent)' : 'var(--d-surface)',
                    cursor: p.available ? 'pointer' : 'not-allowed',
                    opacity: p.available ? 1 : 0.55,
                    textAlign: 'left',
                    transition: 'border-color 150ms ease, background 150ms ease',
                  }}
                >
                  <div className="hw-avatar" style={{ width: 48, height: 48, fontSize: '1rem' }}>{p.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>{p.name}, {p.title}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>{p.specialty}</div>
                  </div>
                  <span className="d-annotation" data-status={p.available ? 'success' : undefined}>
                    {p.available ? 'Available' : 'Fully booked'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
            <div>
              <SectionLabel style={{ marginBottom: '1rem' }}>Choose a date</SectionLabel>
              <Calendar
                eventDays={[8, 15, 22]}
                selectedDay={selectedDay}
                onSelect={setSelectedDay}
                monthLabel="April 2026"
              />
            </div>
            <div>
              <SectionLabel style={{ marginBottom: '1rem' }}>Available times</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {timeSlots.map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    style={{
                      padding: '0.75rem',
                      border: `1px solid ${selectedTime === t ? 'var(--d-primary)' : 'var(--d-border)'}`,
                      borderRadius: 'var(--d-radius)',
                      background: selectedTime === t ? 'var(--d-primary)' : 'var(--d-surface)',
                      color: selectedTime === t ? '#fff' : 'var(--d-text)',
                      fontSize: '0.9375rem', fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 120ms ease, border-color 120ms ease',
                    }}
                  >
                    <Clock size={14} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} aria-hidden />
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <SectionLabel style={{ marginBottom: '1rem' }}>Review your appointment</SectionLabel>
            <div style={{ background: 'var(--d-surface-raised)', padding: '1.25rem', borderRadius: 'var(--d-radius-lg)', marginBottom: '1.25rem' }}>
              <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.75rem 1.5rem', fontSize: '0.9375rem' }}>
                <dt style={{ color: 'var(--d-text-muted)', fontWeight: 500 }}>Visit type</dt>
                <dd style={{ fontWeight: 600 }}>{visitType === 'telehealth' ? 'Video visit' : 'In-person'}</dd>
                <dt style={{ color: 'var(--d-text-muted)', fontWeight: 500 }}>Provider</dt>
                <dd style={{ fontWeight: 600 }}>{provider?.name}, {provider?.specialty}</dd>
                <dt style={{ color: 'var(--d-text-muted)', fontWeight: 500 }}>Date</dt>
                <dd style={{ fontWeight: 600 }}>April {selectedDay ?? 8}, 2026</dd>
                <dt style={{ color: 'var(--d-text-muted)', fontWeight: 500 }}>Time</dt>
                <dd style={{ fontWeight: 600 }}>{selectedTime ?? '10:30 AM'}</dd>
              </dl>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
              You will receive a confirmation email and text reminder 24 hours before your visit. You can reschedule anytime up to 2 hours before.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--d-border)' }}>
          {step > 1 ? (
            <button
              className="d-interactive"
              onClick={() => setStep(step - 1)}
              style={{ padding: '0.625rem 1rem', fontSize: '0.9375rem' }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : <div />}
          {step < 4 ? (
            <button
              className="hw-button-primary"
              onClick={() => setStep(step + 1)}
              style={{ padding: '0.625rem 1.25rem' }}
            >
              Continue
            </button>
          ) : (
            <button
              className="hw-button-primary"
              onClick={handleBook}
              style={{ padding: '0.625rem 1.25rem' }}
            >
              <Check size={18} /> Confirm Appointment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
