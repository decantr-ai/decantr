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
      <div className="d-surface registry-moderation-success">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="registry-moderation-success-icon"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <p className="registry-moderation-feedback" data-status="success">{feedback.message}</p>
        <a
          href="/admin/moderation"
          className="d-interactive registry-moderation-link"
          data-variant="ghost"
        >
          Back to Queue
        </a>
      </div>
    );
  }

  return (
    <div className="registry-moderation-detail-actions">
      {/* Admin notes */}
      <div>
        <label
          htmlFor="admin-notes"
          className="registry-moderation-label"
        >
          Admin Notes (internal)
        </label>
        <textarea
          id="admin-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes for the team..."
          className="d-control registry-moderation-textarea"
          rows={2}
        />
      </div>

      {feedback?.type === 'error' && (
        <p className="registry-moderation-feedback" data-status="error">{feedback.message}</p>
      )}

      {showReject ? (
        <div className="registry-moderation-reject">
          <div>
            <label
              htmlFor="reject-reason"
              className="registry-moderation-label"
            >
              Rejection Reason (required, visible to submitter)
            </label>
            <textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this submission is being rejected..."
              className="d-control registry-moderation-textarea"
              rows={4}
            />
          </div>
          <div className="registry-moderation-actions">
            <button
              className="d-interactive registry-moderation-button"
              data-variant="danger"
              onClick={handleReject}
              disabled={isPending || !reason.trim()}
            >
              {isPending ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
            <button
              className="d-interactive registry-moderation-button"
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
        <div className="registry-moderation-actions">
          <button
            className="d-interactive registry-moderation-button"
            data-variant="primary"
            data-tone="success"
            onClick={handleApprove}
            disabled={isPending}
          >
            {isPending ? 'Approving...' : 'Approve Submission'}
          </button>
          <button
            className="d-interactive registry-moderation-button"
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
