import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, DataTable, Input, Progress, Select, Statistic, icon } from 'decantr/components';
import { inventory } from '../data/mock.js';

const { div, span, h2 } = tags;

const totalItems = inventory.reduce((s, i) => s + i.stock, 0);
const lowStock = inventory.filter(i => i.stock > 0 && i.stock < i.reorderPoint).length;
const outOfStock = inventory.filter(i => i.stock === 0).length;
const warehouses = 3;

const stockStatus = (item) =>
  item.stock === 0 ? 'out-of-stock' :
  item.stock < item.reorderPoint ? 'low' : 'ok';

const stockVariant = (item) =>
  item.stock === 0 ? 'error' :
  item.stock < item.reorderPoint ? 'warning' : 'success';

const restockNeeded = inventory
  .filter(i => i.stock < i.reorderPoint)
  .sort((a, b) => a.stock - b.stock)
  .slice(0, 4);

// ─── KPI Grid ───────────────────────────────────────────────────
function KpiGrid() {
  return div({ class: css('_flex _col _gap4') },
    h2({ class: css('d-gradient-text _heading5 _bold') }, 'Inventory Overview'),
    div({ class: css('_grid _gc1 _sm:gc2 _lg:gc4 _gap4 d-stagger-scale') },
      Statistic({ label: 'Total Items', value: totalItems, animate: true, class: css('d-glass') }),
      Statistic({ label: 'Low Stock', value: lowStock, trend: lowStock > 0 ? 'down' : 'up', trendValue: lowStock > 0 ? 'Needs attention' : 'OK', animate: true, class: css('d-glass') }),
      Statistic({ label: 'Out of Stock', value: outOfStock, trend: outOfStock > 0 ? 'down' : 'up', trendValue: outOfStock > 0 ? 'Action required' : 'Clear', animate: true, class: css('d-glass') }),
      Statistic({ label: 'Warehouses', value: warehouses, animate: true, class: css('d-glass') }),
    )
  );
}

// ─── Filter Bar ─────────────────────────────────────────────────
function FilterBar() {
  const [search, setSearch] = createSignal('');
  const [warehouse, setWarehouse] = createSignal('all');
  const [status, setStatus] = createSignal('all');

  return div({ class: css('_flex _gap3 _aic _flexWrap') },
    Input({ placeholder: 'Search inventory...', value: search, onchange: e => setSearch(e.target.value), class: css('_w[240px]') }),
    Select({ value: warehouse, onchange: v => setWarehouse(v), options: [
      { label: 'All Warehouses', value: 'all' },
      { label: 'West', value: 'West' },
      { label: 'East', value: 'East' },
      { label: 'Central', value: 'Central' },
    ] }),
    Select({ value: status, onchange: v => setStatus(v), options: [
      { label: 'All Status', value: 'all' },
      { label: 'In Stock', value: 'ok' },
      { label: 'Low Stock', value: 'low' },
      { label: 'Out of Stock', value: 'out-of-stock' },
    ] }),
    div({ class: css('_flex1') }),
    Button({ variant: 'primary', size: 'sm' }, icon('plus', { size: '1em' }), ' Add Item')
  );
}

// ─── Inventory Table ────────────────────────────────────────────
function InventoryTable() {
  const columns = [
    { key: 'name', label: 'Product', sortable: true },
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'stock', label: 'Stock', sortable: true },
    { key: 'reorderPoint', label: 'Reorder Point' },
    { key: 'warehouse', label: 'Warehouse', sortable: true },
    { key: 'lastRestocked', label: 'Last Restocked', sortable: true },
    { key: 'stockStatus', label: 'Status' },
  ];

  const data = inventory.map(item => ({
    ...item,
    stockStatus: Badge({
      variant: stockVariant(item),
      size: 'sm'
    }, stockStatus(item) === 'out-of-stock' ? 'Out of Stock' : stockStatus(item) === 'low' ? 'Low Stock' : 'In Stock'),
  }));

  return Card({ class: css('d-glass') },
    Card.Header({},
      span({ class: css('d-gradient-text _textsm _bold') }, 'Inventory Items'),
      span({ class: css('_textxs _fgmuted') }, `${inventory.length} products`)
    ),
    Card.Body({},
      DataTable({ columns, data, sortable: true, paginate: true, pageSize: 10 })
    ),
    Card.Footer({},
      span({ class: css('_textxs _fgmuted') }, 'Last sync: ' + new Date().toLocaleTimeString()),
      Button({ variant: 'ghost', size: 'sm' }, icon('download', { size: '1em' }), ' Export')
    )
  );
}

// ─── Goal Tracker ───────────────────────────────────────────────
function GoalTracker() {
  return Card({ class: css('d-glass') },
    Card.Header({},
      span({ class: css('d-gradient-text _textsm _bold') }, 'Restock Goals'),
      Badge({ variant: 'warning', size: 'sm' }, `${restockNeeded.length} items`)
    ),
    Card.Body({},
      div({ class: css('_flex _col _gap4 d-stagger-up') },
        ...restockNeeded.map(item => {
          const pct = Math.round((item.stock / item.reorderPoint) * 100);
          return Card({ class: css('d-glass'), hover: true },
            Card.Body({ class: css('_flex _col _gap2 _p3') },
              div({ class: css('_flex _jcsb _aic') },
                span({ class: css('_textsm _medium') }, item.name),
                Badge({ variant: stockVariant(item), size: 'sm' },
                  item.stock === 0 ? 'Critical' : 'Low')
              ),
              div({ class: css('_flex _jcsb _textxs _fgmuted') },
                span({}, `${item.stock} / ${item.reorderPoint} units`),
                span({}, `${pct}%`)
              ),
              Progress({ value: pct, variant: item.stock === 0 ? 'error' : 'warning', size: 'sm' }),
              span({ class: css('_textxs _fgmuted') }, `Reorder qty: ${item.reorderQty} — ${item.warehouse} warehouse`)
            )
          );
        })
      )
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function InventoryPage() {
  onMount(() => { document.title = 'Inventory — eCommerce Admin'; });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    KpiGrid(),
    FilterBar(),
    div({ class: css('_grid _gc1 _lg:gc3 _gap4') },
      div({ class: css('_span1 _lg:span2') }, InventoryTable()),
      GoalTracker()
    )
  );
}
