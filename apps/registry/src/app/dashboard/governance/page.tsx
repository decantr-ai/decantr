import { OrgGovernancePanel } from '@/components/org-governance-panel';

export default function GovernancePage() {
  return (
    <div className="registry-page-stack">
      <div className="registry-page-intro">
        <h3 className="text-lg font-semibold">Governance</h3>
        <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
          Review organization publishing policy, approvals, and the audit trail for your shared workspace.
        </p>
      </div>

      <section className="d-section" data-density="compact">
        <OrgGovernancePanel />
      </section>
    </div>
  );
}
