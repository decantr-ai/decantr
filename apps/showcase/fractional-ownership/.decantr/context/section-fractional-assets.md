# Section: Fractional Assets

**Shell:** sidebar-main
**Role:** auxiliary
**Zone:** App

## Routes
- `/assets` — AssetsPage (table of all assets)
- `/assets/:id` — AssetDetailPage (single asset with valuation chart)

## Patterns
- data-table (assets), detail-header, kpi-grid, valuation-chart (confidence bands), sparkline, dividend-list, order-book-snapshot

## Visual Brief
Data table with asset name, type, valuation, price/share, return, IRR, sparkline trend, status pill. Detail page shows full KPI row, valuation chart with confidence band, trend sparkline, asset-specific dividends, and order book snapshot.
