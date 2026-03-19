import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, Chip, Input, Tabs, icon } from 'decantr/components';
import { tickets } from '../data/mock.js';

const { div, span, h2, p } = tags;

const priorityColor = { high: '_bgerror', medium: '_bgwarning', low: '_bgsuccess' };
const statusVariant = { open: 'error', pending: 'warning', resolved: 'success' };
const priorityVariant = { high: 'error', medium: 'warning', low: 'success' };

// ─── Ticket List Item ──────────────────────────────────────────
function TicketItem(ticket, selected, onSelect) {
  const isActive = () => selected() === ticket.id;

  return div({
    class: () => css(`_flex _gap3 _p3 _r2 _cursor[pointer] _trans ${isActive() ? '_bgprimary/10 _bcprimary/30 _b1' : '_bgbg/50'}`),
    onclick: () => onSelect(ticket.id),
  },
    div({ class: css('_flex _col _center _shrink0 _pt1') },
      div({ class: css(`_w[8px] _h[8px] _rfull ${priorityColor[ticket.priority]}`) })
    ),
    div({ class: css('_flex _col _gap1 _flex1 _overflow[hidden]') },
      div({ class: css('_flex _aic _jcsb _gap2') },
        span({ class: css('_textsm _bold _truncate') }, ticket.subject),
        span({ class: css('_textxs _fgmuted _shrink0') }, ticket.created),
      ),
      div({ class: css('_flex _aic _gap2') },
        span({ class: css('_textxs _fgmuted') }, ticket.customer),
        Chip({ size: 'sm' }, ticket.category)
      )
    )
  );
}

// ─── Ticket Detail ─────────────────────────────────────────────
function TicketDetail(selected) {
  const ticket = () => tickets.find(t => t.id === selected());

  return Card({ class: css('d-glass _flex _col _flex1') },
    Card.Header({ class: css('_flex _col _gap3') },
      () => ticket()
        ? div({ class: css('_flex _col _gap3') },
            span({ class: css('_heading6 _bold') }, ticket().subject),
            div({ class: css('_flex _aic _gap3 _flexWrap') },
              div({ class: css('_flex _aic _gap2') },
                icon('user', { size: '1em', class: css('_fgmuted') }),
                span({ class: css('_textsm') }, ticket().customer)
              ),
              div({ class: css('_flex _aic _gap2') },
                icon('tag', { size: '1em', class: css('_fgmuted') }),
                span({ class: css('_textsm') }, ticket().id)
              ),
              Badge({ variant: statusVariant[ticket().status], size: 'sm' }, ticket().status),
              Badge({ variant: priorityVariant[ticket().priority], size: 'sm' }, ticket().priority)
            )
          )
        : span({ class: css('_fgmuted') }, 'Select a ticket')
    ),
    Card.Body({ class: css('_flex _col _gap4 _flex1') },
      () => ticket()
        ? div({ class: css('_flex _col _gap4') },
            p({ class: css('_textsm _leading[1.7]') }, ticket().body),
            div({ class: css('_flex _gap2 _flexWrap') },
              Button({ variant: 'primary', size: 'sm' }, icon('reply', { size: '1em' }), ' Reply'),
              Button({ variant: 'outline', size: 'sm' }, icon('external-link', { size: '1em' }), ' Escalate'),
              Button({ variant: 'outline', size: 'sm' }, icon('check-circle', { size: '1em' }), ' Resolve'),
              Button({ variant: 'ghost', size: 'sm' }, icon('x-circle', { size: '1em' }), ' Close')
            )
          )
        : div({ class: css('_flex _center _flex1 _fgmuted _textsm') },
            span({}, 'Choose a ticket from the list to view details.')
          )
    )
  );
}

// ─── Page ──────────────────────────────────────────────────────
export default function SupportPage() {
  const [selected, setSelected] = createSignal(tickets[0].id);
  const [search, setSearch] = createSignal('');
  const [filter, setFilter] = createSignal('all');
  onMount(() => { document.title = 'Support — eCommerce Admin'; });

  const filtered = () => {
    let list = tickets;
    if (filter() !== 'all') list = list.filter(t => t.status === filter());
    const q = search().toLowerCase();
    if (q) list = list.filter(t => t.subject.toLowerCase().includes(q) || t.customer.toLowerCase().includes(q));
    return list;
  };

  const openCount = tickets.filter(t => t.status === 'open').length;

  return div({ class: css('d-page-enter _flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      div({ class: css('_flex _aic _gap3') },
        h2({ class: css('d-gradient-text _heading5') }, 'Support'),
        Badge({ variant: 'error', size: 'sm' }, `${openCount} open`)
      )
    ),
    div({ class: css('_grid _gc1 _lg:gc3 _gap4 _flex1') },
      div({ class: css('_flex _col _gap3 _span1') },
        Input({ placeholder: 'Search tickets...', value: search, onchange: e => setSearch(e.target.value) }),
        Tabs({
          tabs: [
            { id: 'all', label: 'All' },
            { id: 'open', label: 'Open' },
            { id: 'pending', label: 'Pending' },
            { id: 'resolved', label: 'Resolved' },
          ],
          active: filter(),
          onchange: setFilter,
          size: 'sm'
        }),
        Card({ class: css('d-glass _flex _col _flex1 _overflow[hidden]') },
          Card.Body({ class: css('_flex _col _gap1 _overflow[auto] _mh[500px] d-stagger') },
            ...(() => filtered().map(t => TicketItem(t, selected, setSelected)))()
          )
        )
      ),
      div({ class: css('_span1 _lg:span2') },
        TicketDetail(selected)
      )
    )
  );
}
