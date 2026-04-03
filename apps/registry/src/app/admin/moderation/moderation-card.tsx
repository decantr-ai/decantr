'use client';

import { useState, useTransition } from 'react';
import { approveSubmission, rejectSubmission } from './actions';
import type { ModerationQueueItem } from '@/lib/api';

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
      <div className="flex items-center gap-2 pt-2 border-t border-d-border/50">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-d-green"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span className="text-sm text-d-green">{feedback.message}</span>
      </div>
    );
  }

  return (
    <div className="pt-2 border-t border-d-border/50">
      {feedback?.type === 'error' && (
        <p className="text-sm text-d-error mb-2">{feedback.message}</p>
      )}

      {showReject ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Rejection reason (required)"
            className="d-control w-full text-sm rounded-md resize-none"
            rows={3}
          />
          <div className="flex items-center gap-2">
            <button
              className="d-interactive text-sm py-1.5 px-3"
              data-variant="danger"
              onClick={handleReject}
              disabled={isPending || !reason.trim()}
            >
              {isPending ? 'Rejecting...' : 'Confirm Reject'}
            </button>
            <button
              className="d-interactive text-sm py-1.5 px-3"
              data-variant="ghost"
              onClick={() => {
                setShowReject(false);
                setReason('');
              }}
              disabled={isPending}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            className="d-interactive text-sm py-1.5 px-3"
            data-variant="primary"
            style={{ background: 'var(--d-green)', borderColor: 'var(--d-green)' }}
            onClick={handleApprove}
            disabled={isPending}
          >
            {isPending ? 'Approving...' : 'Approve'}
          </button>
          <button
            className="d-interactive text-sm py-1.5 px-3"
            data-variant="danger"
            onClick={() => setShowReject(true)}
            disabled={isPending}
          >
            Reject
          </button>
          <a
            href={`/admin/moderation/${item.id}`}
            className="d-interactive text-sm py-1.5 px-3 ml-auto"
            data-variant="ghost"
          >
            View Detail
          </a>
        </div>
      )}
    </div>
  );
}
