'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ModerationQueueItem } from '@/lib/api';
import { approveSubmission, rejectSubmission } from './actions';

const TYPE_COLORS: Record<string, string> = {
  pattern: 'var(--d-coral)',
  theme: 'var(--d-amber)',
  blueprint: 'var(--d-cyan)',
  shell: 'var(--d-green)',
  archetype: 'var(--d-purple)',
};

interface Props {
  item: ModerationQueueItem;
  onUpdated: (id: string, status: 'approved' | 'rejected') => void;
}

export function ModerationCard({ item, onUpdated }: Props) {
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

  const singularType = item.content.type.endsWith('s') ? item.content.type.slice(0, -1) : item.content.type;
  const typeColor = TYPE_COLORS[singularType] || 'var(--d-primary)';

  async function handleApprove() {
    setLoading('approve');
    setError('');
    const result = await approveSubmission(item.id);
    setLoading('');
    if (result.success) {
      onUpdated(item.id, 'approved');
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
    const result = await rejectSubmission(item.id, rejectReason);
    setLoading('');
    if (result.success) {
      onUpdated(item.id, 'rejected');
    } else {
      setError(result.message);
    }
  }

  return (
    <div
      className="lum-card-outlined"
      data-type={singularType}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="d-annotation"
            style={{
              background: `color-mix(in srgb, ${typeColor} 15%, transparent)`,
              color: typeColor,
            }}
          >
            {singularType}
          </span>
          <span className="font-semibold text-sm">{item.content.slug}</span>
          <span className="d-annotation">{item.content.namespace}</span>
        </div>
        <span className="text-xs" style={{ color: 'var(--d-text-muted)' }}>
          {new Date(item.submitted_at).toLocaleDateString()}
        </span>
      </div>

      {/* Submitter */}
      <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: 'var(--d-text-muted)' }}>
        <span>Submitted by <strong>{item.submitted_by}</strong></span>
        <span style={{ fontFamily: 'var(--d-font-mono, monospace)' }}>v{item.content.version}</span>
      </div>

      {error && <p className="text-sm mb-2" style={{ color: 'var(--d-error)' }}>{error}</p>}

      {/* Reject reason textarea */}
      {showReject && (
        <div className="mb-3">
          <textarea
            className="d-control"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection..."
            style={{ minHeight: '4rem' }}
          />
        </div>
      )}

      {/* Actions */}
      {item.status === 'pending' && (
        <div className="flex items-center gap-2">
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={handleApprove}
            disabled={loading === 'approve'}
            style={{ fontSize: '0.8125rem', color: 'var(--d-success)' }}
          >
            {loading === 'approve' ? 'Approving...' : 'Approve'}
          </button>
          {!showReject ? (
            <button
              className="d-interactive"
              data-variant="ghost"
              onClick={() => setShowReject(true)}
              style={{ fontSize: '0.8125rem', color: 'var(--d-error)' }}
            >
              Reject
            </button>
          ) : (
            <button
              className="d-interactive"
              data-variant="ghost"
              onClick={handleReject}
              disabled={loading === 'reject'}
              style={{ fontSize: '0.8125rem', color: 'var(--d-error)' }}
            >
              {loading === 'reject' ? 'Rejecting...' : 'Confirm Reject'}
            </button>
          )}
          <Link
            href={`/admin/moderation/${item.id}`}
            className="d-interactive"
            data-variant="ghost"
            style={{ fontSize: '0.8125rem', textDecoration: 'none', marginLeft: 'auto' }}
          >
            Details
          </Link>
        </div>
      )}

      {item.status === 'rejected' && item.rejection_reason && (
        <p className="text-sm" style={{ color: 'var(--d-text-muted)', fontStyle: 'italic' }}>
          Rejected: {item.rejection_reason}
        </p>
      )}
    </div>
  );
}
