import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { ballots } from '@/data/mock';

export function GovernancePage() {
  const active = ballots.filter(b => b.status === 'active' || b.status === 'pending');
  const closed = ballots.filter(b => b.status === 'passed' || b.status === 'rejected');

  function BallotCard({ ballot }: { ballot: typeof ballots[0] }) {
    const totalVotes = ballot.votesFor + ballot.votesAgainst + ballot.votesAbstain;
    const forPct = totalVotes > 0 ? (ballot.votesFor / totalVotes) * 100 : 0;
    const againstPct = totalVotes > 0 ? (ballot.votesAgainst / totalVotes) * 100 : 0;

    return (
      <Link to={`/governance/${ballot.id}`} className="fo-card" style={{ padding: 'var(--d-surface-p)', textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>{ballot.title}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', lineHeight: 1.5 }}>{ballot.description}</p>
          </div>
          <span className="fo-pill" data-status={ballot.status === 'passed' ? 'active' : ballot.status === 'rejected' ? 'rejected' : ballot.status === 'active' ? 'pending' : 'closed'}>
            {ballot.status}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
          <span className="d-label">{ballot.category}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>Quorum: {ballot.quorum}%</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>Deadline: {ballot.deadline}</span>
        </div>
        {totalVotes > 0 && (
          <div style={{ marginTop: '0.75rem' }}>
            <div className="fo-ballot-progress">
              <div className="fo-ballot-fill" style={{ width: `${forPct}%`, background: 'var(--d-success)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem', fontSize: '0.7rem' }}>
              <span style={{ color: 'var(--d-success)' }}>For: {forPct.toFixed(1)}%</span>
              <span style={{ color: 'var(--d-error)' }}>Against: {againstPct.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </Link>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title="Governance" description="Vote on distributions, acquisitions, and operational decisions." />

      {active.length > 0 && (
        <div>
          <div className="d-label" style={{ marginBottom: '0.75rem', borderLeft: '2px solid var(--d-warning)', paddingLeft: '0.5rem' }}>
            Active & Pending ({active.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
            {active.map(b => <BallotCard key={b.id} ballot={b} />)}
          </div>
        </div>
      )}

      {closed.length > 0 && (
        <div>
          <div className="d-label" style={{ marginBottom: '0.75rem', borderLeft: '2px solid var(--d-text-muted)', paddingLeft: '0.5rem' }}>
            Closed ({closed.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
            {closed.map(b => <BallotCard key={b.id} ballot={b} />)}
          </div>
        </div>
      )}
    </div>
  );
}
