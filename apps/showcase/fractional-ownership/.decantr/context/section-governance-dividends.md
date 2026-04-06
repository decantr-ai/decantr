# Section: Governance & Dividends

**Shell:** sidebar-main
**Role:** auxiliary
**Zone:** App

## Routes
- `/governance` — GovernancePage (ballot list, active + closed)
- `/governance/:id` — BallotDetailPage (single ballot with vote breakdown + cast vote)
- `/dividends` — DividendsPage (dividend ledger with chart)

## Patterns
- ballot-card (title, description, status, category, quorum, deadline, progress bar), vote-breakdown (for/against/abstain bars), cast-vote-panel, kpi-grid, bar-chart (quarterly dividends), data-table (dividend ledger)

## Visual Brief
Governance page groups ballots into Active/Pending and Closed sections. Each ballot card shows progress bar (green fill for "for" votes). Detail page has full vote breakdown with three progress bars. Cast vote section with three buttons. Dividends page has KPI row, quarterly bar chart, and full ledger table with alternating row backgrounds.
