# Section: Markets (Order Book + Trades)

**Shell:** sidebar-main
**Role:** auxiliary
**Zone:** App

## Routes
- `/order-book` — OrderBookPage (bid/ask depth + recent trades)
- `/trades` — TradesPage (full trade history table)
- `/trades/:id` — TradeDetailPage (single trade details)

## Patterns
- order-book (two-column bid/ask with depth bars), kpi-grid (mid price, spread, volumes), trade-table, trade-detail

## Visual Brief
Order book has two-column layout: bids (green tinted depth bars) on left, asks (red tinted depth bars) on right. Each row shows price, shares, total with background bar proportional to volume. Trade history is a standard data table with side pills (buy=green, sell=blue), status pills, counterparty.
