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
      <div className="registry-moderation-feedback" data-status="success">
        <span>
          <CheckIcon size={14} />
        </span>
        <span>
          {feedback.message}
        </span>
      </div>
    );
  }

  if (showReject) {
    return (
      <div className="registry-moderation-reject">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Rejection reason (required)"
          className="d-control registry-moderation-textarea"
          rows={2}
          autoFocus
        />
        <div className="registry-moderation-actions" data-align="end">
          <button
            className="d-interactive registry-moderation-button"
            data-variant="ghost"
            onClick={() => { setShowReject(false); setReason(''); }}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            className="d-interactive registry-moderation-button"
            data-variant="ghost"
            data-tone="danger"
            onClick={handleReject}
            disabled={isPending || !reason.trim()}
          >
            {isPending ? 'Rejecting...' : 'Confirm Reject'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="registry-moderation-panel">
      {feedback?.type === 'error' && (
        <p className="registry-moderation-feedback" data-status="error">
          {feedback.message}
        </p>
      )}
      <div className="registry-moderation-actions">
        <button
          className="d-interactive registry-moderation-button"
          data-variant="ghost"
          data-tone="success"
          onClick={handleApprove}
          disabled={isPending}
        >
          <CheckIcon size={14} />
          {isPending ? 'Approving...' : 'Approve'}
        </button>
        <button
          className="d-interactive registry-moderation-button"
          data-variant="ghost"
          data-tone="danger"
          onClick={() => setShowReject(true)}
          disabled={isPending}
        >
          <XIcon size={14} />
          Reject
        </button>
        <a
          href={`/admin/moderation/${item.id}`}
          className="d-interactive registry-moderation-button"
          data-variant="ghost"
        >
          <ExternalLinkIcon size={14} />
          Details
        </a>
      </div>
    </div>
  );
}
