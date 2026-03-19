import { tags } from 'decantr/tags';
import { Card, DataTable } from 'decantr/components';

const { div, h1 } = tags;

const mockData = [
  { id: 1, metric: 'Page Views', today: 1234, yesterday: 1100, change: '+12%' },
  { id: 2, metric: 'Unique Visitors', today: 567, yesterday: 520, change: '+9%' },
  { id: 3, metric: 'Bounce Rate', today: '45%', yesterday: '48%', change: '-3%' },
  { id: 4, metric: 'Avg Session', today: '2m 34s', yesterday: '2m 12s', change: '+10%' },
];

export function AnalyticsPage() {
  return div({ class: '_flex _col _gap4 _p4 _overflow[auto] _flex1' },
    h1({ class: '_fslg _fwbold _mb4' }, 'Analytics'),

    // Charts row
    div({ class: '_grid _gc2 _gap4' },
      Card({
        children: [
          Card.Header({}, 'Traffic Overview'),
          Card.Body({ class: '_h[250px] _flex _itemscenter _justifycenter _fgmuted' },
            'Line chart placeholder'
          ),
        ],
      }),
      Card({
        children: [
          Card.Header({}, 'User Distribution'),
          Card.Body({ class: '_h[250px] _flex _itemscenter _justifycenter _fgmuted' },
            'Pie chart placeholder'
          ),
        ],
      })
    ),

    // Data table
    Card({
      class: '_mt4',
      children: [
        Card.Header({}, 'Metrics Comparison'),
        Card.Body({},
          DataTable({
            columns: [
              { key: 'metric', header: 'Metric' },
              { key: 'today', header: 'Today' },
              { key: 'yesterday', header: 'Yesterday' },
              { key: 'change', header: 'Change' },
            ],
            data: mockData,
          })
        ),
      ],
    })
  );
}
