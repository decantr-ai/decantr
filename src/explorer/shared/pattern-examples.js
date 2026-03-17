import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { css } from 'decantr/css';
import {
  Button, Card, Input, Select, Badge, Chip, Avatar, Statistic,
  DataTable, Tabs, Accordion, Separator, Progress, Steps, Image,
  Checkbox, RadioGroup, Switch, Textarea, Slider, Descriptions,
  Pagination, Breadcrumb, Timeline, Placeholder, icon, CodeBlock,
  List, DatePicker, Modal, Upload, Segmented, InputNumber,
  Collapsible, ScrollArea, Spinner
} from 'decantr/components';

const { div, h1, h2, h3, h4, p, span, a, ul, li, strong, em, blockquote,
        code: codeEl, nav: navEl, article: articleEl, time, section } = tags;

// ─── Chart conditional import ───────────────────────────────────
let Chart = null;
let Sparkline = null;
try {
  const chartMod = await import('decantr/chart');
  Chart = chartMod.Chart;
  Sparkline = chartMod.Sparkline;
} catch { /* chart module unavailable */ }

function chartFallback(label) {
  return Placeholder({ height: '280px', label: label || 'Chart unavailable' });
}

function sparklineFallback() {
  return Placeholder({ height: '40px', label: 'Sparkline' });
}

// ─── Pattern Examples ───────────────────────────────────────────

