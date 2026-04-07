export default function PublicLoading() {
  return (
    <div className="flex items-center justify-center" style={{ padding: '4rem', minHeight: '50vh' }}>
      <div className="flex flex-col items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--d-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
        <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>Loading...</span>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
