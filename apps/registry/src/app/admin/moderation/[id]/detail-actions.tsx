'use client';

import { useState, useTransition } from 'react';
import { approveSubmission, rejectSubmission } from '../actions';

export function ModerationDetailActions({ itemId }: { itemId: string }) {
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  function handleApprove() {
    startTransition(async () => {
      const result = await approveSubmission(itemId);
      setFeedback({
        type: result.success ? 'success' : 'error',
        message: result.message,
      });
    });
  }

  function handleReject() {
    if (!reason.trim()) return;
    startTransition(async () => {
      const result = await rejectSubmission(itemId, reason);
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
      <div className="d-surface rounded-lg p-6 flex flex-col items-center gap-3">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-d-green"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <p className="text-sm text-d-green font-medium">{feedback.message}</p>
        <a
          href="/admin/moderation"
          className="d-interactive text-sm py-1.5 px-4 mt-2"
          data-variant="ghost"
        >
          Back to Queue
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Admin notes */}
      <div>
        <label
          htmlFor="admin-notes"
          className="block text-xs text-d-muted mb-1.5"
        >
          Admin Notes (internal)
        </label>
        <textarea
          id="admin-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes for the team..."
          className="d-control w-full text-sm rounded-md resize-none"
          rows={2}
        />
      </div>

      {feedback?.type === 'error' && (
        <p className="text-sm text-d-error">{feedback.message}</p>
      )}

      {showReject ? (
        <div className="flex flex-col gap-3">
          <div>
            <label
              htmlFor="reject-reason"
              className="block text-xs text-d-muted mb-1.5"
            >
              Rejection Reason (required, visible to submitter)
            </label>
            <textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this submission is being rejected..."
              className="d-control w-full text-sm rounded-md resize-none"
              rows={4}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              className="d-interactive text-sm py-2 px-5"
              data-variant="danger"
              onClick={handleReject}
              disabled={isPending || !reason.trim()}
            >
              {isPending ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
            <button
              className="d-interactive text-sm py-2 px-5"
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
        <div className="flex items-center gap-3">
          <button
            className="d-interactive text-sm py-2 px-5"
            data-variant="primary"
            style={{ background: 'var(--d-green)', borderColor: 'var(--d-green)' }}
            onClick={handleApprove}
            disabled={isPending}
          >
            {isPending ? 'Approving...' : 'Approve Submission'}
          </button>
          <button
            className="d-interactive text-sm py-2 px-5"
            data-variant="danger"
            onClick={() => setShowReject(true)}
            disabled={isPending}
          >
            Reject Submission
          </button>
        </div>
      )}
    </div>
  );
}
