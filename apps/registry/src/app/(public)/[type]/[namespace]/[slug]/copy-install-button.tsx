'use client';

import { useCallback, useState } from 'react';

interface CopyInstallButtonProps {
  installCmd: string;
  label?: string;
  successLabel?: string;
  variant?: 'primary' | 'ghost';
}

export function CopyInstallButton({
  installCmd,
  label,
  successLabel,
  variant = 'primary',
}: CopyInstallButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(installCmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API may not be available
    }
  }, [installCmd]);

  const displayLabel = label ?? installCmd;
  const displaySuccess = successLabel ?? 'Copied!';

  return (
    <button
      onClick={handleCopy}
      className="d-interactive py-1.5 px-4 text-sm gap-2"
      data-variant={variant}
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {displaySuccess}
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          <code className="font-mono text-xs">{displayLabel}</code>
        </>
      )}
    </button>
  );
}
