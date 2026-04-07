'use client';

import { useState, useTransition } from 'react';
import { approveSubmission, rejectSubmission } from './actions';
import type { ModerationQueueItem } from '@/lib/api';

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function ExternalLinkIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export function ModerationCard({ item }: { item: ModerationQueueItem }) {
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  function handleApprove() {
    startTransition(async () => {
      const result = await approveSubmission(item.id);
      setFeedback({
        type: result.success ? 'success' : 'error',
        message: result.message,
      });
    });
  }

  function handleReject() {
    if (!reason.trim()) return;
    startTransition(async () => {
      const result = await rejectSubmission(item.id, reason);
      setFeedback({
        type: result.success ? 'success' : 'error',
        message: result.message,
      });
      if (result.success) {
        setShowReject(false);
        setReason('');
      }
    });
  }

  if (feedback?.type === 'success') {
    return (
      <div className="flex items-center gap-2">
        <span style={{ color: 'var(--d-success)' }}>
          <CheckIcon size={14} />
        </span>
        <span className="text-sm" style={{ color: 'var(--d-success)' }}>
          {feedback.message}
        </span>
      </div>
    );
  }

  if (showReject) {
    return (
      <div className="flex flex-col gap-2" style={{ minWidth: '20rem' }}>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Rejection reason (required)"
          className="d-control w-full"
          style={{ resize: 'none', fontSize: '0.8125rem' }}
          rows={2}
          autoFocus
        />
        <div className="flex items-center gap-2 justify-end">
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => { setShowReject(false); setReason(''); }}
            disabled={isPending}
            style={{ fontSize: '0.8125rem' }}
          >
            Cancel
          </button>
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={handleReject}
            disabled={isPending || !reason.trim()}
            style={{ color: 'var(--d-error)', fontSize: '0.8125rem' }}
          >
            {isPending ? 'Rejecting...' : 'Confirm Reject'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 items-end">
      {feedback?.type === 'error' && (
        <p className="text-xs" style={{ color: 'var(--d-error)' }}>
          {feedback.message}
        </p>
      )}
      <div className="flex items-center gap-2">
        <button
          className="d-interactive"
          data-variant="ghost"
          onClick={handleApprove}
          disabled={isPending}
          style={{ color: 'var(--d-success)', fontSize: '0.8125rem' }}
        >
          <CheckIcon size={14} />
          {isPending ? 'Approving...' : 'Approve'}
        </button>
        <button
          className="d-interactive"
          data-variant="ghost"
          onClick={() => setShowReject(true)}
          disabled={isPending}
          style={{ color: 'var(--d-error)', fontSize: '0.8125rem' }}
        >
          <XIcon size={14} />
          Reject
        </button>
        <a
          href={`/admin/moderation/${item.id}`}
          className="d-interactive"
          data-variant="ghost"
          style={{ fontSize: '0.8125rem', textDecoration: 'none' }}
        >
          <ExternalLinkIcon size={14} />
          Details
        </a>
      </div>
    </div>
  );
}
