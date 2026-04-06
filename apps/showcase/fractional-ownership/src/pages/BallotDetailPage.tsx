import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { ballots } from '@/data/mock';

export function BallotDetailPage() {
  const { id } = useParams();
  const ballot = ballots.find(b => b.id === id) ?? ballots[0];
  const totalVotes = ballot.votesFor + ballot.votesAgainst + ballot.votesAbstain;
  const forPct = totalVotes > 0 ? (ballot.votesFor / totalVotes) * 100 : 0;
  const againstPct = totalVotes > 0 ? (ballot.votesAgainst / totalVotes) * 100 : 0;
  const abstainPct = totalVotes > 0 ? (ballot.votesAbstain / totalVotes) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '48rem' }}>
      <Link to="/governance" className="d-interactive" data-variant="ghost" style={{ alignSelf: 'flex-start', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
        <ArrowLeft size={14} /> Back to ballots
      </Link>

      <PageHeader
        title={ballot.title}
        description={ballot.description}
        actions={
          <span className="fo-pill" data-status={ballot.status === 'passed' ? 'active' : ballot.status === 'rejected' ? 'rejected' : ballot.status === 'active' ? 'pending' : 'closed'}>
            {ballot.status}
          </span>
        }
      />

      {/* Ballot metadata */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--d-content-gap)' }}>
        {[
          { label: 'Category', value: ballot.category },
          { label: 'Proposer', value: ballot.proposer },
          { label: 'Quorum Required', value: `${ballot.quorum}%` },
          { label: 'Deadline', value: ballot.deadline },
        ].map(k => (
          <div key={k.label} className="fo-card" style={{ padding: 'var(--d-surface-p)' }}>
            <div className="d-label" style={{ marginBottom: '0.25rem' }}>{k.label}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500, textTransform: 'capitalize' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Vote breakdown */}
      {totalVotes > 0 ? (
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '1rem' }}>Vote Breakdown</SectionLabel>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {[
              { label: 'For', pct: forPct, color: 'var(--d-success)', votes: ballot.votesFor },
              { label: 'Against', pct: againstPct, color: 'var(--d-error)', votes: ballot.votesAgainst },
              { label: 'Abstain', pct: abstainPct, color: 'var(--d-text-muted)', votes: ballot.votesAbstain },
            ].map(v => (
              <div key={v.label} style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{v.label}</span>
                  <span className="fo-mono" style={{ fontSize: '0.8rem', color: v.color }}>{v.pct.toFixed(1)}%</span>
                </div>
                <div className="fo-ballot-progress" style={{ height: 6 }}>
                  <div className="fo-ballot-fill" style={{ width: `${v.pct}%`, background: v.color }} />
                </div>
                <div className="fo-mono" style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
                  {(v.votes / 1_000_000).toFixed(1)}M votes
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--d-border)', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--d-text-muted)' }}>Total votes: {(totalVotes / 1_000_000).toFixed(1)}M</span>
            <span style={{ color: forPct >= ballot.quorum ? 'var(--d-success)' : 'var(--d-warning)' }}>
              Quorum: {forPct >= ballot.quorum ? 'Reached' : 'Not reached'}
            </span>
          </div>
        </div>
      ) : (
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)', textAlign: 'center' }}>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.9rem' }}>Voting has not started yet.</p>
        </div>
      )}

      {/* Cast vote */}
      {(ballot.status === 'active') && (
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '1rem' }}>Cast Your Vote</SectionLabel>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="fo-button-primary" style={{ flex: 1, justifyContent: 'center' }}>Vote For</button>
            <button className="d-interactive" data-variant="danger" style={{ flex: 1, justifyContent: 'center' }}>Vote Against</button>
            <button className="d-interactive" style={{ flex: 1, justifyContent: 'center' }}>Abstain</button>
          </div>
        </div>
      )}
    </div>
  );
}
