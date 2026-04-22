'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { WorkspaceSnapshot } from '@/lib/workspace-state';

/* ── Inline SVG Icons (16x16, Lucide-style, stroke-based) ── */

function HexagonIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

function LayoutDashboardIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function PackageIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function KeyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
      <path d="m21 2-9.6 9.6" />
      <circle cx="7.5" cy="15.5" r="5.5" />
    </svg>
  );
}

function SettingsIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CreditCardIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function UsersIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ShieldIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function BarChartIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

function LogOutIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

function PanelLeftCloseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
      <path d="m16 15-3-3 3-3" />
    </svg>
  );
}

function PanelLeftOpenIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
      <path d="m14 9 3 3-3 3" />
    </svg>
  );
}

/* ── Types ── */

type IconComponent = (props: { size?: number }) => React.JSX.Element;

interface NavItem {
  href: string;
  icon: IconComponent;
  label: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

interface SidebarProps {
  workspace: WorkspaceSnapshot;
}

function buildNavGroups(workspace: WorkspaceSnapshot): NavGroup[] {
  const dashboardItems: NavItem[] = [
    { href: '/dashboard', icon: LayoutDashboardIcon, label: 'Overview' },
    { href: '/dashboard/content', icon: PackageIcon, label: 'Content' },
    { href: '/dashboard/api-keys', icon: KeyIcon, label: 'API Keys' },
    { href: '/dashboard/billing', icon: CreditCardIcon, label: 'Billing' },
  ];

  if (workspace.capabilities.canAccessTeam) {
    dashboardItems.push({ href: '/dashboard/team', icon: UsersIcon, label: 'Team' });
  }

  if (workspace.capabilities.canAccessGovernance) {
    dashboardItems.push({ href: '/dashboard/governance', icon: ShieldIcon, label: 'Governance' });
  }

  if (workspace.capabilities.canAccessPrivateRegistry) {
    dashboardItems.push({ href: '/dashboard/private-registry', icon: PackageIcon, label: 'Private Registry' });
  }

  dashboardItems.push({ href: '/dashboard/settings', icon: SettingsIcon, label: 'Settings' });

  return [
    {
      group: 'Dashboard',
      items: dashboardItems,
    },
    ...(workspace.capabilities.canAccessAdmin
      ? [{
          group: 'Admin',
          items: [
            { href: '/admin/moderation', icon: ShieldIcon, label: 'Moderation' },
            { href: '/admin/organizations', icon: UsersIcon, label: 'Organizations' },
            { href: '/admin/reports', icon: BarChartIcon, label: 'Reports' },
          ],
        }]
      : []),
  ];
}

/* ── Component ── */

export function Sidebar({ workspace }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const sidebarWidth = collapsed ? 64 : 240;
  const navGroups = buildNavGroups(workspace);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const media = window.matchMedia('(max-width: 767px)');
    const update = () => {
      const nextIsMobile = media.matches;
      setIsMobile(nextIsMobile);
      if (!nextIsMobile) {
        setMobileOpen(false);
      }
    };

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleToggle = () => {
      if (window.matchMedia('(max-width: 767px)').matches) {
        setMobileOpen((open) => !open);
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };

    window.addEventListener('registry:sidebar-toggle', handleToggle as EventListener);
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('registry:sidebar-toggle', handleToggle as EventListener);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isMobile && mobileOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous;
      };
    }
    return undefined;
  }, [isMobile, mobileOpen]);

  async function handleSignOut() {
    try {
      await fetch('/auth/signout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  }

  const desktopCollapsed = !isMobile && collapsed;
  const shellStyle = {
    '--sidebar-width': `${sidebarWidth}px`,
  } as CSSProperties;

  return (
    <>
      <button
        type="button"
        className="registry-shell-sidebar-overlay"
        data-open={isMobile && mobileOpen}
        onClick={() => setMobileOpen(false)}
        aria-label="Close navigation"
      />
      <aside
        className="registry-shell-sidebar-spacer"
        data-mobile={isMobile}
        style={shellStyle}
      >
        <div
          className="registry-shell-sidebar-panel"
          data-mobile={isMobile}
          data-open={isMobile && mobileOpen}
          data-collapsed={desktopCollapsed}
        >
          <div className="registry-sidebar-brand">
            {!desktopCollapsed && (
              <div className="registry-sidebar-brand-mark">
                <span className="registry-sidebar-brand-icon">
                  <HexagonIcon size={18} />
                </span>
                <span className="font-semibold text-sm lum-brand">decantr</span>
              </div>
            )}
            <button
              className="d-interactive registry-sidebar-collapse"
              data-variant="ghost"
              onClick={() => {
                if (isMobile) {
                  setMobileOpen(false);
                  return;
                }
                setCollapsed((c) => !c);
              }}
              aria-label={
                isMobile
                  ? 'Close navigation'
                  : desktopCollapsed
                  ? 'Expand sidebar'
                  : 'Collapse sidebar'
              }
            >
              {isMobile ? (
                <PanelLeftCloseIcon size={16} />
              ) : desktopCollapsed ? (
                <PanelLeftOpenIcon size={16} />
              ) : (
                <PanelLeftCloseIcon size={16} />
              )}
            </button>
          </div>

          <nav className="registry-sidebar-nav">
            {navGroups.map((group) => (
              <div key={group.group} className="registry-sidebar-group">
                {!desktopCollapsed && (
                  <span className="d-label registry-sidebar-group-label">
                    {group.group}
                  </span>
                )}
                {group.items.map((item) => {
                  const isActive =
                    item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="d-interactive registry-sidebar-item"
                      data-variant="ghost"
                      data-active={isActive}
                      data-collapsed={desktopCollapsed}
                      title={item.label}
                      onClick={() => {
                        if (isMobile) {
                          setMobileOpen(false);
                        }
                      }}
                    >
                      <Icon size={16} />
                      {!desktopCollapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="registry-sidebar-footer">
            {!desktopCollapsed && (
              <div className="registry-sidebar-user">
                <span className="registry-sidebar-user-name">
                  {workspace.identity.shortLabel}
                </span>
                <span className="registry-sidebar-user-tier">
                  {workspace.identity.tierLabel}
                </span>
              </div>
            )}
            <button
              type="button"
              className="d-interactive registry-sidebar-item"
              data-variant="ghost"
              data-collapsed={desktopCollapsed}
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOutIcon size={16} />
              {!desktopCollapsed && <span>Sign out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
