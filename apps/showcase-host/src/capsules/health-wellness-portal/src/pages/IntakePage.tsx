import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';

const steps = [
  { id: 1, title: 'Personal Information', desc: 'Your name, contact, and emergency contact' },
  { id: 2, title: 'Medical History', desc: 'Past conditions and surgeries' },
  { id: 3, title: 'Current Medications', desc: 'What you take today' },
  { id: 4, title: 'Allergies', desc: 'Medications, foods, environmental' },
  { id: 5, title: 'Review & Submit', desc: 'Confirm and sign' },
];

export function IntakePage() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  function next() {
    if (step < steps.length) setStep(step + 1);
    else navigate('/records');
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)', gap: '2rem', maxWidth: 1200, alignItems: 'start' }}>
      {/* Steps sidebar */}
      <aside>
        <PageHeader title="Intake Form" description="" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.25rem' }}>
          {steps.map(s => (
            <div
              key={s.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '0.875rem', borderRadius: 'var(--d-radius)',
                background: step === s.id ? 'color-mix(in srgb, var(--d-primary) 8%, transparent)' : 'transparent',
                border: step === s.id ? '1px solid color-mix(in srgb, var(--d-primary) 30%, transparent)' : '1px solid transparent',
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: step > s.id ? 'var(--d-success)' : step === s.id ? 'var(--d-primary)' : 'var(--d-surface-raised)',
                color: step >= s.id ? '#fff' : 'var(--d-text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
              }} aria-hidden>
                {step > s.id ? <Check size={14} /> : s.id}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{s.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Form content */}
      <div className="hw-card" style={{ padding: '2rem' }}>
        <SectionLabel style={{ marginBottom: '0.5rem' }}>Step {step} of {steps.length}</SectionLabel>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>
          {steps[step - 1].title}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {step === 1 && (
            <>
              <Field label="Legal name" placeholder="Amelia Rivera" />
              <Field label="Date of birth" placeholder="06/14/1987" />
              <Field label="Phone" placeholder="(555) 123-4567" />
              <Field label="Emergency contact name" placeholder="Daniel Rivera" />
              <Field label="Emergency contact phone" placeholder="(555) 987-6543" />
            </>
          )}
          {step === 2 && (
            <>
              <Field label="Do you have any chronic conditions?" placeholder="e.g., Type 2 Diabetes, Hypertension" textarea />
              <Field label="Past surgeries (with dates)" placeholder="e.g., Appendectomy, 2015" textarea />
              <Field label="Family history of significant conditions" placeholder="e.g., Heart disease (father)" textarea />
            </>
          )}
          {step === 3 && (
            <>
              <Field label="Prescription medications" placeholder="One per line: name, dosage, frequency" textarea />
              <Field label="Over-the-counter medications & supplements" placeholder="e.g., Vitamin D3 2000 IU daily" textarea />
            </>
          )}
          {step === 4 && (
            <>
              <Field label="Medication allergies" placeholder="e.g., Penicillin — rash" textarea />
              <Field label="Food allergies" placeholder="e.g., Shellfish" textarea />
              <Field label="Environmental allergies" placeholder="e.g., Seasonal pollen" textarea />
            </>
          )}
          {step === 5 && (
            <div>
              <p style={{ fontSize: '0.9375rem', color: 'var(--d-text-muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                Please review your information on each step before signing. You can come back and edit anytime before your first visit.
              </p>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="checkbox" style={{ marginTop: 4 }} />
                <span>
                  I confirm that the information provided is accurate to the best of my knowledge and I consent to Evergreen Care using it for treatment purposes under HIPAA.
                </span>
              </label>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--d-border)' }}>
          {step > 1 ? (
            <button
              className="d-interactive"
              onClick={() => setStep(step - 1)}
              style={{ padding: '0.625rem 1rem' }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : <div />}
          <button
            className="hw-button-primary"
            onClick={next}
            style={{ padding: '0.625rem 1.25rem' }}
          >
            {step === steps.length ? 'Submit' : 'Continue'} {step < steps.length && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, textarea }: { label: string; placeholder: string; textarea?: boolean }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
        {label}
      </label>
      {textarea ? (
        <textarea className="d-control" placeholder={placeholder} rows={3} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
      ) : (
        <input type="text" className="d-control" placeholder={placeholder} />
      )}
    </div>
  );
}
