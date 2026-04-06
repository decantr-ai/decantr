# Section: Cap Table

**Shell:** sidebar-main
**Role:** auxiliary
**Zone:** App

## Routes
- `/cap-table` — CapTablePage (share classes + shareholder registry)
- `/cap-table/:id` — ShareClassDetailPage (single share class details)

## Patterns
- share-bar (horizontal allocation), donut-chart, data-table (share classes), data-table (shareholders with vesting bars)

## Visual Brief
Two-column layout: left has share class distribution bar + legend, right has donut chart with total shares center label. Below: share classes table (name with color dot, type, authorised, issued, price, voting rights pill, liquidation preference). Shareholder registry table with avatar, name, class, shares, ownership %, invested, current value, vesting progress bar.
