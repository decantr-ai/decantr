'use client';

import { useCallback, useState } from 'react';
import styles from './copy-install-button.module.css';

interface CopyInstallButtonProps {
  installCmd: string;
  label?: string;
  successLabel?: string;
  variant?: 'primary' | 'ghost';
  commandText?: string;
  hint?: string;
}

export function CopyInstallButton({
  installCmd,
  label,
  successLabel,
  variant = 'primary',
  commandText,
  hint,
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

  const displayLabel = label ?? 'Copy command';
  const displaySuccess = successLabel ?? 'Copied!';

  return (
    <button
      onClick={handleCopy}
      className={`d-interactive py-1.5 px-4 ${styles.actionButton}`}
      data-variant={variant}
    >
      {copied ? (
        <span className={styles.actionLabel}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {displaySuccess}
        </span>
      ) : (
        <span className={styles.actionButtonContent}>
          <span className={styles.actionLabel}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            {displayLabel}
          </span>
          {commandText ? (
            <code className={styles.actionCommand}>{commandText}</code>
          ) : null}
          {hint ? (
            <span className={styles.actionHint}>{hint}</span>
          ) : null}
        </span>
      )}
    </button>
  );
}
