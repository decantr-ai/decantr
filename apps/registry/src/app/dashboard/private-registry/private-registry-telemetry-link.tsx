'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useRegistryWebTelemetry } from '@/components/registry-web-telemetry';

type PrivateRegistryIntentAction = 'open_billing' | 'open_private_registry' | 'open_team';

export function PrivateRegistryTelemetryLink({
  action,
  children,
  href,
  orgScoped,
  plan,
  surface,
  variant = 'ghost',
}: {
  action: PrivateRegistryIntentAction;
  children: ReactNode;
  href: string;
  orgScoped: boolean;
  plan?: string;
  surface: string;
  variant?: 'ghost' | 'primary';
}) {
  const { capture } = useRegistryWebTelemetry();

  return (
    <Link
      href={href}
      className="d-interactive"
      data-variant={variant}
      onClick={() => {
        capture('private_registry.intent_clicked', {
          action,
          orgScoped,
          plan,
          surface,
        });
      }}
    >
      {children}
    </Link>
  );
}
