'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveSubmission, rejectSubmission } from '../actions';

interface Props {
  id: string;
}

export function DetailActions({ id }: Props) {
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

  async function handleApprove() {
    setLoading('approve');
    setError('');
    const result = await approveSubmission(id);
    setLoading('');
    if (result.success) {
      router.push('/admin/moderation');
    } else {
      setError(result.message);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      setError('Rejection reason is required');
      return;
    }
    setLoading('reject');
    setError('');
    const result = await rejectSubmission(id, rejectReason);
    setLoading('');
    if (result.success) {
      router.push('/admin/moderation');
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm" style={{ color: 'var(--d-error)' }}>{error}</p>}

      {showReject && (
        <textarea
          className="d-control"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Reason for rejection..."
          style={{ minHeight: '6rem' }}
        />
      )}

      <div className="flex items-center gap-3">
        <button
          className="d-interactive"
          data-variant="primary"
          onClick={handleApprove}
          disabled={loading === 'approve'}
          style={{ fontSize: '0.875rem' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          {loading === 'approve' ? 'Approving...' : 'Approve'}
        </button>
        {!showReject ? (
          <button
            className="d-interactive"
            data-variant="danger"
            onClick={() => setShowReject(true)}
            style={{ fontSize: '0.875rem' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            Reject
          </button>
        ) : (
          <button
            className="d-interactive"
            data-variant="danger"
            onClick={handleReject}
            disabled={loading === 'reject'}
            style={{ fontSize: '0.875rem' }}
          >
            {loading === 'reject' ? 'Rejecting...' : 'Confirm Reject'}
          </button>
        )}
      </div>
    </div>
  );
}
