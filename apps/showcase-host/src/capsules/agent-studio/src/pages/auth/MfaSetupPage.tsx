import { AuthForm } from '@/components/AuthForm';

export function MfaSetupPage() {
  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 6, fontFamily: 'var(--d-font-mono)' }}>Set up MFA</h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>Scan the QR code with your authenticator app, then enter the code.</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0 1.25rem' }}>
        <div style={{ width: 140, height: 140, background: '#0F0F12', border: '1px solid var(--d-border)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--d-font-mono)', fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>
          [ QR CODE ]
        </div>
      </div>
      <div className="mono-inline" style={{ display: 'block', textAlign: 'center', padding: '0.5rem', marginBottom: '1rem', fontSize: '0.72rem' }}>JBSW Y3DP EHPK 3PXP</div>
      <AuthForm
        title=""
        submitLabel="Verify & enable"
        redirect="/agents"
        fields={[
          { name: 'code', label: '6-digit code', type: 'text', placeholder: '000000' },
        ]}
      />
    </div>
  );
}
