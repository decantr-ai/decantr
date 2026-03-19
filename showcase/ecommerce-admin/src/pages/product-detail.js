import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, Chip, Input, Select, Textarea, icon } from 'decantr/components';
import { useRoute, navigate } from 'decantr/router';
import { products } from '../data/mock.js';

const { div, span, h2, h3 } = tags;

// ─── Status badge ────────────────────────────────────────────────
function statusBadge(status) {
  const map = {
    'active': { label: 'Active', variant: 'success' },
    'low-stock': { label: 'Low Stock', variant: 'warning' },
    'out-of-stock': { label: 'Out of Stock', variant: 'error' },
  };
  const cfg = map[status] || { label: status, variant: 'default' };
  return Badge({ variant: cfg.variant }, cfg.label);
}

// ─── Detail Header ───────────────────────────────────────────────
function DetailHeader(product) {
  return Card({ class: css('d-glass') },
    Card.Body({ class: css('_flex _wrap _aic _jcsb _gap4') },
      div({ class: css('_flex _aic _gap4') },
        div({ class: css('_w12 _h12 _r3 _bgmuted _flex _center') },
          icon('package', { size: '1.5em', class: css('_fgprimary') })
        ),
        div({ class: css('_flex _col _gap1') },
          h2({ class: css('d-gradient-text _heading4 _bold') }, product.name),
          div({ class: css('_flex _aic _gap2') },
            Chip({ label: product.category, size: 'sm' }),
            statusBadge(product.status),
            span({ class: css('_textsm _fgmuted') }, `SKU: ${product.sku}`)
          )
        )
      ),
      div({ class: css('_flex _col _aic') },
        span({ class: css('_text2xl _bold _fgprimary') }, `$${product.price.toFixed(2)}`),
        span({ class: css('_textxs _fgmuted') }, `${product.stock} in stock`)
      )
    )
  );
}

// ─── Media Gallery ───────────────────────────────────────────────
function MediaGallery() {
  return Card({ class: css('d-glass') },
    Card.Header({},
      span({ class: css('d-gradient-text _textsm _bold') }, 'Product Images')
    ),
    Card.Body({},
      div({ class: css('_grid _gc2 _gap3 d-stagger') },
        ...[1, 2, 3, 4].map(i =>
          div({ class: css('_arsq _r3 _bgmuted _flex _center _b1 _bcborder _trans _h:bcprimary') },
            div({ class: css('_flex _col _aic _gap1') },
              icon('image', { size: '1.5em', class: css('_fgmuted') }),
              span({ class: css('_textxs _fgmuted') }, `Image ${i}`)
            )
          )
        )
      ),
      div({ class: css('_mt3') },
        Button({ variant: 'outline', size: 'sm', class: css('_wfull') },
          icon('upload', { size: '1em' }),
          span({}, 'Upload Image')
        )
      )
    )
  );
}

// ─── Product Form ────────────────────────────────────────────────
function ProductForm(product) {
  return Card({ class: css('d-glass') },
    Card.Header({},
      span({ class: css('d-gradient-text _textsm _bold') }, 'Product Details')
    ),
    Card.Body({},
      div({ class: css('_flex _col _gap4 d-stagger') },
        div({ class: css('_flex _col _gap1') },
          span({ class: css('_label') }, 'Product Name'),
          Input({ value: product.name, placeholder: 'Enter product name' })
        ),
        div({ class: css('_flex _col _gap1') },
          span({ class: css('_label') }, 'Description'),
          Textarea({ rows: 3, placeholder: 'Enter product description...' })
        ),
        div({ class: css('_grid _gc1 _sm:gc2 _gap4') },
          div({ class: css('_flex _col _gap1') },
            span({ class: css('_label') }, 'Price'),
            Input({ type: 'number', value: String(product.price), prefix: span({}, '$') })
          ),
          div({ class: css('_flex _col _gap1') },
            span({ class: css('_label') }, 'Category'),
            Select({ value: product.category, options: [
              { label: 'Electronics', value: 'Electronics' },
              { label: 'Clothing', value: 'Clothing' },
              { label: 'Home & Kitchen', value: 'Home & Kitchen' },
              { label: 'Sports', value: 'Sports' },
            ] })
          )
        ),
        div({ class: css('_grid _gc1 _sm:gc2 _gap4') },
          div({ class: css('_flex _col _gap1') },
            span({ class: css('_label') }, 'SKU'),
            Input({ value: product.sku, placeholder: 'SKU code' })
          ),
          div({ class: css('_flex _col _gap1') },
            span({ class: css('_label') }, 'Stock Quantity'),
            Input({ type: 'number', value: String(product.stock) })
          )
        ),
        div({ class: css('_flex _col _gap1') },
          span({ class: css('_label') }, 'Status'),
          Select({ value: product.status, options: [
            { label: 'Active', value: 'active' },
            { label: 'Low Stock', value: 'low-stock' },
            { label: 'Out of Stock', value: 'out-of-stock' },
          ] })
        )
      )
    ),
    Card.Footer({ class: css('_flex _jcfe _gap2') },
      Button({ variant: 'outline', onclick: () => navigate('/products') }, 'Cancel'),
      Button({}, icon('save', { size: '1em' }), span({}, 'Save Changes'))
    )
  );
}

// ─── Page ────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  onMount(() => { document.title = 'Product Detail — eCommerce Admin'; });

  const route = useRoute();
  const productId = route().params?.id;
  const product = products.find(p => p.id === productId) || products[0];

  return div({ class: css('d-page-enter _flex _col _gap4') },
    div({ class: css('_flex _aic _gap2 _mb1') },
      Button({ variant: 'ghost', size: 'sm', onclick: () => navigate('/products') },
        icon('arrow-left', { size: '1em' }),
        span({}, 'Back to Products')
      )
    ),
    DetailHeader(product),
    div({ class: css('_grid _gc1 _md:gc3 _gap4') },
      div({ class: css('_span1') }, MediaGallery()),
      div({ class: css('_span1 _md:span2') }, ProductForm(product))
    )
  );
}
