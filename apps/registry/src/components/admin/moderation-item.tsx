'use client';

import { useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { approveSubmission, rejectSubmission } from '@/app/admin/moderation/actions';
import type { ModerationQueueItem } from '@/lib/api';

export function ModerationItem({ item }: { item: ModerationQueueItem }) {
  const [expanded, setExpanded] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const contentName =
    (item.content.data?.name as string) ||
    (item.content.data?.id as string) ||
    item.content.slug;

  function handleApprove() {
    startTransition(async () => {
      const result = await approveSubmission(item.id);
      setFeedback(result);
    });
  }

  function handleReject() {
    if (!reason.trim()) return;
    startTransition(async () => {
      const result = await rejectSubmission(item.id, reason);
      setFeedback(result);
      if (result.success) {
        setRejectMode(false);
        setReason('');
      }
    });
  }

  const statusVariant = {
    pending: 'warning' as const,
    approved: 'success' as const,
    rejected: 'error' as const,
  };

  const submittedDate = new Date(item.submitted_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className="space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-[var(--fg)]">{contentName}</span>
            <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
            <Badge>{item.content.type}</Badge>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-[var(--fg-dim)]">
            <span>{item.content.namespace}/{item.content.slug}</span>
            <span>v{item.content.version}</span>
            <span>{submittedDate}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>

      {/* Expandable JSON preview */}
      {expanded && (
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-md)] p-4 overflow-x-auto">
          <pre className="text-xs text-[var(--fg-muted)] whitespace-pre-wrap break-words">
            {JSON.stringify(item.content.data, null, 2)}
          </pre>
        </div>
      )}

      {/* Feedback message */}
      {feedback && (
        <div
          className={`text-sm px-3 py-2 rounded-[var(--radius-md)] ${
            feedback.success
              ? 'bg-[var(--success)]/20 text-[var(--success)]'
              : 'bg-[var(--error)]/20 text-[var(--error)]'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Action buttons (only for pending items) */}
      {item.status === 'pending' && !feedback?.success && (
        <div className="flex items-center gap-2 pt-1">
          {rejectMode ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Rejection reason..."
                className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-1.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-dim)] focus:outline-none focus:border-[var(--primary)]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleReject();
                  if (e.key === 'Escape') {
                    setRejectMode(false);
                    setReason('');
                  }
                }}
                autoFocus
              />
              <Button
                variant="danger"
                size="sm"
                onClick={handleReject}
                disabled={isPending || !reason.trim()}
              >
                {isPending ? 'Rejecting...' : 'Confirm Reject'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRejectMode(false);
                  setReason('');
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={isPending}
              >
                {isPending ? 'Approving...' : 'Approve'}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setRejectMode(true)}
                disabled={isPending}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      )}

      {/* Show rejection reason for already-rejected items */}
      {item.status === 'rejected' && item.rejection_reason && (
        <div className="text-sm text-[var(--error)] bg-[var(--error)]/10 px-3 py-2 rounded-[var(--radius-md)]">
          Reason: {item.rejection_reason}
        </div>
      )}
    </Card>
  );
}
