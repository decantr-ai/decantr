import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, DataTable, Statistic, icon } from 'decantr/components';
import { orders, customers } from '../data/mock.js';

const { div, span, h2, h3 } = tags;

// ─── Mock order detail ──────────────────────────────────────────
const order = orders[2]; // ORD-1003
const customer = customers.find(c => c.name === order.customer) || customers[2];
const orderItems = [
  { name: 'Wireless Bluetooth Headphones', qty: 2, price: 79.99 },
  { name: 'Organic Cotton T-Shirt', qty: 1, price: 34.99 },
  { name: 'Stainless Steel Water Bottle', qty: 1, price: 24.99 },
  { name: 'Bamboo Cutting Board', qty: 1, price: 19.99 },
];
const subtotal = orderItems.reduce((s, i) => s + i.qty * i.price, 0);
const shipping = 12.99;
const tax = +(subtotal * 0.08).toFixed(2);
const total = +(subtotal + shipping + tax).toFixed(2);

const timelineEvents = [
  { step: 'Placed', time: 'Mar 17, 10:24 AM', done: true, ic: 'shopping-cart' },
  { step: 'Confirmed', time: 'Mar 17, 10:26 AM', done: true, ic: 'check-circle' },
  { step: 'Packed', time: 'Mar 17, 2:15 PM', done: true, ic: 'package' },
  { step: 'Shipped', time: 'Pending', done: false, ic: 'truck' },
  { step: 'Delivered', time: 'Pending', done: false, ic: 'home' },
];

const customerOrders = orders
  .filter(o => o.customer === order.customer && o.id !== order.id)
  .slice(0, 5);

const statusVariant = s =>
  s === 'delivered' ? 'success' : s === 'shipped' ? 'info' :
  s === 'processing' ? 'warning' : s === 'cancelled' ? 'error' : 'default';

// ─── Detail Header ──────────────────────────────────────────────
function DetailHeader() {
  return Card({ class: css('d-glass d-mesh') },
    Card.Body({ class: css('_flex _gap6 _aic _p6 _flexWrap') },
      div({ class: css('_flex _col _gap2 _flex1') },
        div({ class: css('_flex _aic _gap3') },
          h2({ class: css('d-gradient-text _heading4 _bold') }, order.id),
          Badge({ variant: statusVariant(order.status), size: 'sm' }, order.status)
        ),
        div({ class: css('_flex _gap4 _flexWrap') },
          span({ class: css('_textsm _fgmuted _flex _aic _gap1') }, icon('user', { size: '1em' }), ` ${order.customer}`),
          span({ class: css('_textsm _fgmuted _flex _aic _gap1') }, icon('mail', { size: '1em' }), ` ${order.email}`),
          span({ class: css('_textsm _fgmuted _flex _aic _gap1') }, icon('calendar', { size: '1em' }), ` ${order.date}`),
          span({ class: css('_textsm _fgmuted _flex _aic _gap1') }, icon('credit-card', { size: '1em' }), ` ${order.payment}`)
        )
      ),
      div({ class: css('_flex _col _aic _gap1') },
        span({ class: css('_textxs _fgmuted _uppercase') }, 'Total'),
        span({ class: css('d-gradient-text _heading3 _bold') }, `$${total.toFixed(2)}`)
      ),
      div({ class: css('_flex _gap2') },
        Button({ variant: 'primary', size: 'sm' }, icon('printer', { size: '1em' }), ' Invoice'),
        Button({ variant: 'ghost', size: 'sm' }, icon('more-horizontal', { size: '1em' }))
      )
    )
  );
}

