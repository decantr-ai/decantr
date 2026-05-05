import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';

export function MfaSetupPage() {
  const navigate = useNavigate();
  return (
    <div>
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <div className="fin-label" style={{ marginBottom: 8 }}>Step 1 of 2 · Setup</div>
        <div style={{
          width: 140, height: 140, margin: '0 auto', background: '#fff', border: '1px solid var(--d-border)',
          padding: 8, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundImage: `repeating-conic-gradient(#000 0% 25%, #fff 0% 50%)`,
          backgroundSize: '14px 14px',
        }} aria-label="QR code" />
        <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginTop: 6, fontFamily: 'ui-monospace, monospace' }}>
          JBSWY3DPEHPK3PXP
        </div>
      </div>
      <AuthForm
        title="Enable two-factor auth"
        subtitle="Scan the QR code with your authenticator app."
        submitLabel="Verify & enable"
        onSubmit={() => navigate('/metrics')}
        fields={[{ name: 'code', label: '6-digit code', type: 'text', placeholder: '000 000' }]}
      />
    </div>
  );
}
