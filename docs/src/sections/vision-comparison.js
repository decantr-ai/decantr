/**
 * Section 3: Vision Comparison — Traditional React vs Decantr Essence
 * Follows code-comparison:vision-split pattern with inline syntax highlighting
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';

const { div, section, h2, p, span, strong, pre } = tags;

// Syntax highlighting colors matching One Dark theme
const SYN = {
  comment: '#888',
  keyword: '#c678dd',
  type: '#e5c07b',
  string: '#98c379',
  func: '#61afef',
  prop: '#e06c75',
  attr: '#d19a66',
  // Decantr brand colors for JSON
  keyTop: '#0AF3EB',    // cyan for top-level keys
  keyNested: '#FE4474', // pink for nested keys
};

// Pre-styled code with syntax highlighting
function ReactCode() {
  const s = (color, text) => span({ style: `color:${color}` }, text);

  return pre({
    class: css('_font[var(--d-font-mono)] _textxs _lh[1.6] _wspre _overflow[hidden] _m0'),
    style: 'color:#666'
  },
    s(SYN.comment, '// Dashboard.tsx - 847 lines'), '\n',
    s(SYN.keyword, 'import'), ' ', s(SYN.type, 'React'), ', { ', s(SYN.type, 'useState, useEffect,'), '\n',
    '  ', s(SYN.type, 'useCallback, useMemo, useContext'), ' }', '\n',
    '  ', s(SYN.keyword, 'from'), ' ', s(SYN.string, "'react'"), ';\n',
    s(SYN.keyword, 'import'), ' { ', s(SYN.type, 'useQuery'), ' } ', s(SYN.keyword, 'from'), ' ', s(SYN.string, "'@tanstack/react-query'"), ';\n',
    s(SYN.keyword, 'import'), ' { ', s(SYN.type, 'Card, Button, Table'), ' } ', s(SYN.keyword, 'from'), ' ', s(SYN.string, "'@shadcn/ui'"), ';\n',
    s(SYN.keyword, 'import'), ' { ', s(SYN.type, 'cn'), ' } ', s(SYN.keyword, 'from'), ' ', s(SYN.string, "'@/lib/utils'"), ';\n',
    s(SYN.keyword, 'import'), ' ', s(SYN.type, 'styles'), ' ', s(SYN.keyword, 'from'), ' ', s(SYN.string, "'./Dashboard.module.css'"), ';\n',
    s(SYN.comment, '// ... 12 more imports'), '\n\n',
    s(SYN.keyword, 'interface'), ' ', s(SYN.type, 'DashboardProps'), ' {\n',
    '  ', s(SYN.prop, 'userId'), ': ', s(SYN.type, 'string'), ';\n',
    '  ', s(SYN.prop, 'config'), ': ', s(SYN.type, 'DashboardConfig'), ';\n',
    '  ', s(SYN.comment, '// ... 8 more props'), '\n',
    '}\n\n',
    s(SYN.keyword, 'export function'), ' ', s(SYN.func, 'Dashboard'), '({...}: ', s(SYN.type, 'DashboardProps'), ') {\n',
    '  ', s(SYN.keyword, 'const'), ' [', s(SYN.prop, 'state'), ', ', s(SYN.prop, 'setState'), '] = ', s(SYN.func, 'useState'), '();\n',
    '  ', s(SYN.keyword, 'const'), ' { ', s(SYN.prop, 'data'), ' } = ', s(SYN.func, 'useQuery'), '({...});\n',
    '  ', s(SYN.comment, '// ... 200+ lines of hooks'), '\n\n',
    '  ', s(SYN.keyword, 'return'), ' (\n',
    '    <', s(SYN.prop, 'div'), ' ', s(SYN.attr, 'className'), '={', s(SYN.func, 'cn'), '(\n',
    '      ', s(SYN.string, '"flex flex-col gap-4"'), ',\n',
    '      ', s(SYN.type, 'styles'), '.', s(SYN.prop, 'container'), '\n',
    '    )}>\n',
    '      ', s(SYN.comment, '// ... 400+ lines of JSX')
  );
}

function EssenceCode() {
  const s = (color, text) => span({ style: `color:${color}` }, text);

  return pre({
    class: css('_font[var(--d-font-mono)] _textsm _lh[1.8] _wspre _m0'),
    style: 'color:#888'
  },
    s(SYN.comment, '// decantr.essence.json'), '\n',
    '{\n',
    '  ', s(SYN.keyTop, '"terroir"'), ': ', s(SYN.string, '"saas-dashboard"'), ',\n',
    '  ', s(SYN.keyTop, '"vintage"'), ': {\n',
    '    ', s(SYN.keyNested, '"style"'), ': ', s(SYN.string, '"auradecantism"'), ',\n',
    '    ', s(SYN.keyNested, '"mode"'), ': ', s(SYN.string, '"dark"'), '\n',
    '  },\n',
    '  ', s(SYN.keyTop, '"character"'), ': [\n',
    '    ', s(SYN.string, '"professional"'), ',\n',
    '    ', s(SYN.string, '"data-rich"'), '\n',
    '  ],\n',
    '  ', s(SYN.keyTop, '"structure"'), ': [\n',
    '    {\n',
    '      ', s(SYN.keyNested, '"id"'), ': ', s(SYN.string, '"overview"'), ',\n',
    '      ', s(SYN.keyNested, '"blend"'), ': [', s(SYN.string, '"kpi-grid"'), ', ', s(SYN.string, '"chart"'), ', ', s(SYN.string, '"data-table"'), ']\n',
    '    }\n',
    '  ],\n',
    '  ', s(SYN.keyTop, '"tannins"'), ': [', s(SYN.string, '"auth"'), ', ', s(SYN.string, '"realtime"'), ']\n',
    '}'
  );
}

function TechChip(label) {
  return span({
    class: css('_bg[rgba(255,255,255,0.1)] _px2 _py1 _r1 _textxs _fgmuted')
  }, label);
}

export function VisionComparisonSection() {
  return section({ class: css('_py24 _px6') },
    div({ class: css('_mw[1100px] _mx[auto] _flex _col _gap8') },
      // Header
      div({ class: css('_tc') },
        h2({ class: css('_heading2 _fgfg _mb3') }, 'Traditional vs AI-Native'),
        p({ class: css('_fgmuted _mw[600px] _mx[auto]') },
          'AI doesn\'t think in JSX and hooks. It thinks in registries, tokens, and compositions.'
        )
      ),

      // Split comparison panels
      div({ class: css('_grid _gc1 _lg:gc2 _gap0 _overflow[hidden] _r3 _minh[380px]') },
        // Left panel: Traditional
        div({
          class: css('_relative _p6 _flex _col'),
          style: 'background:linear-gradient(180deg,#1a0a0a 0%,#0d0d0d 100%);border-right:1px solid #333'
        },
          // Badge
          span({ class: css('_absolute _top[1rem] _left[1rem] _bg[rgba(239,35,60,0.2)] _fg[#EF233C] _px3 _py1 _rfull _textxs _bold _uppercase') },
            'Traditional'
          ),
          // Code
          div({ class: css('_mt10 _flex1 _overflow[hidden]') },
            ReactCode()
          ),
          // Tech chips at bottom
          div({ class: css('_flex _wrap _gap2 _mt4') },
            TechChip('React'),
            TechChip('TypeScript'),
            TechChip('Tailwind'),
            TechChip('shadcn'),
            TechChip('tanstack')
          )
        ),

        // Right panel: AI-Native
        div({
          class: css('_relative _p6 _flex _col'),
          style: 'background:linear-gradient(180deg,#0a1a0a 0%,#0d0d0d 100%)'
        },
          // Badge
          span({ class: css('_absolute _top[1rem] _right[1rem] _bg[rgba(0,195,136,0.2)] _fg[#00C388] _px3 _py1 _rfull _textxs _bold _uppercase') },
            'AI-Native'
          ),
          // Code
          div({ class: css('_mt10 _flex1') },
            EssenceCode()
          ),
          // Success message at bottom
          div({ class: css('_flex _aic _gap2 _mt4 _fg[#00C388] _textsm') },
            span('✓'),
            span('30 lines → 14-page dashboard')
          )
        )
      ),

      // Bottom caption
      div({
        class: css('_tc _py6 _px4 _bg[rgba(255,255,255,0.02)] _borderT _bcborder _r3')
      },
        p({ class: css('_fgmuted _textsm _m0') },
          'AI doesn\'t think in JSX and hooks. It thinks in ',
          strong({ class: css('_fg[#0AF3EB]') }, 'structure'),
          ', ',
          strong({ class: css('_fg[#FE4474]') }, 'composition'),
          ', and ',
          strong({ class: css('_fg[#6500C6]') }, 'intent'),
          '.'
        )
      )
    )
  );
}