// ─── Timeline ───────────────────────────────────────────────────
function Timeline() {
  return Card({ class: css('d-glass') },
    Card.Header({},
      span({ class: css('d-gradient-text _textsm _bold') }, 'Order Lifecycle')
    ),
    Card.Body({},
      div({ class: css('_flex _col _gap1 d-stagger') },
        ...timelineEvents.map((evt, i) =>
          div({ class: css('_flex _gap3 _py3 _borderB') },
            div({ class: css('_flex _col _aic _gap1 _w10') },
              div({ class: css(`_flex _center _w8 _h8 _r2 ${evt.done ? '_bgprimary/20' : '_bgmuted/20'}`) },
                icon(evt.ic, { size: '1em', class: css(evt.done ? '_fgprimary' : '_fgmuted') })
              ),
              i < timelineEvents.length - 1
                ? div({ class: css(`_flex1 _w[2px] ${evt.done ? '_bgprimary/40' : '_bcborder'}`) })
                : null
            ),
            div({ class: css('_flex _col _gap1 _flex1') },
              div({ class: css('_flex _aic _jcsb') },
                h3({ class: css(`_textsm _bold ${evt.done ? '' : '_fgmuted'}`) }, evt.step),
                Badge({ variant: evt.done ? 'success' : 'default', size: 'sm' }, evt.done ? 'Complete' : 'Pending')
              ),
              span({ class: css('_textxs _fgmuted') }, evt.time)
            )
          )
        )
      )
    )
  );
}

// ─── Detail Panel ───────────────────────────────────────────────
function DetailPanel() {
  return Card({ class: css('d-glass') },
    Card.Header({},
      span({ class: css('d-gradient-text _textsm _bold') }, 'Order Summary')
    ),
    Card.Body({},
      div({ class: css('_flex _col _gap3') },
        ...orderItems.map(item =>
          div({ class: css('_flex _jcsb _aic _py2 _borderB') },
            div({ class: css('_flex _col') },
              span({ class: css('_textsm _medium') }, item.name),
              span({ class: css('_textxs _fgmuted') }, `Qty: ${item.qty}`)
            ),
            span({ class: css('_textsm _bold') }, `$${(item.qty * item.price).toFixed(2)}`)
          )
        ),
        div({ class: css('_flex _jcsb _pt3') },
          span({ class: css('_textsm _fgmuted') }, 'Subtotal'),
          span({ class: css('_textsm') }, `$${subtotal.toFixed(2)}`)
        ),
        div({ class: css('_flex _jcsb') },
          span({ class: css('_textsm _fgmuted') }, 'Shipping'),
          span({ class: css('_textsm') }, `$${shipping.toFixed(2)}`)
        ),
        div({ class: css('_flex _jcsb') },
          span({ class: css('_textsm _fgmuted') }, 'Tax (8%)'),
          span({ class: css('_textsm') }, `$${tax.toFixed(2)}`)
        ),
        div({ class: css('_flex _jcsb _pt3 _borderT') },
          span({ class: css('_textsm _bold') }, 'Total'),
          span({ class: css('d-gradient-text _bold') }, `$${total.toFixed(2)}`)
        )
      )
    )
  );
}

// ─── Order History ──────────────────────────────────────────────
function OrderHistory() {
  const columns = [
    { key: 'id', label: 'Order ID', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'items', label: 'Items' },
    { key: 'total', label: 'Total', sortable: true },
    { key: 'status', label: 'Status' },
  ];
  const data = customerOrders.map(o => ({
    ...o,
    total: `$${o.total.toFixed(2)}`,
    status: Badge({ variant: statusVariant(o.status), size: 'sm' }, o.status),
  }));

  return Card({ class: css('d-glass') },
    Card.Header({},
      span({ class: css('d-gradient-text _textsm _bold') }, `Previous Orders from ${order.customer}`),
      span({ class: css('_textxs _fgmuted') }, `${customerOrders.length} orders`)
    ),
    Card.Body({},
      DataTable({ columns, data, sortable: true, paginate: true, pageSize: 5 })
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function OrderDetailPage() {
  onMount(() => { document.title = `${order.id} — eCommerce Admin`; });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    DetailHeader(),
    div({ class: css('_grid _gc1 _lg:gc3 _gap4') },
      div({ class: css('_span1 _lg:span2') }, Timeline()),
      DetailPanel()
    ),
    OrderHistory()
  );
}