const PATTERN_EXAMPLES = {

  // ── Layout ──────────────────────────────────────────────────

  'hero': () => {
    return div({ class: css('_flex _col _aic _tc _gap6 _py16 _px6') },
      h1({ class: css('_heading1') }, 'Build Faster, Ship Smarter'),
      p({ class: css('_body _fgmuted _mw[640px]') }, 'The AI-first framework that turns your ideas into production-ready applications in minutes, not months.'),
      div({ class: css('_flex _gap3') },
        Button({ variant: 'primary', size: 'lg' }, 'Get Started'),
        Button({ variant: 'outline', size: 'lg' }, icon('github'), 'View Source')
      )
    );
  },

  'cta-section': () => {
    return div({ class: css('_flex _col _aic _tc _gap4 _py12 _px6 _bgmuted _r4') },
      h2({ class: css('_heading2') }, 'Ready to get started?'),
      p({ class: css('_body _fgmuted _mw[480px]') }, 'Join thousands of teams building better products with our platform.'),
      div({ class: css('_flex _gap3') },
        Button({ variant: 'primary', size: 'lg' }, 'Start Free Trial'),
        Button({ variant: 'outline', size: 'lg' }, 'Talk to Sales')
      )
    );
  },

  'detail-header': () => {
    const title = 'Project Alpha';
    const breadcrumbs = [{ label: 'Home' }, { label: 'Projects' }, { label: 'Project Alpha' }];

    return div({ class: css('_flex _col _gap3 _pb4 _borderB') },
      Breadcrumb({ items: breadcrumbs }),
      div({ class: css('_flex _aic _jcsb') },
        div({ class: css('_flex _aic _gap3') },
          h1({ class: css('_heading3') }, title),
          Badge({ variant: 'success' }, 'active')
        ),
        div({ class: css('_flex _gap2') },
          Button({ variant: 'outline', size: 'sm' }, icon('edit'), 'Edit'),
          Button({ variant: 'outline', size: 'sm' }, icon('share'), 'Share')
        )
      )
    );
  },

  'detail-panel': () => {
    const entity = {
      name: 'Acme Corporation',
      status: 'Active',
      fields: [
        { label: 'Industry', value: 'Technology' },
        { label: 'Size', value: '500-1000 employees' },
        { label: 'Location', value: 'San Francisco, CA' },
        { label: 'Founded', value: '2018' }
      ]
    };

    return div({ class: css('_flex _col _gap4 _p4') },
      div({ class: css('_flex _aic _jcsb') },
        div({ class: css('_flex _aic _gap3') },
          h2({ class: css('_heading3') }, entity.name),
          Badge({ variant: 'success' }, entity.status)
        ),
        div({ class: css('_flex _gap2') },
          Button({ variant: 'outline', size: 'sm' }, 'Edit'),
          Button({ variant: 'destructive', size: 'sm' }, 'Delete')
        )
      ),
      Separator(),
      Tabs({ items: [
        { label: 'Overview', content: () => Descriptions({ items: entity.fields }) },
        { label: 'Activity', content: () => div({ class: css('_p4 _fgmuted') }, 'Activity timeline...') },
        { label: 'Settings', content: () => div({ class: css('_p4 _fgmuted') }, 'Settings panel...') }
      ] })
    );
  },

  // ── Data Display ────────────────────────────────────────────

  'kpi-grid': () => {
    return div({ class: css('_flex _col _gap4') },
      h2({ class: css('_heading4') }, 'Key Metrics'),
      div({ class: css('_grid _gc4 _gap4') },
        Statistic({ label: 'Revenue', value: 1248500, prefix: '$', trend: 'up', trendValue: '+12.5%' }),
        Statistic({ label: 'Users', value: 84230, trend: 'up', trendValue: '+8.1%' }),
        Statistic({ label: 'Orders', value: 6420, trend: 'down', trendValue: '-2.3%' }),
        Statistic({ label: 'Conversion', value: 3.24, suffix: '%', trend: 'up', trendValue: '+0.5%' })
      )
    );
  },

  'data-table': () => {
    const [search, setSearch] = createSignal('');
    const [status, setStatus] = createSignal('all');
    const columns = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status' }
    ];
    const data = [
      { name: 'Alice Chen', email: 'alice@example.com', role: 'Admin', status: 'active' },
      { name: 'Bob Patel', email: 'bob@example.com', role: 'Editor', status: 'active' },
      { name: 'Carol Liu', email: 'carol@example.com', role: 'Viewer', status: 'inactive' },
      { name: 'Dan Kim', email: 'dan@example.com', role: 'Editor', status: 'active' }
    ];

    return div({ class: css('_flex _col _gap4') },
      div({ class: css('_flex _gap3 _aic _jcsb') },
        Input({ placeholder: 'Search...', value: search, onchange: e => setSearch(e.target.value) }),
        div({ class: css('_flex _gap2') },
          Select({ value: status, onchange: v => setStatus(v), options: [
            { label: 'All', value: 'all' },
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' }
          ] }),
          Button({ variant: 'outline' }, 'Export')
        )
      ),
      DataTable({ columns, data, sortable: true, paginate: true, pageSize: 10 })
    );
  },

  'chart-grid': () => {
    const data = {
      revenue: [{ date: 'Jan', value: 4200 }, { date: 'Feb', value: 5100 }, { date: 'Mar', value: 4800 }, { date: 'Apr', value: 6200 }],
      orders: [{ month: 'Jan', count: 120 }, { month: 'Feb', count: 145 }, { month: 'Mar', count: 132 }, { month: 'Apr', count: 168 }],
      categories: [{ name: 'Electronics', value: 42 }, { name: 'Clothing', value: 28 }, { name: 'Books', value: 18 }, { name: 'Home', value: 12 }],
      traffic: [{ date: 'Jan', visits: 8400 }, { date: 'Feb', visits: 9200 }, { date: 'Mar', visits: 8800 }, { date: 'Apr', visits: 11500 }]
    };

    return div({ class: css('_flex _col _gap4') },
      div({ class: css('_flex _aic _jcsb') },
        h2({ class: css('_heading4') }, 'Analytics'),
        Select({ value: '7d', options: [
          { label: 'Last 7 days', value: '7d' },
          { label: 'Last 30 days', value: '30d' },
          { label: 'Last 90 days', value: '90d' }
        ] })
      ),
      div({ class: css('_grid _gc2 _gap4') },
        Chart ? Chart({ type: 'line', data: data.revenue, x: 'date', y: 'value', title: 'Revenue', height: 280 }) : chartFallback('Revenue'),
        Chart ? Chart({ type: 'bar', data: data.orders, x: 'month', y: 'count', title: 'Orders', height: 280 }) : chartFallback('Orders'),
        Chart ? Chart({ type: 'pie', data: data.categories, x: 'name', y: 'value', title: 'Categories', height: 280 }) : chartFallback('Categories'),
        Chart ? Chart({ type: 'area', data: data.traffic, x: 'date', y: 'visits', title: 'Traffic', height: 280 }) : chartFallback('Traffic')
      )
    );
  },

  'scorecard': () => {
    const groups = [
      { name: 'Revenue', metrics: [
        { label: 'Monthly Revenue', value: 142, target: 150, unit: 'K', status: 'on-track' },
        { label: 'ARR Growth', value: 24, target: 30, unit: '%', status: 'behind' }
      ]},
      { name: 'Product', metrics: [
        { label: 'Active Users', value: 84, target: 100, unit: 'K', status: 'at-risk' },
        { label: 'NPS Score', value: 72, target: 75, unit: '', status: 'on-track' }
      ]}
    ];

    return div({ class: css('_flex _col _gap6 _p4') },
      ...groups.map(group =>
        div({ class: css('_flex _col _gap3') },
          h3({ class: css('_heading5') }, group.name),
          div({ class: css('_grid _gc3 _gap4') },
            ...group.metrics.map(m =>
              div({ class: css('_flex _col _gap2 _p4 _b1 _r4') },
                div({ class: css('_flex _aic _jcsb') },
                  span({ class: css('_textsm _bold') }, m.label),
                  Badge({ variant: m.status === 'on-track' ? 'success' : m.status === 'behind' ? 'error' : 'warning' }, m.status)
                ),
                Statistic({ value: m.value, suffix: m.unit }),
                Progress({ value: (m.value / m.target) * 100 }),
                span({ class: css('_textxs _fgmuted') }, `Target: ${m.target}${m.unit}`)
              )
            )
          )
        )
      )
    );
  },

  'comparison-panel': () => {
    const periods = [
      { label: 'This Quarter', revenue: 142000, delta: 12.5, trend: [40, 52, 48, 61, 58, 72] },
      { label: 'Last Quarter', revenue: 126200, delta: -3.1, trend: [38, 42, 40, 44, 41, 43] },
      { label: 'Year Ago', revenue: 98400, delta: 0, trend: [30, 32, 28, 35, 33, 34] }
    ];

    return div({ class: css('_flex _col _gap4 _p4') },
      h3({ class: css('_heading4') }, 'Period Comparison'),
      div({ class: css('_grid _gc3 _gap4') },
        ...periods.map(period =>
          div({ class: css('_flex _col _gap3 _p4 _b1 _r4') },
            span({ class: css('_textsm _fgmuted _bold') }, period.label),
            Statistic({ label: 'Revenue', value: period.revenue, prefix: '$' }),
            div({ class: css('_flex _aic _gap2') },
              Badge({ variant: period.delta > 0 ? 'success' : period.delta < 0 ? 'error' : 'default' }, `${period.delta > 0 ? '+' : ''}${period.delta}%`),
              span({ class: css('_textxs _fgmuted') }, 'vs baseline')
            ),
            Sparkline ? Sparkline({ data: period.trend, height: 40 }) : sparklineFallback()
          )
        )
      )
    );
  },

  // ── Content ─────────────────────────────────────────────────

  'article-content': () => {
    return articleEl({ class: css('_flex _col _gap6 _mw[720px] _mxa _py8') },
      div({ class: css('_flex _col _gap3') },
        h1({ class: css('_heading1') }, 'Building Scalable Design Systems'),
        div({ class: css('_flex _aic _gap3') },
          Avatar({ name: 'Jane Doe', size: 'sm' }),
          span({ class: css('_textsm') }, 'Jane Doe'),
          time({ class: css('_textsm _fgmuted') }, 'Mar 12, 2026'),
          span({ class: css('_textsm _fgmuted') }, '8 min read')
        )
      ),
      Separator(),
      div({ class: css('_body _lhrelaxed') },
        p({}, 'Design systems provide a shared language between design and engineering. By establishing reusable components and tokens, teams ship faster while maintaining consistency.'),
        p({ class: css('_mt4') }, 'The key to a successful design system is not just the components themselves, but the principles and processes that guide their creation and evolution over time.')
      )
    );
  },

  'post-list': () => {
    const posts = [
      { slug: 'design-systems', category: 'Design', readTime: '5 min', title: 'Building Design Systems at Scale', excerpt: 'How to create and maintain design systems that grow with your organization.', author: { name: 'Alice Chen' }, date: 'Mar 10, 2026' },
      { slug: 'reactive-state', category: 'Engineering', readTime: '8 min', title: 'Reactive State Management Patterns', excerpt: 'Exploring signals, stores, and effects for predictable UI state.', author: { name: 'Bob Patel' }, date: 'Mar 8, 2026' },
      { slug: 'accessibility', category: 'Design', readTime: '6 min', title: 'Accessibility Beyond Compliance', excerpt: 'Moving past checklists to create truly inclusive experiences.', author: { name: 'Carol Liu' }, date: 'Mar 5, 2026' }
    ];

    return div({ class: css('_flex _col _gap4 _p4') },
      ...posts.map(post =>
        a({ href: '#', onclick: e => e.preventDefault(), class: css('_nounder') },
          Card({ class: css('_flex _col _gap3') },
            Card.Body({},
              div({ class: css('_flex _aic _gap2 _mb2') },
                Badge({}, post.category),
                span({ class: css('_textxs _fgmuted') }, post.readTime)
              ),
              h3({ class: css('_heading5') }, post.title),
              p({ class: css('_textsm _fgmuted _clamp2') }, post.excerpt),
              div({ class: css('_flex _aic _gap2 _mt3') },
                Avatar({ name: post.author.name, size: 'sm' }),
                span({ class: css('_textsm') }, post.author.name),
                time({ class: css('_textsm _fgmuted _mla') }, post.date)
              )
            )
          )
        )
      )
    );
  },

  'testimonials': () => {
    const items = [
      { quote: 'This product transformed our workflow completely.', name: 'Sarah Johnson', role: 'CTO at TechCorp' },
      { quote: 'The best investment we made this year.', name: 'Mike Chen', role: 'Product Lead at Acme' },
      { quote: 'Incredible support team and amazing features.', name: 'Lisa Park', role: 'Engineering Manager at Globex' }
    ];

    return div({ class: css('_grid _gc3 _gap4 _p4') },
      ...items.map(t =>
        Card({ class: css('_flex _col _gap4') },
          Card.Body({},
            p({ class: css('_italic _fgmuted') }, `"${t.quote}"`),
            div({ class: css('_flex _aic _gap3 _mt3') },
              Avatar({ name: t.name }),
              div({},
                span({ class: css('_textsm _bold') }, t.name),
                span({ class: css('_textxs _fgmuted _block') }, t.role)
              )
            )
          )
        )
      )
    );
  },

  'author-card': () => {
    const author = {
      name: 'Jane Doe',
      bio: 'Senior Design Engineer focusing on design systems and component architecture.',
      socials: [{ ic: 'github' }, { ic: 'twitter' }, { ic: 'linkedin' }]
    };

    return div({ class: css('_flex _gap4 _p4 _b1 _r4') },
      Avatar({ name: author.name, size: 'lg' }),
      div({ class: css('_flex _col _gap2 _flex1') },
        h3({ class: css('_heading5') }, author.name),
        p({ class: css('_textsm _fgmuted') }, author.bio),
        div({ class: css('_flex _gap2 _mt1') },
          ...author.socials.map(s =>
            Button({ variant: 'ghost', size: 'sm' }, icon(s.ic))
          )
        )
      )
    );
  },

  'media-gallery': () => {
    const images = [
      { alt: 'Mountain landscape' },
      { alt: 'Ocean sunset' },
      { alt: 'Forest trail' },
      { alt: 'City skyline' },
      { alt: 'Desert dunes' },
      { alt: 'Snowy peaks' }
    ];

    return div({ class: css('_grid _gcaf250 _gap3 _p4') },
      ...images.map(img =>
        div({ class: css('_overflow[hidden] _r4') },
          Placeholder({ height: '200px', label: img.alt })
        )
      )
    );
  },

  // ── Navigation ──────────────────────────────────────────────

  'category-nav': () => {
    const categories = [
      { id: 'design', name: 'Design' },
      { id: 'engineering', name: 'Engineering' },
      { id: 'product', name: 'Product' },
      { id: 'marketing', name: 'Marketing' }
    ];
    const [active, setActive] = createSignal('all');

    return div({ class: css('_flex _gap2 _wrap _py3 _overflow[auto]') },
      Chip({
        label: 'All',
        variant: active() === 'all' ? 'primary' : 'outline',
        onclick: () => setActive('all')
      }),
      ...categories.map(cat =>
        Chip({
          label: cat.name,
          variant: active() === cat.id ? 'primary' : 'outline',
          onclick: () => setActive(cat.id)
        })
      )
    );
  },

  'table-of-contents': () => {
    const headings = [
      { id: 'introduction', text: 'Introduction' },
      { id: 'getting-started', text: 'Getting Started' },
      { id: 'configuration', text: 'Configuration' },
      { id: 'api-reference', text: 'API Reference' },
      { id: 'examples', text: 'Examples' }
    ];
    const [activeId] = createSignal('introduction');

    return navEl({ class: css('_flex _col _gap1 _p4') },
      ul({ class: css('_flex _col _gap1 _borderL') },
        ...headings.map(h =>
          li({},
            a({
              href: `#${h.id}`,
              onclick: e => e.preventDefault(),
              class: css(`_flex _py1 _pl4 _textsm _nounder _trans ${activeId() === h.id ? '_fgprimary _bold _borderL _bcprimary' : '_fgmuted'}`)
            }, h.text)
          )
        )
      )
    );
  },

  'pagination': () => {
    const total = 243;
    const pageSize = 10;
    const [page, setPage] = createSignal(1);
    const totalPages = Math.ceil(total / pageSize);

    return div({ class: css('_flex _aic _jcsb _py3') },
      span({ class: css('_textsm _fgmuted') },
        `Showing ${(page() - 1) * pageSize + 1}-${Math.min(page() * pageSize, total)} of ${total}`
      ),
      Pagination({ current: page, total: totalPages, onChange: setPage })
    );
  },

  'search-bar': () => {
    const [query, setQuery] = createSignal('');

    return div({ class: css('_flex _gap2 _aic') },
      Input({
        placeholder: 'Search...',
        value: query,
        onchange: e => setQuery(e.target.value),
        class: css('_flex1')
      }),
      Button({ variant: 'primary' }, icon('search'), 'Search')
    );
  },

  'filter-bar': () => {
    const [search, setSearch] = createSignal('');
    const [category, setCategory] = createSignal('all');
    const [filters, setFilters] = createSignal([]);

    return div({ class: css('_flex _gap3 _aic _wrap _py3') },
      Input({ placeholder: 'Search...', value: search, onchange: e => setSearch(e.target.value), class: css('_w[240px]') }),
      Select({ value: category, onchange: v => { setCategory(v); if (v !== 'all') setFilters([...filters(), v]); },
        options: [
          { label: 'All Categories', value: 'all' },
          { label: 'Sales', value: 'sales' },
          { label: 'Marketing', value: 'marketing' }
        ] }),
      DatePicker({ placeholder: 'Date range' }),
      ...filters().map(f => Chip({ label: f, onClose: () => setFilters(filters().filter(x => x !== f)) })),
      filters().length > 0 ? Button({ variant: 'ghost', size: 'sm', onclick: () => setFilters([]) }, 'Clear All') : null
    );
  },

  'filter-sidebar': () => {
    const categories = [
      { id: 'electronics', name: 'Electronics' },
      { id: 'clothing', name: 'Clothing' },
      { id: 'books', name: 'Books' },
      { id: 'home', name: 'Home & Garden' }
    ];
    const priceRanges = [
      { id: 'under25', label: 'Under $25' },
      { id: '25to50', label: '$25 - $50' },
      { id: '50to100', label: '$50 - $100' },
      { id: 'over100', label: 'Over $100' }
    ];
    const [selected, setSelected] = createSignal([]);

    return div({ class: css('_flex _col _gap4 _p4 _w[260px] _borderR _overflow[auto]') },
      h3({ class: css('_heading5') }, 'Filters'),
      Accordion({ items: [
        { title: 'Category', content: () =>
          div({ class: css('_flex _col _gap2') },
            ...categories.map(cat =>
              Checkbox({ label: cat.name, checked: selected().includes(cat.id),
                onchange: v => setSelected(v ? [...selected(), cat.id] : selected().filter(x => x !== cat.id))
              })
            )
          )
        },
        { title: 'Price Range', content: () =>
          RadioGroup({ options: priceRanges.map(r => ({ label: r.label, value: r.id })) })
        }
      ] }),
      Button({ variant: 'primary', class: css('_wfull') }, 'Apply Filters')
    );
  },

  // ── Forms ───────────────────────────────────────────────────

  'auth-form': () => {
    const [email, setEmail] = createSignal('');
    const [password, setPassword] = createSignal('');

    return div({ class: css('_flex _col _aic _jcc _p6') },
      Card({ class: css('_w[400px] _mw[100%]') },
        Card.Header({},
          h2({ class: css('_heading4 _tc') }, 'Sign In'),
          p({ class: css('_fgmuted _tc _mt1') }, 'Enter your credentials to continue')
        ),
        Card.Body({ class: css('_flex _col _gap3') },
          Input({ label: 'Email', type: 'email', placeholder: 'you@example.com', value: email, onchange: e => setEmail(e.target.value) }),
          Input({ label: 'Password', type: 'password', placeholder: '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022', value: password, onchange: e => setPassword(e.target.value) }),
          Button({ variant: 'primary', class: css('_wfull _mt2') }, 'Sign In')
        ),
        Card.Footer({ class: css('_flex _col _gap3 _aic') },
          Separator(),
          span({ class: css('_fgmuted _textsm') }, 'Don\'t have an account? ',
            a({ href: '#', onclick: e => e.preventDefault() }, 'Sign Up')
          )
        )
      )
    );
  },

  'contact-form': () => {
    return Card({ class: css('_mw[600px] _mxa') },
      Card.Header({},
        h2({ class: css('_heading4') }, 'Get in Touch'),
        p({ class: css('_fgmuted _mt1') }, 'We\'ll get back to you within 24 hours.')
      ),
      Card.Body({ class: css('_flex _col _gap4') },
        div({ class: css('_grid _gc2 _gap4') },
          Input({ label: 'First Name', placeholder: 'John' }),
          Input({ label: 'Last Name', placeholder: 'Doe' })
        ),
        Input({ label: 'Email', type: 'email', placeholder: 'john@example.com' }),
        Select({ label: 'Subject', options: [
          { label: 'General Inquiry', value: 'general' },
          { label: 'Sales', value: 'sales' },
          { label: 'Support', value: 'support' }
        ] }),
        Textarea({ label: 'Message', placeholder: 'Tell us about your project...', rows: 4 }),
        Button({ variant: 'primary', class: css('_wfull') }, 'Send Message')
      )
    );
  },

  'form-sections': () => {
    const sectionBlock = (title, desc, ...fields) =>
      div({ class: css('_flex _col _gap4') },
        div({}, h3({ class: css('_heading5') }, title), p({ class: css('_fgmuted _textsm') }, desc)),
        ...fields
      );

    return div({ class: css('_flex _col _gap8 _p6 _mw[720px]') },
      sectionBlock('Personal Info', 'Basic contact details',
        div({ class: css('_grid _gc2 _gap4') },
          Input({ label: 'First Name' }),
          Input({ label: 'Last Name' })
        ),
        Input({ label: 'Email', type: 'email' })
      ),
      Separator(),
      sectionBlock('Company', 'Organization details',
        Input({ label: 'Company Name' }),
        Select({ label: 'Industry', options: [{ label: 'Technology', value: 'tech' }, { label: 'Finance', value: 'finance' }] })
      ),
      Separator(),
      sectionBlock('Notes', 'Additional information',
        Textarea({ label: 'Notes', rows: 4 })
      ),
      div({ class: css('_flex _jcfe _gap3') },
        Button({ variant: 'outline' }, 'Cancel'),
        Button({ variant: 'primary' }, 'Save')
      )
    );
  },

  'wizard': () => {
    const steps = [
      { title: 'Account', content: () => div({ class: css('_flex _col _gap3 _p4') }, p({}, 'Enter your account details.')) },
      { title: 'Profile', content: () => div({ class: css('_flex _col _gap3 _p4') }, p({}, 'Complete your profile information.')) },
      { title: 'Confirm', content: () => div({ class: css('_flex _col _gap3 _p4') }, p({}, 'Review and confirm your details.')) }
    ];
    const [current, setCurrent] = createSignal(0);

    return Card({ class: css('_flex _col _gap6 _p6') },
      Steps({ current: current, items: steps.map(s => ({ title: s.title })) }),
      div({ class: css('_flex _col _gap4 _py4') },
        steps[current()]?.content()
      ),
      div({ class: css('_flex _jcsb') },
        current() > 0
          ? Button({ variant: 'outline', onclick: () => setCurrent(current() - 1) }, 'Back')
          : div(),
        current() < steps.length - 1
          ? Button({ variant: 'primary', onclick: () => setCurrent(current() + 1) }, 'Next')
          : Button({ variant: 'primary' }, 'Submit')
      )
    );
  },

  // ── Commerce ────────────────────────────────────────────────

  'product-grid': () => {
    const products = [
      { name: 'Wireless Headphones', badge: 'New', description: 'Premium noise-cancelling headphones.', price: 199.99 },
      { name: 'Mechanical Keyboard', badge: null, description: 'RGB backlit mechanical keyboard.', price: 149.99 },
      { name: 'USB-C Hub', badge: 'Sale', description: '7-in-1 USB-C hub with HDMI output.', price: 49.99 },
      { name: 'Monitor Stand', badge: null, description: 'Adjustable aluminum monitor stand.', price: 79.99 }
    ];

    return div({ class: css('_grid _gcaf280 _gap4 _p4') },
      ...products.map(prod =>
        Card({},
          Placeholder({ height: '200px', label: prod.name }),
          Card.Body({ class: css('_flex _col _gap2') },
            div({ class: css('_flex _aic _jcsb') },
              h3({ class: css('_heading5') }, prod.name),
              prod.badge ? Badge({ variant: 'accent' }, prod.badge) : null
            ),
            span({ class: css('_fgmuted _textsm') }, prod.description),
            div({ class: css('_flex _aic _jcsb _mt2') },
              span({ class: css('_heading4') }, `$${prod.price}`),
              Button({ variant: 'primary', size: 'sm' }, 'Add to Cart')
            )
          )
        )
      )
    );
  },

  'pricing-table': () => {
    const plans = [
      { name: 'Starter', price: 9, featured: false, features: ['5 projects', '1 GB storage', 'Email support'] },
      { name: 'Pro', price: 29, featured: true, features: ['Unlimited projects', '10 GB storage', 'Priority support', 'API access', 'Custom domain'] },
      { name: 'Enterprise', price: 99, featured: false, features: ['Everything in Pro', '100 GB storage', 'Dedicated support', 'SSO', 'Audit logs', 'SLA'] }
    ];

    return div({ class: css('_grid _gc3 _gap6 _p4 _aic') },
      ...plans.map(plan =>
        Card({ class: css(plan.featured ? '_b2 _bcprimary' : '') },
          Card.Header({ class: css('_tc') },
            plan.featured ? Badge({ variant: 'primary', class: css('_mb2') }, 'Popular') : null,
            h3({ class: css('_heading4') }, plan.name),
            div({ class: css('_mt2') },
              span({ class: css('_heading1') }, `$${plan.price}`),
              span({ class: css('_fgmuted') }, '/month')
            )
          ),
          Separator(),
          Card.Body({},
            ul({ class: css('_flex _col _gap2') },
              ...plan.features.map(f =>
                li({ class: css('_flex _aic _gap2 _textsm') }, icon('check', { class: css('_fgsuccess') }), f)
              )
            )
          ),
          Card.Footer({},
            Button({ variant: plan.featured ? 'primary' : 'outline', class: css('_wfull') }, 'Get Started')
          )
        )
      )
    );
  },

  'order-history': () => {
    const orders = [
      { id: 'ORD-1042', date: '2026-03-10', items: 3, total: 129.99, status: 'delivered' },
      { id: 'ORD-1041', date: '2026-03-08', items: 1, total: 49.00, status: 'shipped' },
      { id: 'ORD-1040', date: '2026-03-05', items: 2, total: 84.50, status: 'processing' },
      { id: 'ORD-1039', date: '2026-03-01', items: 5, total: 212.75, status: 'delivered' }
    ];
    const columns = [
      { key: 'id', label: 'Order #', sortable: true },
      { key: 'date', label: 'Date', sortable: true },
      { key: 'items', label: 'Items' },
      { key: 'total', label: 'Total', sortable: true, render: val => val != null ? `$${val.toFixed(2)}` : '-' },
      { key: 'status', label: 'Status', render: (val, row) =>
        Badge({ variant: val === 'delivered' ? 'success' : val === 'shipped' ? 'primary' : 'default' }, val)
      },
      { key: 'actions', label: '', render: () =>
        Button({ variant: 'ghost', size: 'sm' }, 'View')
      }
    ];

    return div({ class: css('_flex _col _gap4 _p4') },
      h3({ class: css('_heading4') }, 'Order History'),
      DataTable({ columns, data: orders, sortable: true, paginate: true, pageSize: 10 })
    );
  },

  // ── Activity ────────────────────────────────────────────────

  'activity-feed': () => {
    const items = [
      { user: 'Alice Chen', action: 'deployed v2.4.1 to production', time: '2 min ago', type: 'success' },
      { user: 'Bob Patel', action: 'opened pull request #142', time: '15 min ago', type: 'default' },
      { user: 'Carol Liu', action: 'commented on issue #89', time: '1 hour ago', type: 'default' },
      { user: 'Dan Kim', action: 'merged branch feature/auth', time: '3 hours ago', type: 'success' }
    ];

    return div({ class: css('_flex _col _gap2 _p4') },
      h3({ class: css('_heading5') }, 'Recent Activity'),
      ...items.map(item =>
        div({ class: css('_flex _gap3 _aic _py2 _borderB') },
          Avatar({ name: item.user, size: 'sm' }),
          div({ class: css('_flex _col _flex1') },
            span({ class: css('_textsm') }, span({ class: css('_bold') }, item.user), ` ${item.action}`),
            span({ class: css('_textxs _fgmuted') }, item.time)
          ),
          Badge({ variant: item.type === 'success' ? 'success' : 'default' }, item.type)
        )
      ),
      Button({ variant: 'ghost', class: css('_wfull _mt2') }, 'Load More')
    );
  },

  'timeline': () => {
    const events = [
      { title: 'Project launched', status: 'completed', description: 'Initial release deployed to production.', date: 'Mar 1, 2026' },
      { title: 'Beta testing', status: 'completed', description: 'Invited 500 users for beta feedback.', date: 'Feb 15, 2026' },
      { title: 'Design review', status: 'completed', description: 'Final design review with stakeholders.', date: 'Feb 1, 2026' },
      { title: 'Development started', status: null, description: 'Sprint 1 kicked off with core features.', date: 'Jan 15, 2026' }
    ];

    return div({ class: css('_flex _col _gap0 _p4 _borderL _ml4') },
      ...events.map(e =>
        div({ class: css('_flex _gap4 _pb6 _relative') },
          div({ class: css('_absolute _left[-9px] _w[16px] _h[16px] _r[9999px] _bgprimary _b2 _bcborder') }),
          div({ class: css('_flex _col _gap1 _pl4') },
            div({ class: css('_flex _aic _gap2') },
              h4({ class: css('_textsm _bold') }, e.title),
              e.status ? Badge({ variant: e.status === 'completed' ? 'success' : 'default', size: 'sm' }, e.status) : null
            ),
            p({ class: css('_textsm _fgmuted') }, e.description),
            time({ class: css('_textxs _fgmuted') }, e.date)
          )
        )
      )
    );
  },

  'goal-tracker': () => {
    const goals = [
      { label: 'Revenue', current: 840000, target: 1000000, unit: '$', status: 'on-track', trend: [60, 68, 72, 78, 84] },
      { label: 'New Users', current: 3200, target: 5000, unit: '', status: 'at-risk', trend: [20, 24, 26, 28, 32] },
      { label: 'NPS Score', current: 72, target: 80, unit: '', status: 'on-track', trend: [65, 68, 70, 71, 72] }
    ];

    return div({ class: css('_flex _col _gap4 _p4') },
      h3({ class: css('_heading4') }, 'Goal Progress'),
      div({ class: css('_grid _gc3 _gap4') },
        ...goals.map(g =>
          div({ class: css('_flex _col _gap3 _p4 _b1 _r4') },
            div({ class: css('_flex _aic _jcsb') },
              span({ class: css('_textsm _bold') }, g.label),
              Badge({ variant: g.status === 'on-track' ? 'success' : g.status === 'at-risk' ? 'warning' : 'error' }, g.status)
            ),
            Statistic({ label: 'Current', value: g.current, suffix: g.unit }),
            Progress({ value: (g.current / g.target) * 100 }),
            div({ class: css('_flex _aic _jcsb _textxs _fgmuted') },
              span({}, `Target: ${g.target}${g.unit}`),
              span({}, `${Math.round((g.current / g.target) * 100)}%`)
            ),
            g.trend ? (Sparkline ? Sparkline({ data: g.trend, height: 32 }) : sparklineFallback()) : null
          )
        )
      )
    );
  },

  'pipeline-tracker': () => {
    const [activeStage, setActiveStage] = createSignal('all');
    const stages = [
      { id: 'prospect', name: 'Prospect', value: 240000, count: 42 },
      { id: 'qualified', name: 'Qualified', value: 180000, count: 28 },
      { id: 'proposal', name: 'Proposal', value: 95000, count: 12 },
      { id: 'negotiation', name: 'Negotiation', value: 62000, count: 6 },
      { id: 'closed', name: 'Closed Won', value: 48000, count: 4 }
    ];
    const items = [
      { name: 'Acme Corp', value: 45000, stage: 'proposal', owner: 'Alice' },
      { name: 'Globex Inc', value: 32000, stage: 'qualified', owner: 'Bob' },
      { name: 'Initech', value: 28000, stage: 'negotiation', owner: 'Carol' },
      { name: 'Umbrella Co', value: 18000, stage: 'prospect', owner: 'Dan' }
    ];

    return div({ class: css('_flex _col _gap4 _p4') },
      h3({ class: css('_heading4') }, 'Pipeline'),
      div({ class: css('_flex _gap3 _overflow[auto]') },
        ...stages.map(s =>
          div({ class: css('_flex _col _gap1 _p3 _b1 _r4 _minw[140px] _tc _pointer'),
                onclick: () => setActiveStage(s.id) },
            span({ class: css('_textsm _fgmuted') }, s.name),
            Statistic({ value: s.value, prefix: '$' }),
            Badge({ variant: 'default' }, `${s.count} deals`)
          )
        )
      ),
      Chart
        ? Chart({ type: 'funnel', data: stages, x: 'name', y: 'value', title: 'Conversion Funnel', height: 260 })
        : chartFallback('Conversion Funnel'),
      DataTable({
        columns: [
          { key: 'name', label: 'Deal', sortable: true },
          { key: 'value', label: 'Value', sortable: true },
          { key: 'stage', label: 'Stage' },
          { key: 'owner', label: 'Owner' }
        ],
        data: items,
        sortable: true, paginate: true
      })
    );
  },

  // ── Social / Recipe ──────────────────────────────────────────

  'recipe-card-grid': () => {
    const recipes = [
      { title: 'Spicy Thai Basil Chicken', desc: 'A quick and fiery stir-fry with holy basil, chilies, and garlic.', time: '25 min', servings: 4, tags: ['Thai', 'Spicy'], author: 'Chef Maria', forks: 142 },
      { title: 'Classic Margherita Pizza', desc: 'Simple, fresh, and perfect — San Marzano tomatoes, mozzarella, basil.', time: '45 min', servings: 2, tags: ['Italian', 'Quick'], author: "Tom's Kitchen", forks: 89 },
      { title: 'Lemon Herb Salmon', desc: 'Oven-baked salmon with a bright lemon-dill glaze and roasted vegetables.', time: '30 min', servings: 4, tags: ['Seafood', 'Healthy'], author: 'Lisa Bakes', forks: 63 },
      { title: 'Chocolate Lava Cake', desc: 'Rich, molten-center chocolate cakes that are easier than you think.', time: '35 min', servings: 6, tags: ['Dessert', 'Chocolate'], author: 'Chef Maria', forks: 218 }
    ];

    return div({ class: css('_grid _gc3 _gap4 _p4') },
      ...recipes.map(r =>
        Card({},
          Placeholder({ height: '180px', label: r.title }),
          Card.Body({ class: css('_flex _col _gap2') },
            h3({ class: css('_heading5') }, r.title),
            p({ class: css('_textsm _fgmuted _clamp2') }, r.desc),
            div({ class: css('_flex _gap2 _wrap') },
              ...r.tags.map(t => Chip({ label: t, size: 'sm' }))
            ),
            div({ class: css('_flex _aic _gap3 _textsm _fgmuted') },
              span({ class: css('_flex _aic _gap1') }, icon('clock', { size: 14 }), r.time),
              span({ class: css('_flex _aic _gap1') }, icon('users', { size: 14 }), `${r.servings}`)
            ),
            Separator(),
            div({ class: css('_flex _aic _jcsb') },
              div({ class: css('_flex _aic _gap2') },
                Avatar({ name: r.author, size: 'sm' }),
                span({ class: css('_textsm') }, r.author)
              ),
              Badge({ variant: 'default' }, `${r.forks} forks`)
            )
          )
        )
      )
    );
  },

  'recipe-hero': () => {
    return div({ class: css('_flex _col _gap0 _relative') },
      div({ class: css('_relative') },
        Placeholder({ height: '360px', label: 'Spicy Thai Basil Chicken' }),
        div({ class: css('_absolute _top[16px] _left[16px] _flex _gap2') },
          Button({ variant: 'outline', size: 'sm' }, icon('arrow-left'), 'Back')
        ),
        div({ class: css('_absolute _top[16px] _right[16px] _flex _gap2') },
          Button({ variant: 'outline', size: 'sm' }, icon('edit'))
        )
      ),
      div({ class: css('_flex _col _gap3 _p6') },
        div({ class: css('_flex _gap2 _wrap') },
          Chip({ label: 'Thai' }),
          Chip({ label: 'Spicy' }),
          Chip({ label: 'Quick' })
        ),
        h1({ class: css('_heading2') }, 'Spicy Thai Basil Chicken'),
        p({ class: css('_body _fgmuted _mw[640px]') }, 'A quick and fiery stir-fry with holy basil, fresh chilies, and garlic served over jasmine rice. Ready in under 30 minutes.')
      )
    );
  },

  'recipe-stats-bar': () => {
    const stats = [
      { label: 'Prep', value: '10 min', ic: 'clock' },
      { label: 'Cook', value: '15 min', ic: 'flame' },
      { label: 'Servings', value: '4', ic: 'users' },
      { label: 'Difficulty', value: 'Medium', ic: 'bar-chart' }
    ];

    return div({ class: css('_flex _col _gap4 _p4') },
      div({ class: css('_flex _aic _jcsb _wrap _gap4') },
        div({ class: css('_flex _gap6') },
          ...stats.map(s =>
            div({ class: css('_flex _aic _gap2') },
              icon(s.ic, { size: 16, class: css('_fgmuted') }),
              div({ class: css('_flex _col') },
                span({ class: css('_textxs _fgmuted') }, s.label),
                span({ class: css('_textsm _bold') }, s.value)
              )
            )
          )
        ),
        div({ class: css('_flex _gap2') },
          Button({ variant: 'outline', size: 'sm' }, icon('git-fork'), 'Fork'),
          Button({ variant: 'outline', size: 'sm' }, icon('bookmark'), 'Save'),
          Button({ variant: 'outline', size: 'sm' }, icon('share'), 'Share')
        )
      ),
      Separator()
    );
  },

  'recipe-ingredients': () => {
    const ingredients = [
      '500g chicken thigh, sliced',
      '2 cups Thai holy basil leaves',
      '4 cloves garlic, minced',
      '3 Thai chilies, sliced',
      '2 tbsp oyster sauce',
      '1 tbsp fish sauce'
    ];

    return Card({},
      Card.Header({},
        div({ class: css('_flex _aic _gap2') },
          icon('list', { size: 18 }),
          h3({ class: css('_heading5') }, 'Ingredients')
        )
      ),
      Card.Body({ class: css('_flex _col _gap2') },
        ...ingredients.map(ing =>
          Checkbox({ label: ing })
        )
      )
    );
  },

  'recipe-instructions': () => {
    const steps = [
      { text: 'Heat oil in a wok over high heat until smoking.', time: null },
      { text: 'Add garlic and chilies, stir-fry for 30 seconds until fragrant.', time: '30 sec' },
      { text: 'Add chicken and stir-fry until cooked through, about 5 minutes.', time: '5 min' },
      { text: 'Add oyster sauce, fish sauce, and sugar. Toss to combine.', time: null },
      { text: 'Remove from heat, fold in basil leaves until just wilted. Serve over rice.', time: null }
    ];

    return Card({},
      Card.Header({},
        div({ class: css('_flex _aic _gap2') },
          icon('book-open', { size: 18 }),
          h3({ class: css('_heading5') }, 'Instructions')
        )
      ),
      Card.Body({ class: css('_flex _col _gap4') },
        ...steps.map((step, i) =>
          div({ class: css('_flex _gap3') },
            Badge({ variant: 'primary' }, `${i + 1}`),
            div({ class: css('_flex _col _gap1 _flex1') },
              p({ class: css('_textsm') }, step.text),
              step.time ? span({ class: css('_textxs _fgmuted _flex _aic _gap1') }, icon('clock', { size: 12 }), step.time) : null
            )
          )
        )
      )
    );
  },

  'nutrition-card': () => {
    return Card({},
      Card.Header({},
        div({ class: css('_flex _aic _gap2') },
          icon('activity', { size: 18 }),
          h3({ class: css('_heading5') }, 'Nutrition per Serving')
        )
      ),
      Card.Body({},
        div({ class: css('_grid _gc2 _gap4') },
          Statistic({ label: 'Calories', value: 420, suffix: ' kcal' }),
          Statistic({ label: 'Protein', value: 38, suffix: 'g' }),
          Statistic({ label: 'Carbs', value: 12, suffix: 'g' }),
          Statistic({ label: 'Fat', value: 24, suffix: 'g' })
        )
      )
    );
  },

  'recipe-form-simple': () => {
    const [ingredients, setIngredients] = createSignal(['', '', '']);
    const [steps, setSteps] = createSignal(['', '']);

    return div({ class: css('_flex _col _gap6 _p4 _mw[720px]') },
      Upload({ label: 'Recipe Photo', accept: 'image/*' }),

      Card({},
        Card.Header({}, h3({ class: css('_heading5') }, 'Basic Info')),
        Card.Body({ class: css('_flex _col _gap3') },
          Input({ label: 'Recipe Title', placeholder: 'e.g. Spicy Thai Basil Chicken' }),
          Textarea({ label: 'Description', placeholder: 'A short description of your recipe...', rows: 3 })
        )
      ),

      Card({},
        Card.Header({}, h3({ class: css('_heading5') }, 'Details')),
        Card.Body({ class: css('_grid _gc3 _gap4') },
          InputNumber({ label: 'Prep Time (min)', min: 0, value: 10 }),
          InputNumber({ label: 'Cook Time (min)', min: 0, value: 20 }),
          InputNumber({ label: 'Servings', min: 1, value: 4 }),
        ),
        Card.Body({},
          Segmented({ value: 'medium', options: [
            { label: 'Easy', value: 'easy' },
            { label: 'Medium', value: 'medium' },
            { label: 'Hard', value: 'hard' }
          ] })
        )
      ),

      Collapsible({ title: 'Backstory (optional)' },
        Textarea({ placeholder: 'Share the story behind this recipe...', rows: 4 })
      ),

      Card({},
        Card.Header({ class: css('_flex _aic _jcsb') },
          h3({ class: css('_heading5') }, 'Ingredients'),
          Button({ variant: 'outline', size: 'sm', onclick: () => setIngredients([...ingredients(), '']) }, icon('plus'), 'Add')
        ),
        Card.Body({ class: css('_flex _col _gap2') },
          ...ingredients().map((_, i) =>
            Input({ placeholder: `Ingredient ${i + 1}`, value: ingredients()[i] })
          )
        )
      ),

      Card({},
        Card.Header({ class: css('_flex _aic _jcsb') },
          h3({ class: css('_heading5') }, 'Instructions'),
          Button({ variant: 'outline', size: 'sm', onclick: () => setSteps([...steps(), '']) }, icon('plus'), 'Add Step')
        ),
        Card.Body({ class: css('_flex _col _gap3') },
          ...steps().map((_, i) =>
            div({ class: css('_flex _gap3 _aic') },
              Badge({ variant: 'primary' }, `${i + 1}`),
              Textarea({ placeholder: `Step ${i + 1}...`, rows: 2, class: css('_flex1') })
            )
          )
        )
      ),

      div({ class: css('_flex _jcfe _gap3') },
        Button({ variant: 'outline' }, 'Save Draft'),
        Button({ variant: 'primary' }, icon('send'), 'Publish Recipe')
      )
    );
  },

  'recipe-form-chef': () => {
    const [ingredients, setIngredients] = createSignal([
      { qty: 500, unit: 'g', name: 'chicken thigh', prep: 'sliced' },
      { qty: 2, unit: 'cups', name: 'holy basil', prep: 'leaves only' },
      { qty: 4, unit: 'cloves', name: 'garlic', prep: 'minced' }
    ]);
    const [sections, setSections] = createSignal([
      { title: 'Preparation', steps: [{ text: 'Prep all ingredients', time: 10 }] },
      { title: 'Cooking', steps: [{ text: 'Heat wok over high heat', time: 1 }, { text: 'Stir-fry chicken', time: 5 }] }
    ]);

    return div({ class: css('_flex _col _gap6 _p4 _mw[800px]') },
      Upload({ label: 'Hero Photo', accept: 'image/*' }),

      Card({},
        Card.Header({}, h3({ class: css('_heading5') }, 'Basics')),
        Card.Body({ class: css('_flex _col _gap3') },
          Input({ label: 'Title', placeholder: 'Recipe title' }),
          Textarea({ label: 'Description', placeholder: 'Brief description...', rows: 2 }),
          div({ class: css('_grid _gc3 _gap4') },
            InputNumber({ label: 'Prep (min)', min: 0, value: 10 }),
            InputNumber({ label: 'Cook (min)', min: 0, value: 15 }),
            InputNumber({ label: 'Servings', min: 1, value: 4 })
          ),
          Segmented({ value: 'medium', options: [
            { label: 'Easy', value: 'easy' },
            { label: 'Medium', value: 'medium' },
            { label: 'Hard', value: 'hard' }
          ] })
        )
      ),

      Card({},
        Card.Header({ class: css('_flex _aic _jcsb') },
          h3({ class: css('_heading5') }, 'Structured Ingredients'),
          Button({ variant: 'outline', size: 'sm', onclick: () => setIngredients([...ingredients(), { qty: 1, unit: '', name: '', prep: '' }]) }, icon('plus'), 'Add')
        ),
        Card.Body({ class: css('_flex _col _gap3') },
          div({ class: css('_grid _gc4 _gap2 _textsm _fgmuted _bold') },
            span({}, 'Qty'), span({}, 'Unit'), span({}, 'Ingredient'), span({}, 'Prep')
          ),
          ...ingredients().map(ing =>
            div({ class: css('_grid _gc4 _gap2') },
              InputNumber({ value: ing.qty, min: 0, size: 'sm' }),
              Select({ value: ing.unit, size: 'sm', options: [
                { label: 'g', value: 'g' }, { label: 'cups', value: 'cups' },
                { label: 'tbsp', value: 'tbsp' }, { label: 'tsp', value: 'tsp' },
                { label: 'cloves', value: 'cloves' }, { label: 'pcs', value: 'pcs' }
              ] }),
              Input({ value: ing.name, size: 'sm', placeholder: 'Name' }),
              Input({ value: ing.prep, size: 'sm', placeholder: 'Prep notes' })
            )
          )
        )
      ),

      Card({},
        Card.Header({ class: css('_flex _aic _jcsb') },
          h3({ class: css('_heading5') }, 'Instructions by Section'),
          Button({ variant: 'outline', size: 'sm', onclick: () => setSections([...sections(), { title: '', steps: [{ text: '', time: 0 }] }]) }, icon('plus'), 'Add Section')
        ),
        Card.Body({ class: css('_flex _col _gap6') },
          ...sections().map((sec, si) =>
            div({ class: css('_flex _col _gap3 _pl4 _borderL') },
              Input({ value: sec.title, placeholder: 'Section title', size: 'sm', class: css('_bold') }),
              ...sec.steps.map((step, stepIdx) =>
                div({ class: css('_flex _gap3 _aic') },
                  Badge({ variant: 'primary' }, `${si + 1}.${stepIdx + 1}`),
                  Input({ value: step.text, placeholder: 'Step description...', class: css('_flex1') }),
                  InputNumber({ value: step.time, min: 0, size: 'sm', class: css('_w[100px]') }),
                  span({ class: css('_textxs _fgmuted') }, 'min')
                )
              )
            )
          )
        )
      ),

      div({ class: css('_flex _jcfe _gap3') },
        Button({ variant: 'outline' }, 'Save Draft'),
        Button({ variant: 'primary' }, icon('send'), 'Publish')
      )
    );
  },

  'photo-to-recipe': () => {
    const [analyzing] = createSignal(false);

    return div({ class: css('_grid _gc2 _gap6 _p4') },
      Card({},
        Card.Header({},
          div({ class: css('_flex _aic _gap2') },
            icon('camera', { size: 18 }),
            h3({ class: css('_heading5') }, 'Upload Photo')
          )
        ),
        Card.Body({ class: css('_flex _col _gap4') },
          Upload({ label: 'Drop a food photo here', accept: 'image/*' }),
          Button({ variant: 'primary', class: css('_wfull'), disabled: analyzing() },
            analyzing() ? Spinner({ size: 'sm' }) : icon('sparkles'),
            analyzing() ? 'Analyzing...' : 'Analyze Photo'
          )
        )
      ),

      Card({},
        Card.Header({},
          div({ class: css('_flex _aic _gap2') },
            icon('sparkles', { size: 18 }),
            h3({ class: css('_heading5') }, 'AI-Generated Recipe')
          )
        ),
        Card.Body({ class: css('_flex _col _gap4') },
          div({ class: css('_flex _col _gap2 _fgmuted _tc _py8') },
            icon('image', { size: 32, class: css('_mxa _fgmuted') }),
            p({ class: css('_textsm') }, 'Upload a photo to generate a recipe')
          ),
          Separator(),
          Placeholder({ height: '200px', label: 'Generated recipe will appear here' })
        )
      )
    );
  },

  'chat-interface': () => {
    const [message, setMessage] = createSignal('');
    const messages = [
      { role: 'user', name: 'You', text: 'How do I make the sauce thicker?' },
      { role: 'assistant', name: 'Chef AI', text: 'You can thicken the sauce by adding a cornstarch slurry — mix 1 tbsp cornstarch with 2 tbsp cold water, then stir it into the sauce while simmering. It should thicken within 1-2 minutes.' },
      { role: 'user', name: 'You', text: 'Can I substitute chicken with tofu?' }
    ];
    const suggestions = ['Serving suggestions', 'Wine pairings', 'Make it spicier', 'Meal prep tips'];

    return Card({ class: css('_flex _col _h[480px]') },
      Card.Header({},
        div({ class: css('_flex _aic _gap2') },
          icon('message-circle', { size: 18 }),
          h3({ class: css('_heading5') }, 'Recipe Assistant')
        )
      ),
      Card.Body({ class: css('_flex _col _flex1 _overflow[hidden]') },
        ScrollArea({ class: css('_flex1') },
          div({ class: css('_flex _col _gap4 _p2') },
            ...messages.map(msg =>
              div({ class: css(`_flex _gap3 ${msg.role === 'user' ? '_jcfe' : ''}`) },
                msg.role !== 'user' ? Avatar({ name: msg.name, size: 'sm' }) : null,
                div({ class: css(`_flex _col _gap1 _mw[75%] _p3 _r4 ${msg.role === 'user' ? '_bgprimary _fgprimary-fg' : '_bgmuted'}`) },
                  span({ class: css('_textxs _bold') }, msg.name),
                  p({ class: css('_textsm') }, msg.text)
                ),
                msg.role === 'user' ? Avatar({ name: msg.name, size: 'sm' }) : null
              )
            )
          )
        ),
        div({ class: css('_flex _gap2 _wrap _px2 _py2') },
          ...suggestions.map(s =>
            Chip({ label: s, variant: 'outline', size: 'sm' })
          )
        )
      ),
      Card.Footer({ class: css('_flex _gap2') },
        Input({ placeholder: 'Ask about the recipe...', value: message, onchange: e => setMessage(e.target.value), class: css('_flex1') }),
        Button({ variant: 'primary' }, icon('send'))
      )
    );
  },

  'cookbook-grid': () => {
    const cookbooks = [
      { title: 'Italian Classics', desc: 'Traditional recipes passed down through generations.', recipes: 24, visibility: 'public' },
      { title: 'Quick Weeknight Dinners', desc: 'Meals ready in 30 minutes or less.', recipes: 18, visibility: 'public' },
      { title: 'Baking Essentials', desc: 'Breads, pastries, and desserts for every occasion.', recipes: 32, visibility: 'private' },
      { title: 'Summer Grilling', desc: 'Fire up the grill with these crowd-pleasers.', recipes: 15, visibility: 'public' }
    ];

    return div({ class: css('_grid _gc3 _gap4 _p4') },
      ...cookbooks.map(cb =>
        Card({},
          Placeholder({ height: '160px', label: cb.title }),
          Card.Body({ class: css('_flex _col _gap2') },
            div({ class: css('_flex _aic _jcsb') },
              h3({ class: css('_heading5') }, cb.title),
              Badge({ variant: cb.visibility === 'public' ? 'success' : 'default' }, cb.visibility)
            ),
            p({ class: css('_textsm _fgmuted _clamp2') }, cb.desc),
            span({ class: css('_textxs _fgmuted') }, `${cb.recipes} recipes`)
          )
        )
      )
    );
  },

  'cookbook-hero': () => {
    return div({ class: css('_flex _col _gap0 _relative') },
      div({ class: css('_relative') },
        Placeholder({ height: '280px', label: 'Italian Classics' }),
        div({ class: css('_absolute _top[16px] _right[16px] _flex _gap2') },
          Button({ variant: 'outline', size: 'sm' }, icon('edit'), 'Edit'),
          Button({ variant: 'outline', size: 'sm' }, icon('trash'))
        )
      ),
      div({ class: css('_flex _col _gap3 _p6') },
        div({ class: css('_flex _aic _gap3') },
          h1({ class: css('_heading2') }, 'Italian Classics'),
          Badge({ variant: 'success' }, 'Public')
        ),
        Badge({ variant: 'default' }, '24 recipes'),
        div({ class: css('_flex _aic _gap3 _mt2') },
          Avatar({ name: 'Chef Maria', size: 'sm' }),
          span({ class: css('_textsm') }, 'Curated by Chef Maria')
        )
      )
    );
  },

  'profile-header': () => {
    return div({ class: css('_flex _col _gap0') },
      Placeholder({ height: '200px', label: 'Cover Photo' }),
      div({ class: css('_flex _col _gap4 _px6 _pb6') },
        div({ class: css('_flex _aic _jcsb') },
          div({ class: css('_mt[-40px]') },
            Avatar({ name: 'Chef Maria', size: 'lg' })
          ),
          Button({ variant: 'outline', size: 'sm' }, icon('edit'), 'Edit Profile')
        ),
        div({ class: css('_flex _col _gap2') },
          h2({ class: css('_heading3') }, 'Chef Maria'),
          p({ class: css('_textsm _fgmuted _mw[480px]') }, 'Professional chef and recipe creator. Sharing my passion for Italian and Thai cuisine with the world.'),
          div({ class: css('_flex _gap4 _textsm _fgmuted') },
            span({ class: css('_flex _aic _gap1') }, icon('map-pin', { size: 14 }), 'San Francisco, CA'),
            span({ class: css('_flex _aic _gap1') }, icon('link', { size: 14 }), 'chefmaria.com')
          )
        )
      )
    );
  },

  'feature-grid': () => {
    const features = [
      { ic: 'book-open', title: 'Recipe Collections', desc: 'Organize recipes into themed cookbooks and share with friends.' },
      { ic: 'camera', title: 'Photo Recognition', desc: 'Snap a photo of any dish and get an instant AI-generated recipe.' },
      { ic: 'git-fork', title: 'Fork & Remix', desc: 'Fork any recipe to make it your own with personal modifications.' },
      { ic: 'users', title: 'Community', desc: 'Follow chefs, share tips, and discover trending recipes.' },
      { ic: 'message-circle', title: 'AI Assistant', desc: 'Ask questions about any recipe and get instant cooking advice.' },
      { ic: 'calendar', title: 'Meal Planning', desc: 'Plan your weekly meals and generate smart shopping lists.' }
    ];

    return div({ class: css('_grid _gc3 _gap4 _p4') },
      ...features.map(f =>
        Card({},
          Card.Body({ class: css('_flex _col _gap3') },
            div({ class: css('_w[40px] _h[40px] _r[9999px] _bgprimary/10 _flex _aic _jcc') },
              icon(f.ic, { size: 20, class: css('_fgprimary') })
            ),
            h3({ class: css('_heading5') }, f.title),
            p({ class: css('_textsm _fgmuted') }, f.desc)
          )
        )
      )
    );
  }
};

