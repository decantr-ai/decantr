import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Chart, Sparkline } from 'decantr/chart';

const { div, section, h2, h3, p, span } = tags;

function DemoGroup(label, ...children) {
  return div({ class: css('_flex _col _gap3') },
    h3({ class: css('_t12 _bold _fg4'), style: 'text-transform:uppercase;letter-spacing:0.05em' }, label),
    ...children
  );
}

function DemoRow(...children) {
  return div({ class: css('_flex _gap3 _wrap _aic') }, ...children);
}

const SALES_DATA = [
  { month: 'Jan', sales: 12000, profit: 3600, returns: 800 },
  { month: 'Feb', sales: 18000, profit: 5400, returns: 1200 },
  { month: 'Mar', sales: 15000, profit: 4500, returns: 950 },
  { month: 'Apr', sales: 22000, profit: 6600, returns: 1100 },
  { month: 'May', sales: 28000, profit: 8400, returns: 1400 },
  { month: 'Jun', sales: 35000, profit: 10500, returns: 1800 }
];

const PIE_DATA = [
  { category: 'Direct', value: 45 },
  { category: 'Organic', value: 28 },
  { category: 'Referral', value: 15 },
  { category: 'Social', value: 12 }
];

export function ChartSection() {
  return section({ id: 'chart', class: css('_flex _col _gap8') },
    h2({ class: css('_t24 _bold _mb2') }, 'Charts'),

    DemoGroup('Line Chart',
      div({ class: css('_grid _gc2 _gap4') },
        div({},
          p({ class: css('_fg4 _textbase _mb2') }, 'Single series'),
          Chart({ type: 'line', data: SALES_DATA, x: 'month', y: 'sales', title: 'Monthly Sales' })
        ),
        div({},
          p({ class: css('_fg4 _textbase _mb2') }, 'Multi-series'),
          Chart({ type: 'line', data: SALES_DATA, x: 'month', y: ['sales', 'profit'], title: 'Sales vs Profit' })
        )
      )
    ),

    DemoGroup('Bar Chart',
      div({ class: css('_grid _gc2 _gap4') },
        div({},
          p({ class: css('_fg4 _textbase _mb2') }, 'Simple bars'),
          Chart({ type: 'bar', data: SALES_DATA, x: 'month', y: 'sales', title: 'Revenue by Month' })
        ),
        div({},
          p({ class: css('_fg4 _textbase _mb2') }, 'Grouped bars'),
          Chart({ type: 'bar', data: SALES_DATA, x: 'month', y: ['sales', 'profit'], title: 'Sales & Profit' })
        )
      )
    ),

    DemoGroup('Area Chart',
      Chart({ type: 'area', data: SALES_DATA, x: 'month', y: 'sales', title: 'Sales Trend', height: '280px' })
    ),

    DemoGroup('Pie / Donut',
      div({ class: css('_grid _gc2 _gap4') },
        div({},
          p({ class: css('_fg4 _textbase _mb2') }, 'Donut (default)'),
          Chart({ type: 'pie', data: PIE_DATA, x: 'category', y: 'value', title: 'Traffic Sources', height: '280px' })
        ),
        div({},
          p({ class: css('_fg4 _textbase _mb2') }, 'Full pie'),
          Chart({ type: 'pie', data: PIE_DATA, x: 'category', y: 'value', title: 'Traffic Sources', height: '280px', donut: false })
        )
      )
    ),

    DemoGroup('Sparklines',
      DemoRow(
        div({ class: css('_flex _aic _gap2') },
          span({ class: css('_fg4 _textbase') }, 'Revenue'),
          Sparkline({ data: [4, 7, 2, 9, 5, 3, 8, 6, 10, 4] }),
          span({ class: css('_bold _fg7') }, '+12%')
        ),
        div({ class: css('_flex _aic _gap2') },
          span({ class: css('_fg4 _textbase') }, 'Users'),
          Sparkline({ data: [2, 3, 5, 4, 7, 8, 6, 9, 11, 13] }),
          span({ class: css('_bold _fg7') }, '+24%')
        ),
        div({ class: css('_flex _aic _gap2') },
          span({ class: css('_fg4 _textbase') }, 'Errors'),
          Sparkline({ data: [8, 6, 9, 5, 3, 4, 2, 3, 1, 2] }),
          span({ class: css('_bold _fg9') }, '-75%')
        )
      )
    ),

    DemoGroup('Stacked Bar',
      Chart({ type: 'bar', data: SALES_DATA, x: 'month', y: ['profit', 'returns'], title: 'Profit & Returns (Stacked)', stacked: true, height: '280px' })
    ),

    DemoGroup('Custom Formatting',
      Chart({
        type: 'bar', data: SALES_DATA, x: 'month', y: 'sales',
        title: 'Revenue (Formatted)',
        yFormat: v => '$' + (v / 1000).toFixed(0) + 'K',
        height: '280px'
      })
    ),

    DemoGroup('Options — No Grid / No Legend',
      div({ class: css('_grid _gc2 _gap4') },
        div({},
          p({ class: css('_fg4 _textbase _mb2') }, 'grid: false'),
          Chart({ type: 'line', data: SALES_DATA, x: 'month', y: 'sales', grid: false, height: '240px' })
        ),
        div({},
          p({ class: css('_fg4 _textbase _mb2') }, 'legend: false'),
          Chart({ type: 'line', data: SALES_DATA, x: 'month', y: ['sales', 'profit'], legend: false, height: '240px' })
        )
      )
    )
  );
}
