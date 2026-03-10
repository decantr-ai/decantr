import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Card, Badge, Table, Avatar, Progress, Skeleton, Chip, Tag, Descriptions, Statistic, Empty, Button, DataTable, icon } from 'decantr/components';
import { SectionHeader, DemoGroup, DemoRow } from './_shared.js';

const { div, section, h3, p, span, small } = tags;

function DemoCard(title, ...children) {
  return Card({},
    Card.Header({}, span({ class: css('_fwtitle _textbase') }, title)),
    Card.Body({}, ...children)
  );
}

export function DisplaySection() {

  return section({ id: 'display', class: css('_flex _col _gap10') },
    SectionHeader('Display Components', 'Cards, badges, tables, stats, avatars, progress, and more.'),

    // ── Cards ──────────────────────────────────────────────────────
    DemoGroup('Card', 'Composable containers with Header, Body, and Footer slots.',
      div({ class: css('_grid _gc3 _gap4') },
        Card({},
          Card.Header({},
            div({ class: css('_flex _aic _jcsb') },
              span({ class: css('_fwtitle') }, 'Team Overview'),
              Badge({ count: 4 })
            )
          ),
          Card.Body({},
            p({ class: css('_textbase _fg4 _lhrelaxed') }, 'Manage your team members, roles, and permissions from a single dashboard.'),
            div({ class: css('_flex _gap2 _mt3') },
              Avatar({ size: 'sm', fallback: 'AJ' }),
              Avatar({ size: 'sm', fallback: 'BK' }),
              Avatar({ size: 'sm', fallback: 'CL' }),
              span({ class: css('_textsm _fg4 _asc') }, '+2 more')
            )
          ),
          Card.Footer({},
            div({ class: css('_flex _gap2') },
              Button({ variant: 'primary', size: 'sm' }, 'Manage'),
              Button({ variant: 'ghost', size: 'sm' }, 'View All')
            )
          )
        ),

        Card({ hoverable: true },
          Card.Header({},
            div({ class: css('_flex _aic _gap2') },
              icon('trending-up'),
              span({ class: css('_fwtitle') }, 'Growth')
            )
          ),
          Card.Body({},
            div({ class: css('_flex _col _gap1') },
              span({ class: css('_text2xl _fwheading') }, '+24.5%'),
              span({ class: css('_textsm _fg4') }, 'Revenue increase from last quarter')
            )
          )
        ),

        Card({ title: 'Quick Stats' },
          div({ class: css('_flex _col _gap3') },
            div({ class: css('_flex _jcsb _aic') },
              span({ class: css('_textsm _fg4') }, 'Uptime'),
              span({ class: css('_textsm _fwtitle'), style: 'color:var(--d-success)' }, '99.9%')
            ),
            Progress({ value: 99.9 }),
            div({ class: css('_flex _jcsb _aic') },
              span({ class: css('_textsm _fg4') }, 'Storage'),
              span({ class: css('_textsm _fwtitle') }, '68%')
            ),
            Progress({ value: 68, variant: 'warning' }),
            div({ class: css('_flex _jcsb _aic') },
              span({ class: css('_textsm _fg4') }, 'Errors'),
              span({ class: css('_textsm _fwtitle'), style: 'color:var(--d-error)' }, '3')
            ),
            Progress({ value: 12, variant: 'error' })
          )
        )
      )
    ),

    // ── Badge ──────────────────────────────────────────────────────
    DemoGroup('Badge', 'Status dots, count indicators, and superscript badges on any element.',
      div({ class: css('_flex _col _gap4') },
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Status Dots'),
          DemoRow(
            Badge({ dot: true, status: 'success' }, span({}, 'Online')),
            Badge({ dot: true, status: 'error' }, span({}, 'Offline')),
            Badge({ dot: true, status: 'warning' }, span({}, 'Idle')),
            Badge({ dot: true, status: 'processing' }, span({}, 'Syncing'))
          )
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Count Badges'),
          DemoRow(
            Badge({ count: 3 }, Button({ variant: 'secondary' }, icon('mail'), 'Inbox')),
            Badge({ count: 12 }, Button({ variant: 'secondary' }, icon('bell'), 'Alerts')),
            Badge({ count: 99 }, Avatar({ fallback: 'JD' })),
            Badge({ dot: true, status: 'success' }, Avatar({ fallback: 'AK' }))
          )
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Standalone'),
          DemoRow(
            Badge({ count: 5 }),
            Badge({ count: 42 }),
            Badge({ count: 100 }),
            Badge({ color: 'var(--d-success)', count: 7 }),
            Badge({ color: 'var(--d-warning)', count: 3 }),
            Badge({ color: 'var(--d-error)', count: 1 })
          )
        )
      )
    ),

    // ── Tag ────────────────────────────────────────────────────────
    DemoGroup('Tag', 'Color-coded labels with optional close and check behavior.',
      div({ class: css('_flex _col _gap4') },
        DemoRow(
          Tag({}, 'Default'),
          Tag({ color: 'var(--d-primary)' }, 'Primary'),
          Tag({ color: 'var(--d-success)' }, 'Success'),
          Tag({ color: 'var(--d-warning)' }, 'Warning'),
          Tag({ color: 'var(--d-error)' }, 'Error'),
          Tag({ color: 'var(--d-info)' }, 'Info'),
          Tag({ color: 'var(--d-accent)' }, 'Accent')
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Interactive Tags'),
          DemoRow(
            Tag({ closable: true, onClose: () => {} }, 'Removable'),
            Tag({ closable: true, color: 'var(--d-primary)', onClose: () => {} }, 'Close Me'),
            Tag({ checkable: true, checked: true }, 'Checked'),
            Tag({ checkable: true }, 'Unchecked')
          )
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Checkable Group'),
          Tag.CheckableGroup({
            items: [
              { label: 'Design', value: 'design' },
              { label: 'Frontend', value: 'frontend' },
              { label: 'Backend', value: 'backend' },
              { label: 'DevOps', value: 'devops' },
              { label: 'Mobile', value: 'mobile' }
            ],
            value: ['design', 'frontend'],
            onChange: () => {}
          })
        )
      )
    ),

    // ── Statistic ──────────────────────────────────────────────────
    DemoGroup('Statistic', 'Highlighted numerical data with labels, trends, and formatting.',
      div({ class: css('_grid _gc4 _gap4') },
        Card({},
          Card.Body({},
            Statistic({ label: 'Total Users', value: 284019, groupSeparator: ',' })
          )
        ),
        Card({},
          Card.Body({},
            Statistic({ label: 'Revenue', value: 45230, prefix: '$', precision: 2, groupSeparator: ',' })
          )
        ),
        Card({},
          Card.Body({},
            Statistic({ label: 'Growth', value: 12.5, suffix: '%', trend: 'up', trendValue: '+2.3% from last month' })
          )
        ),
        Card({},
          Card.Body({},
            Statistic({ label: 'Bounce Rate', value: 3.2, suffix: '%', trend: 'down', trendValue: '-0.5% from last week' })
          )
        )
      )
    ),

    // ── Table ──────────────────────────────────────────────────────
    DemoGroup('Table', 'Data table with striped rows, hover states, and custom cell rendering.',
      Table({
        columns: [
          { key: 'name', label: 'Name', render: (v, row) => {
            const el = div({ class: css('_flex _aic _gap2') });
            el.appendChild(Avatar({ size: 'sm', fallback: v.split(' ').map(s => s[0]).join('') }));
            el.appendChild(span({ class: css('_fwtitle') }, v));
            return el;
          }},
          { key: 'role', label: 'Role' },
          { key: 'status', label: 'Status', render: v => {
            const color = v === 'Active' ? 'var(--d-success)' : v === 'Away' ? 'var(--d-warning)' : 'var(--d-muted)';
            return Tag({ color }, v);
          }},
          { key: 'tasks', label: 'Tasks', render: v => Progress({ value: v, label: `${v}%`, size: 'sm' }) }
        ],
        data: [
          { name: 'Alice Johnson', role: 'Lead Engineer', status: 'Active', tasks: 87 },
          { name: 'Bob Kim', role: 'Designer', status: 'Away', tasks: 54 },
          { name: 'Carol Martinez', role: 'PM', status: 'Active', tasks: 92 },
          { name: 'Dave Patel', role: 'DevOps', status: 'Offline', tasks: 43 },
          { name: 'Eve Chen', role: 'QA Lead', status: 'Active', tasks: 76 }
        ],
        striped: true,
        hoverable: true
      })
    ),

    // ── Descriptions ───────────────────────────────────────────────
    DemoGroup('Descriptions', 'Key-value display in table or list format.',
      div({ class: css('_grid _gc2 _gap4') },
        Descriptions({
          title: 'User Profile',
          items: [
            { label: 'Full Name', value: 'Alice Johnson' },
            { label: 'Email', value: 'alice@acme.com' },
            { label: 'Role', value: 'Lead Engineer' },
            { label: 'Team', value: 'Frontend Platform' },
            { label: 'Location', value: 'San Francisco, CA' },
            { label: 'Joined', value: 'March 2024' }
          ],
          columns: 2,
          bordered: true
        }),
        Descriptions({
          title: 'Server Info',
          items: [
            { label: 'Hostname', value: 'prod-web-01' },
            { label: 'IP', value: '10.0.1.42' },
            { label: 'OS', value: 'Ubuntu 24.04' },
            { label: 'CPU', value: '8 cores' },
            { label: 'Memory', value: '32 GB' },
            { label: 'Status', value: 'Running' }
          ],
          columns: 2,
          bordered: true,
          layout: 'vertical'
        })
      )
    ),

    // ── Avatar ─────────────────────────────────────────────────────
    DemoGroup('Avatar', 'User avatars with fallback initials and size variants.',
      div({ class: css('_flex _col _gap4') },
        DemoRow(
          Avatar({ size: 'sm', fallback: 'XS' }),
          Avatar({ fallback: 'MD' }),
          Avatar({ size: 'lg', fallback: 'LG' })
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Avatar Stack'),
          div({ class: css('_flex') },
            ...['AJ', 'BK', 'CL', 'DM', 'EN'].map((initials, i) =>
              div({ style: `margin-left:${i > 0 ? '-8px' : '0'};z-index:${5 - i}` },
                Avatar({ fallback: initials })
              )
            )
          )
        )
      )
    ),

    // ── Progress ───────────────────────────────────────────────────
    DemoGroup('Progress', 'Determinate progress bars with labels and color variants.',
      div({ class: css('_grid _gc2 _gap6') },
        div({ class: css('_flex _col _gap3') },
          Progress({ value: 25, label: 'Upload — 25%' }),
          Progress({ value: 60, variant: 'success', label: 'Tests passing — 60%' }),
          Progress({ value: 45, variant: 'warning', label: 'Disk usage — 45%' }),
          Progress({ value: 85, variant: 'error', label: 'CPU load — 85%' })
        ),
        div({ class: css('_flex _col _gap3') },
          Progress({ value: 70, striped: true, label: 'Deploying — 70%' }),
          Progress({ value: 100, variant: 'success', label: 'Complete' }),
          Progress({ value: 33, size: 'sm', label: 'Small' }),
          Progress({ value: 66, size: 'lg', label: 'Large' })
        )
      )
    ),

    // ── Skeleton ───────────────────────────────────────────────────
    DemoGroup('Skeleton', 'Loading placeholders for text, shapes, and complex layouts.',
      div({ class: css('_grid _gc3 _gap4') },
        DemoCard('Text Skeleton',
          Skeleton({ variant: 'text', lines: 4 })
        ),
        DemoCard('Profile Skeleton',
          div({ class: css('_flex _gap3 _aic') },
            Skeleton({ variant: 'circle', width: '48px', height: '48px' }),
            div({ class: css('_flex _col _gap2 _grow') },
              Skeleton({ variant: 'text' }),
              Skeleton({ variant: 'text', width: '60%' })
            )
          )
        ),
        DemoCard('Media Skeleton',
          div({ class: css('_flex _col _gap3') },
            Skeleton({ variant: 'rect', height: '120px' }),
            Skeleton({ variant: 'text' }),
            Skeleton({ variant: 'text', width: '80%' })
          )
        )
      )
    ),

    // ── Chip ───────────────────────────────────────────────────────
    DemoGroup('Chip', 'Compact interactive elements for filters, selections, and tags.',
      div({ class: css('_flex _col _gap4') },
        DemoRow(
          Chip({ label: 'Default' }),
          Chip({ label: 'Outline', variant: 'outline' }),
          Chip({ label: 'Filled', variant: 'filled' }),
          Chip({ label: 'Selected', selected: true }),
          Chip({ label: 'With Icon', icon: icon('star') }),
          Chip({ label: 'Removable', removable: true, onRemove: () => {} }),
          Chip({ label: 'Small', size: 'sm' })
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Filter Pattern'),
          DemoRow(
            Chip({ label: 'All', selected: true, onClick: () => {} }),
            Chip({ label: 'Active', onClick: () => {}, icon: icon('check-circle') }),
            Chip({ label: 'Pending', onClick: () => {}, icon: icon('clock') }),
            Chip({ label: 'Archived', onClick: () => {}, icon: icon('archive') })
          )
        )
      )
    ),

    // ── DataTable ─────────────────────────────────────────────────
    DemoGroup('DataTable', 'Enterprise data grid with sorting, filtering, pagination, selection, expandable rows, and CSV export.',
      DataTable({
        columns: [
          { key: 'name', label: 'Name', sortable: true, filterable: true, render: (v) => {
            const el = div({ class: css('_flex _aic _gap2') });
            el.appendChild(Avatar({ size: 'sm', fallback: v.split(' ').map(s => s[0]).join('') }));
            el.appendChild(span({ class: css('_fwtitle') }, v));
            return el;
          }},
          { key: 'role', label: 'Role', sortable: true, filterable: true },
          { key: 'department', label: 'Department', sortable: true },
          { key: 'status', label: 'Status', sortable: true, render: v => {
            const color = v === 'Active' ? 'var(--d-success)' : v === 'On Leave' ? 'var(--d-warning)' : 'var(--d-muted)';
            return Tag({ color }, v);
          }},
          { key: 'tasks', label: 'Tasks', sortable: true, align: 'right' }
        ],
        data: [
          { name: 'Alice Johnson', role: 'Lead Engineer', department: 'Engineering', status: 'Active', tasks: 87 },
          { name: 'Bob Kim', role: 'Designer', department: 'Design', status: 'On Leave', tasks: 54 },
          { name: 'Carol Martinez', role: 'PM', department: 'Product', status: 'Active', tasks: 92 },
          { name: 'Dave Patel', role: 'DevOps', department: 'Engineering', status: 'Inactive', tasks: 43 },
          { name: 'Eve Chen', role: 'QA Lead', department: 'Engineering', status: 'Active', tasks: 76 },
          { name: 'Frank Lee', role: 'Frontend Dev', department: 'Engineering', status: 'Active', tasks: 61 },
          { name: 'Grace Hopper', role: 'Architect', department: 'Engineering', status: 'Active', tasks: 95 },
          { name: 'Hiro Tanaka', role: 'Data Analyst', department: 'Analytics', status: 'Active', tasks: 38 }
        ],
        pagination: { pageSize: 5 },
        selection: 'multi',
        onSelectionChange: (rows) => {},
        striped: true,
        hoverable: true,
        expandable: true,
        expandRender: (row) => div({ class: css('_p4 _textsm _fg4') },
          p({}, `Full details for ${row.name}: ${row.role} in ${row.department} department with ${row.tasks} active tasks.`)
        ),
        exportable: true,
        rowKey: (r) => r.name
      })
    ),

    // ── Empty ──────────────────────────────────────────────────────
    DemoGroup('Empty', 'Placeholder for empty states with optional actions.',
      div({ class: css('_grid _gc2 _gap4') },
        Card({},
          Card.Body({},
            Empty({ description: 'No projects found' },
              Button({ variant: 'primary', size: 'sm' }, icon('plus'), 'New Project')
            )
          )
        ),
        Card({},
          Card.Body({},
            Empty({ description: 'Your inbox is empty' })
          )
        )
      )
    )
  );
}