// ─── Aliases for consolidated v2 patterns ───────────────────────
// Old domain-specific pattern IDs now map to generic patterns with presets.
// We keep the old keys so the workbench can still render examples for both
// the old IDs (referenced in existing archetypes) and the new generic IDs.
PATTERN_EXAMPLES['card-grid'] = PATTERN_EXAMPLES['product-grid'];
PATTERN_EXAMPLES['stats-bar'] = PATTERN_EXAMPLES['recipe-stats-bar'];
PATTERN_EXAMPLES['checklist-card'] = PATTERN_EXAMPLES['recipe-ingredients'];
PATTERN_EXAMPLES['steps-card'] = PATTERN_EXAMPLES['recipe-instructions'];
PATTERN_EXAMPLES['stat-card'] = PATTERN_EXAMPLES['nutrition-card'];

// ─── Public API ─────────────────────────────────────────────────

export function renderPatternExample(patternId) {
  const renderer = PATTERN_EXAMPLES[patternId];
  if (!renderer) return null;
  try {
    return renderer();
  } catch (err) {
    return div({ class: css('_p4 _bgmuted/10 _radius _fgmutedfg _body') },
      `Preview unavailable: ${err.message}`
    );
  }
}

export function hasPatternExample(patternId) {
  return patternId in PATTERN_EXAMPLES;
}
