import { ChatPortalShell } from '../shells/chat-portal';
import { dashboardMetrics, recentConversations, sidebarNav } from '../mock-data';
import { Link, useLocation } from 'react-router-dom';

function DashboardSidebar() {
  const location = useLocation();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: '1.25rem 1.25rem 1rem',
          borderBottom: '1px solid var(--d-border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--d-radius-sm)',
              background: 'var(--d-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: '#18181B',
            }}
          >
            C
          </div>
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--d-text)',
            }}
          >
            Carbon AI
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: '0.75rem 0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.125rem',
        }}
      >
        {sidebarNav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'block',
                padding: '0.5rem 0.75rem',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--d-text)' : 'var(--d-text-muted)',
                background: isActive
                  ? 'var(--d-surface-raised)'
                  : 'transparent',
                borderRadius: 'var(--d-radius-sm)',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid var(--d-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--d-radius-full)',
            background: 'var(--d-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 600,
            color: '#18181B',
          }}
        >
          U
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--d-text)' }}>
            User
          </div>
          <div style={{ fontSize: 11, color: 'var(--d-text-muted)' }}>Admin</div>
        </div>
      </div>
    </div>
  );
}

const statusColors: Record<string, string> = {
  active: 'var(--d-success)',
  resolved: 'var(--d-primary)',
  waiting: 'var(--d-warning)',
};

const trendArrows: Record<string, string> = {
  up: '\u2191',
  down: '\u2193',
  flat: '\u2192',
};

export function DashboardPage() {
  return (
    <ChatPortalShell sidebar={<DashboardSidebar />}>
      <div style={{ padding: '2rem', overflow: 'auto' }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--d-text)',
            marginBottom: '1.5rem',
          }}
        >
          Dashboard
        </h1>

        {/* Metrics grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {dashboardMetrics.map((metric) => (
            <div
              key={metric.label}
              style={{
                background: 'var(--d-surface)',
                border: '1px solid var(--d-border)',
                borderRadius: 'var(--d-radius)',
                padding: '1.25rem',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--d-text-muted)',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                }}
              >
                {metric.label}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.625rem',
                }}
              >
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: 'var(--d-text)',
                  }}
                >
                  {metric.value}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color:
                      metric.trend === 'up'
                        ? 'var(--d-success)'
                        : metric.trend === 'down'
                          ? 'var(--d-success)'
                          : 'var(--d-text-muted)',
                  }}
                >
                  {trendArrows[metric.trend]} {metric.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Conversations table */}
        <div
          style={{
            background: 'var(--d-surface)',
            border: '1px solid var(--d-border)',
            borderRadius: 'var(--d-radius)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--d-border)',
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--d-text)',
              }}
            >
              Recent Conversations
            </h2>
          </div>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse' as const,
            }}
          >
            <thead>
              <tr>
                {['User', 'Topic', 'Status', 'Messages', 'Last Active'].map(
                  (header) => (
                    <th
                      key={header}
                      style={{
                        padding: '0.75rem 1.25rem',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--d-text-muted)',
                        textAlign: 'left' as const,
                        borderBottom: '1px solid var(--d-border)',
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {recentConversations.map((conv) => (
                <tr key={conv.id}>
                  <td
                    style={{
                      padding: '0.75rem 1.25rem',
                      fontSize: 13,
                      color: 'var(--d-text)',
                      borderBottom: '1px solid var(--d-border)',
                    }}
                  >
                    {conv.user}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem 1.25rem',
                      fontSize: 13,
                      color: 'var(--d-text-muted)',
                      borderBottom: '1px solid var(--d-border)',
                    }}
                  >
                    {conv.topic}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem 1.25rem',
                      borderBottom: '1px solid var(--d-border)',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.625rem',
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 'var(--d-radius-full)',
                        background: `color-mix(in srgb, ${statusColors[conv.status]} 15%, transparent)`,
                        color: statusColors[conv.status],
                        textTransform: 'capitalize' as const,
                      }}
                    >
                      {conv.status}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '0.75rem 1.25rem',
                      fontSize: 13,
                      color: 'var(--d-text-muted)',
                      borderBottom: '1px solid var(--d-border)',
                    }}
                  >
                    {conv.messages}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem 1.25rem',
                      fontSize: 13,
                      color: 'var(--d-text-muted)',
                      borderBottom: '1px solid var(--d-border)',
                    }}
                  >
                    {conv.lastActive}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ChatPortalShell>
  );
}
