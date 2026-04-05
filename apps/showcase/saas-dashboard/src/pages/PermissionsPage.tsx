import { Check } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { permissions, roles, rolePermissions } from '@/data/mock';

export function PermissionsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Permissions"
        description="Fine-grained access control by role. Owners can override any permission."
        actions={
          <button className="sd-button-accent" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
            Create custom role
          </button>
        }
      />

      <div className="d-surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="d-data" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th className="d-data-header" style={{ minWidth: 240 }}>Permission</th>
                {roles.map(r => (
                  <th key={r.key} className="d-data-header" style={{ textAlign: 'center', minWidth: 90 }}>
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map(p => (
                <tr key={p.key} className="d-data-row">
                  <td className="d-data-cell">
                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{p.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>{p.description}</div>
                  </td>
                  {roles.map(r => {
                    const has = rolePermissions[r.key].includes(p.key);
                    return (
                      <td key={r.key} className="d-data-cell" style={{ textAlign: 'center' }}>
                        {has ? (
                          <Check size={16} style={{ color: 'var(--d-success)', display: 'inline-block' }} />
                        ) : (
                          <span style={{ color: 'var(--d-text-muted)', opacity: 0.3 }}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
