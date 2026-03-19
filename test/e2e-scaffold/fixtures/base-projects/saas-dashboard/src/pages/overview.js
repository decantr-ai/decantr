import { tags } from 'decantr/tags';
import { Card } from 'decantr/components';

const { div, h1, span } = tags;

const mockKPIs = [
  { label: 'Total Users', value: '12,345', change: '+12%' },
  { label: 'Active Sessions', value: '1,234', change: '+5%' },
  { label: 'Revenue', value: '$45,678', change: '+8%' },
  { label: 'Conversion', value: '3.2%', change: '-0.5%' },
];

export function OverviewPage() {
  return div({ class: '_flex _col _gap4 _p4 _overflow[auto] _flex1' },
    h1({ class: '_fslg _fwbold _mb4' }, 'Overview'),

    // KPI Grid
    div({ class: '_grid _gc4 _gap4' },
      mockKPIs.map(kpi =>
        Card({
          class: '_p4',
          children: [
            span({ class: '_fgmuted _fssm' }, kpi.label),
            div({ class: '_fs2xl _fwbold _mt2' }, kpi.value),
            span({ class: kpi.change.startsWith('+') ? '_fgsuccess' : '_fgerror' }, kpi.change),
          ],
        })
      )
    ),

    // Chart placeholder
    Card({
      class: '_mt4',
      children: [
        Card.Header({}, 'Performance Chart'),
        Card.Body({ class: '_h[300px] _flex _itemscenter _justifycenter _fgmuted' },
          'Chart visualization placeholder'
        ),
      ],
    })
  );
}
