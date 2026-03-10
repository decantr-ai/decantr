import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Button, icon } from 'decantr/components';
import { Sidebar, DashboardHeader, StatsGrid, KPICard, ActivityFeed, ChartPlaceholder } from 'decantr/kit/dashboard';
import { LoginForm, RegisterForm, ForgotPasswordForm } from 'decantr/kit/auth';
import { AuthorCard, TableOfContents, PostList, CategoryNav } from 'decantr/kit/content';
import { SectionHeader, DemoGroup } from './_shared.js';

const { div, section, p, h4 } = tags;

// ─── Dashboard Kit ──────────────────────────────────────────────

function DashboardKitDemo() {
  const statsItems = [
    { title: 'Total Users', value: '12,847', change: '+12.5%', status: 'success' },
    { title: 'Revenue', value: '$48.2k', change: '+8.3%', status: 'success' },
    { title: 'Active Sessions', value: '1,429', change: '-2.1%', status: 'error' },
    { title: 'Conversion', value: '3.24%', change: '+0.8%', status: 'success' }
  ];

  const activityItems = [
    { user: 'Alice', action: 'deployed v2.4.1 to production', time: '2 min ago' },
    { user: 'Bob', action: 'merged PR #847', time: '15 min ago' },
    { user: 'Carol', action: 'created issue #233', time: '1 hour ago' },
    { user: 'Dave', action: 'updated billing plan to Pro', time: '3 hours ago' }
  ];

  return div({ class: css('_flex _col _gap6') },
    DemoGroup('StatsGrid', 'Dashboard statistics grid with trend indicators.',
      StatsGrid({ items: statsItems })
    ),

    DemoGroup('KPICard', 'Individual KPI metric card.',
      div({ class: css('_grid _gc3 _gap4') },
        KPICard({ title: 'MRR', value: '$48,200', change: '+8.3%', status: 'success' }),
        KPICard({ title: 'Churn Rate', value: '2.1%', change: '-0.3%', status: 'error' }),
        KPICard({ title: 'NPS Score', value: '72', change: '+5', status: 'success' })
      )
    ),

    DemoGroup('ActivityFeed', 'Recent activity timeline.',
      div({ style: { maxWidth: '480px' } },
        ActivityFeed({ items: activityItems })
      )
    ),

    DemoGroup('ChartPlaceholder', 'Placeholder for chart integration points.',
      div({ class: css('_grid _gc2 _gap4') },
        ChartPlaceholder({ title: 'Revenue Over Time', height: '200px' }),
        ChartPlaceholder({ title: 'User Growth', height: '200px' })
      )
    ),

    DemoGroup('DashboardHeader', 'Top bar with title and optional search/notifications.',
      DashboardHeader({
        title: 'Analytics',
        search: true,
        notifications: true
      })
    ),

    DemoGroup('Sidebar', 'Navigation sidebar with sections and items.',
      div({ style: { maxWidth: '260px', height: '360px', position: 'relative' } },
        Sidebar({
          branding: 'MyApp',
          nav: [
            { label: 'Dashboard', icon: 'home', href: '/dashboard' },
            { label: 'Analytics', icon: 'bar-chart-2', href: '/analytics' },
            { label: 'Users', icon: 'users', href: '/users' },
            { label: 'Settings', icon: 'settings', href: '/settings' }
          ]
        })
      )
    )
  );
}

// ─── Auth Kit ────────────────────────────────────────────────────

function AuthKitDemo() {
  return div({ class: css('_flex _col _gap6') },
    DemoGroup('LoginForm', 'Email/password login with remember-me and forgot link.',
      div({ style: { maxWidth: '400px' } },
        LoginForm({
          onSubmit: (data) => console.log('Login:', data)
        })
      )
    ),

    DemoGroup('RegisterForm', 'Sign-up form with name, email, password, and confirm.',
      div({ style: { maxWidth: '400px' } },
        RegisterForm({
          onSubmit: (data) => console.log('Register:', data)
        })
      )
    ),

    DemoGroup('ForgotPasswordForm', 'Password reset request form.',
      div({ style: { maxWidth: '400px' } },
        ForgotPasswordForm({
          onSubmit: (email) => console.log('Reset:', email)
        })
      )
    )
  );
}

// ─── Content Kit ─────────────────────────────────────────────────

function ContentKitDemo() {
  const samplePosts = [
    { title: 'Understanding the Token System', excerpt: 'Deep dive into seed-derived tokens and personality presets.', date: 'Mar 8', href: '#', author: 'Jane Doe' },
    { title: 'Building Custom Styles', excerpt: 'How to create and register your own visual personality.', date: 'Mar 5', href: '#', author: 'Jane Doe' },
    { title: 'Component Lifecycle Guide', excerpt: 'Cleanup contracts and behavioral primitives.', date: 'Mar 1', href: '#', author: 'Jane Doe' }
  ];

  const categories = [
    { id: 'all', label: 'All', count: 12 },
    { id: 'arch', label: 'Architecture', count: 4 },
    { id: 'theme', label: 'Theming', count: 3 },
    { id: 'comp', label: 'Components', count: 5 }
  ];

  return div({ class: css('_flex _col _gap6') },
    DemoGroup('AuthorCard', 'Author attribution card.',
      div({ style: { maxWidth: '320px' } },
        AuthorCard({
          name: 'Jane Doe',
          bio: 'Building the future of AI-first web development.'
        })
      )
    ),

    DemoGroup('PostList', 'Blog post listing with excerpts.',
      div({ style: { maxWidth: '600px' } },
        PostList({ posts: samplePosts })
      )
    ),

    DemoGroup('CategoryNav', 'Category filter navigation.',
      CategoryNav({ categories, active: 'all' })
    ),

    DemoGroup('TableOfContents', 'Auto-generated table of contents.',
      div({ style: { maxWidth: '280px' } },
        TableOfContents({
          headings: [
            { id: 'intro', text: 'Introduction', level: 1 },
            { id: 'install', text: 'Installation', level: 1 },
            { id: 'npm', text: 'Via npm', level: 2 },
            { id: 'cdn', text: 'Via CDN', level: 2 },
            { id: 'usage', text: 'Basic Usage', level: 1 },
            { id: 'advanced', text: 'Advanced Topics', level: 1 }
          ]
        })
      )
    )
  );
}

// ─── Main Export ─────────────────────────────────────────────────

export function KitsSection() {
  return section({ id: 'kits', class: css('_flex _col _gap10') },
    SectionHeader('Domain Kits', 'Higher-level components composed from primitives for common application patterns.'),

    h4({ class: css('_textxl _fwheading _lhsnug _mt4') }, 'Dashboard Kit'),
    p({ class: css('_textsm _fg4 _mb2') }, 'Sidebar, headers, stats, KPIs, activity feeds, and chart placeholders.'),
    DashboardKitDemo(),

    h4({ class: css('_textxl _fwheading _lhsnug _mt8') }, 'Auth Kit'),
    p({ class: css('_textsm _fg4 _mb2') }, 'Login, register, and forgot-password forms with validation.'),
    AuthKitDemo(),

    h4({ class: css('_textxl _fwheading _lhsnug _mt8') }, 'Content Kit'),
    p({ class: css('_textsm _fg4 _mb2') }, 'Article layouts, author cards, post lists, and navigation.'),
    ContentKitDemo()
  );
}
