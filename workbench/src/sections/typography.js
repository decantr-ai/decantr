import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Title, Text, Paragraph, Link, Blockquote, Kbd, Watermark, VisuallyHidden, Button, Separator } from 'decantr/components';

const { div, section, h2, h3, p, span } = tags;

function DemoGroup(label, description, ...children) {
  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _col _gap1') },
      h3({ class: css('_textlg _fwheading _lhsnug') }, label),
      description ? p({ class: css('_textsm _fg4 _lhnormal') }, description) : null
    ),
    ...children
  );
}

function DemoRow(...children) {
  return div({ class: css('_flex _gap3 _wrap _aic') }, ...children);
}

export function TypographySection() {
  return section({ id: 'typography', class: css('_flex _col _gap10') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_text2xl _fwheading _lhtight _lsheading') }, 'Typography & Utility'),
      p({ class: css('_textsm _fg4') }, 'Titles, text, paragraphs, links, blockquotes, keyboard shortcuts, and watermarks.')
    ),

    Separator({}),

    DemoGroup('Title — Levels', 'Semantic heading levels from h1 through h5.',
      div({ class: css('_flex _col _gap2') },
        Title({ level: 1 }, 'Heading 1'),
        Title({ level: 2 }, 'Heading 2'),
        Title({ level: 3 }, 'Heading 3'),
        Title({ level: 4 }, 'Heading 4'),
        Title({ level: 5 }, 'Heading 5')
      )
    ),

    DemoGroup('Title — Variants', 'Color variants, decorations, and disabled state.',
      div({ class: css('_flex _col _gap2') },
        Title({ level: 3, type: 'secondary' }, 'Secondary title'),
        Title({ level: 3, type: 'success' }, 'Success title'),
        Title({ level: 3, type: 'warning' }, 'Warning title'),
        Title({ level: 3, type: 'danger' }, 'Danger title'),
        Title({ level: 3, mark: true }, 'Marked title'),
        Title({ level: 3, underline: true }, 'Underlined title'),
        Title({ level: 3, delete: true }, 'Deleted title'),
        Title({ level: 3, disabled: true }, 'Disabled title')
      )
    ),

    DemoGroup('Text', 'Inline text with formatting modifiers and semantic color variants.',
      DemoRow(
        Text({}, 'Default text'),
        Text({ strong: true }, 'Strong'),
        Text({ code: true }, 'Code'),
        Text({ keyboard: true }, 'Keyboard'),
        Text({ mark: true }, 'Marked'),
        Text({ underline: true }, 'Underline'),
        Text({ delete: true }, 'Deleted'),
        Text({ disabled: true }, 'Disabled')
      ),
      DemoRow(
        Text({ type: 'secondary' }, 'Secondary'),
        Text({ type: 'success' }, 'Success'),
        Text({ type: 'warning' }, 'Warning'),
        Text({ type: 'danger' }, 'Danger')
      )
    ),

    DemoGroup('Paragraph', 'Block-level text with optional secondary styling.',
      div({ style: 'max-width:600px' },
        Paragraph({}, 'Decantr is an AI-first web framework designed for LLMs to generate, read, and maintain. Every API is optimized for token efficiency: terse atomic CSS atoms, proxy-based tag functions, and a machine-readable registry.'),
        Paragraph({ type: 'secondary' }, 'This is secondary paragraph text, used for less prominent information and supporting content that complements the primary text.')
      )
    ),

    DemoGroup('Link', 'Anchor elements with color variants and disabled state.',
      DemoRow(
        Link({ href: '#' }, 'Default link'),
        Link({ href: '#', type: 'secondary' }, 'Secondary'),
        Link({ href: '#', type: 'success' }, 'Success'),
        Link({ href: '#', type: 'warning' }, 'Warning'),
        Link({ href: '#', type: 'danger' }, 'Danger'),
        Link({ href: '#', disabled: true }, 'Disabled link')
      )
    ),

    DemoGroup('Blockquote', 'Styled quotation block for callouts and citations.',
      div({ style: 'max-width:600px' },
        Blockquote({}, 'Design for permanence. Every pattern you introduce will be replicated across the framework. If 50 components follow this pattern, does the framework still make sense?')
      )
    ),

    DemoGroup('Kbd — Keyboard Shortcuts', 'Keyboard key indicators with multi-key combos and custom separators.',
      DemoRow(
        Kbd({}, 'Enter'),
        Kbd({ keys: ['Ctrl', 'C'] }),
        Kbd({ keys: ['Cmd', 'Shift', 'P'] }),
        Kbd({ keys: ['\u2318', 'K'] }),
        Kbd({ keys: ['Alt', 'Tab'], separator: ' + ' })
      )
    ),

    DemoGroup('VisuallyHidden', 'Screen-reader-only content that is invisible but accessible to assistive technology.',
      div({ class: css('_flex _col _gap3') },
        div({ class: css('_flex _aic _gap3') },
          Button({ 'aria-label': 'Save document' }, 'Save'),
          span({ class: css('_textsm _fg4') }, 'This button has a VisuallyHidden label for screen readers:'),
        ),
        div({ class: css('_p3'), style: 'background:var(--d-surface-1);border-radius:var(--d-radius)' },
          p({ class: css('_textsm _fg4') }, 'The element below contains text only visible to screen readers:'),
          div({ class: css('_flex _aic _gap2 _mt2') },
            span({ class: css('_textsm _fwtitle') }, 'Status: '),
            span({ style: 'color:var(--d-success)' }, '\u25cf'),
            VisuallyHidden({}, 'System is online and operational'),
            span({ class: css('_textsm') }, 'Online')
          ),
          p({ class: css('_textsm _fg4 _mt2') }, 'Inspect element to see the visually-hidden <span> with class "d-sr-only".')
        )
      )
    ),

    DemoGroup('Watermark', 'Canvas-based background watermark overlay.',
      Watermark({ content: 'DECANTR', fontSize: 16, fontColor: 'rgba(0,0,0,0.06)' },
        div({ style: 'height:180px;border:1px solid var(--d-border);border-radius:var(--d-radius);background:var(--d-bg)' })
      )
    )
  );
}
