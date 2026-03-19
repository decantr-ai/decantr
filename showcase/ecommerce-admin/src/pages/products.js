import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, DataTable, Input, Select, Separator, Statistic, icon } from 'decantr/components';
import { navigate } from 'decantr/router';
import { products } from '../data/mock.js';

const { div, span, h2 } = tags;

// ─── KPI computations ────────────────────────────────────────────
const totalProducts = products.length;
const activeCount = products.filter(p => p.status === 'active').length;
const outOfStock = products.filter(p => p.status === 'out-of-stock').length;

const kpis = [
  { label: 'Total Products', value: totalProducts, ic: 'package', trend: 'up', trendValue: '+3' },
  { label: 'Active', value: activeCount, ic: 'check-circle', trend: 'up', trendValue: `${Math.round(activeCount / totalProducts * 100)}%` },
  { label: 'Out of Stock', value: outOfStock, ic: 'alert-circle', trend: 'down', trendValue: outOfStock > 0 ? 'Needs attention' : 'All clear' },
];

// ─── Status badge renderer ───────────────────────────────────────
function statusBadge(status) {
  const map = {
    'active': { label: 'Active', variant: 'success' },
    'low-stock': { label: 'Low Stock', variant: 'warning' },
    'out-of-stock': { label: 'Out of Stock', variant: 'error' },
  };
  const cfg = map[status] || { label: status, variant: 'default' };
  return Badge({ variant: cfg.variant }, cfg.label);
}

// ─── KPI Grid ────────────────────────────────────────────────────
function KpiGrid() {
  return div({ class: css('_grid _gc1 _sm:gc3 _gap4 d-stagger-scale') },
    ...kpis.map(kpi =>
      Statistic({
        label: kpi.label,
        value: kpi.value,
        trend: kpi.trend,
        trendValue: kpi.trendValue,
        animate: 1200,
        class: css('d-glass'),
      })
    )
  );
}

// ─── Toolbar ─────────────────────────────────────────────────────
function Toolbar() {
  return div({ class: css('_flex _wrap _aic _gap3') },
    div({ class: css('_flex1 _minw[200px]') },
      Input({ placeholder: 'Search products...', prefix: icon('search', { size: '1em' }) })
    ),
    Select({ value: 'all', options: [
      { label: 'All Categories', value: 'all' },
      { label: 'Electronics', value: 'Electronics' },
      { label: 'Clothing', value: 'Clothing' },
      { label: 'Home & Kitchen', value: 'Home & Kitchen' },
      { label: 'Sports', value: 'Sports' },
    ] }),
    Separator({ orientation: 'vertical', class: css('_h6') }),
    Button({ variant: 'outline', size: 'sm' },
      icon('download', { size: '1em' }),
      span({}, 'Export')
    ),
    Button({ size: 'sm', onclick: () => navigate('/products/new') },
      icon('plus', { size: '1em' }),
      span({}, 'Add Product')
    )
  );
}

// ─── Products Table ──────────────────────────────────────────────
function ProductsTable() {
  return Card({ class: css('d-glass') },
    Card.Header({},
      span({ class: css('d-gradient-text _textsm _bold') }, 'Product Catalog')
    ),
    Card.Body({ class: css('_p0') },
      DataTable({
        columns: [
          { key: 'name', label: 'Product', sortable: true, render: (val, row) =>
            div({ class: css('_flex _aic _gap2') },
              div({ class: css('_w8 _h8 _r2 _bgmuted _flex _center') },
                icon('package', { size: '1em', class: css('_fgmuted') })
              ),
              div({ class: css('_flex _col') },
                span({ class: css('_textsm _medium') }, val),
                span({ class: css('_textxs _fgmuted') }, row.category)
              )
            )
          },
          { key: 'category', label: 'Category', sortable: true },
          { key: 'price', label: 'Price', sortable: true, align: 'right', render: val => span({}, `$${val.toFixed(2)}`) },
          { key: 'stock', label: 'Stock', sortable: true, align: 'right' },
          { key: 'status', label: 'Status', sortable: true, render: val => statusBadge(val) },
          { key: 'sku', label: 'SKU', render: val => span({ class: css('_textxs _fgmuted _font[monospace]') }, val) },
        ],
        data: products,
        pagination: { pageSize: 10 },
        hoverable: true,
        striped: true,
        stickyHeader: true,
        rowKey: (row) => row.id,
      })
    )
  );
}

// ─── Page ────────────────────────────────────────────────────────
export default function ProductsPage() {
  onMount(() => { document.title = 'Products — eCommerce Admin'; });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('d-gradient-text _heading4 _bold') }, 'Products'),
      span({ class: css('_textxs _fgmuted') }, `${totalProducts} items`)
    ),
    KpiGrid(),
    Toolbar(),
    ProductsTable()
  );
}
