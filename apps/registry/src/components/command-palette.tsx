'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { CommercialEntitlements } from '@/lib/api';

interface CommandPaletteProps {
  isAdmin: boolean;
  organizations: Array<{ id: string; slug: string; name: string }>;
  entitlements: CommercialEntitlements;
}

interface CommandItem {
  href: string;
  label: string;
}

function buildItems(props: CommandPaletteProps): CommandItem[] {
  const items: CommandItem[] = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/content', label: 'Content' },
    { href: '/dashboard/content/new', label: 'New Content' },
    { href: '/dashboard/api-keys', label: 'API Keys' },
    { href: '/dashboard/billing', label: 'Billing' },
    { href: '/dashboard/settings', label: 'Settings' },
  ];

  if (props.entitlements.org_collaboration || props.organizations.length > 0) {
    items.push({ href: '/dashboard/team', label: 'Team' });
    items.push({ href: '/dashboard/governance', label: 'Governance' });
  }

  if (props.entitlements.private_registry_portal) {
    items.push({ href: '/dashboard/private-registry', label: 'Private Registry' });
  }

  if (props.isAdmin) {
    items.push({ href: '/admin/moderation', label: 'Moderation' });
    items.push({ href: '/admin/organizations', label: 'Organizations' });
    items.push({ href: '/admin/reports', label: 'Reports' });
  }

  return items;
}

export function CommandPalette(props: CommandPaletteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    function handleToggle() {
      setOpen((current) => !current);
    }

    function handleKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }

      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    window.addEventListener('registry:command-palette-toggle', handleToggle as EventListener);
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('registry:command-palette-toggle', handleToggle as EventListener);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const timeout = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timeout);
  }, [open]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return buildItems(props).filter((item) => {
      if (item.href === pathname) return false;
      if (!normalized) return true;
      return `${item.label} ${item.href}`.toLowerCase().includes(normalized);
    });
  }, [pathname, props, query]);

  function navigate(href: string) {
    setOpen(false);
    setQuery('');
    router.push(href);
  }

  if (!open) return null;

  return (
    <div className="registry-command-overlay" onClick={() => setOpen(false)}>
      <div
        className="registry-command-panel d-surface"
        role="dialog"
        aria-modal="true"
        aria-label="Search routes"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="registry-command-header">
          <input
            ref={inputRef}
            className="d-control"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search dashboard routes..."
          />
        </div>

        <div className="registry-command-list">
          {filteredItems.length === 0 ? (
            <div className="registry-command-empty">No matching routes.</div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.href}
                type="button"
                className="registry-command-item"
                onClick={() => navigate(item.href)}
              >
                <span className="registry-command-item-label">{item.label}</span>
                <span className="registry-command-item-path">{item.href}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
