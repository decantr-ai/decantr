import { createSignal } from 'decantr/state';
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Modal, Drawer, Tooltip, Popover, Alert, toast, Button } from 'decantr/components';

const { div, section, h2, h3, p } = tags;

function DemoGroup(label, ...children) {
  return div({ class: css('_flex _col _gap3') },
    h3({ class: css('_t12 _bold _fg4'), style: 'text-transform:uppercase;letter-spacing:0.05em' }, label),
    ...children
  );
}

function DemoRow(...children) {
  return div({ class: css('_flex _gap3 _wrap _aic') }, ...children);
}

export function FeedbackSection() {
  const [modalVisible, setModalVisible] = createSignal(false);
  const [drawerRight, setDrawerRight] = createSignal(false);
  const [drawerLeft, setDrawerLeft] = createSignal(false);

  return section({ id: 'feedback', class: css('_flex _col _gap8') },
    h2({ class: css('_t24 _bold _mb2') }, 'Feedback Components'),

    DemoGroup('Modal',
      Button({ variant: 'primary', onclick: () => setModalVisible(true) }, 'Open Modal'),
      Modal({
        title: 'Example Modal',
        visible: modalVisible,
        onClose: () => setModalVisible(false)
      },
        p({ class: css('_fg4 _mb4') }, 'This is a live modal demo. Press Escape or click outside to close.'),
        div({ class: css('_flex _gap2') },
          Button({ variant: 'primary', onclick: () => setModalVisible(false) }, 'Got it'),
          Button({ variant: 'ghost', onclick: () => setModalVisible(false) }, 'Cancel')
        )
      )
    ),

    DemoGroup('Drawer',
      DemoRow(
        Button({ variant: 'outline', onclick: () => setDrawerRight(true) }, 'Open Right Drawer'),
        Button({ variant: 'outline', onclick: () => setDrawerLeft(true) }, 'Open Left Drawer')
      ),
      Drawer({
        visible: drawerRight,
        onClose: () => setDrawerRight(false),
        title: 'Settings',
        side: 'right'
      },
        p({ class: css('_fg4') }, 'Drawer content with native <dialog> element. Escape or click outside to close.')
      ),
      Drawer({
        visible: drawerLeft,
        onClose: () => setDrawerLeft(false),
        title: 'Navigation',
        side: 'left'
      },
        p({ class: css('_fg4') }, 'Left-side drawer panel.')
      )
    ),

    DemoGroup('Popover',
      DemoRow(
        Popover({
          trigger: () => Button({ variant: 'outline' }, 'Bottom popover'),
          position: 'bottom'
        }, p({ class: css('_fg4') }, 'Popover content below trigger.')),
        Popover({
          trigger: () => Button({ variant: 'outline' }, 'Top popover'),
          position: 'top'
        }, p({ class: css('_fg4') }, 'Popover content above trigger.'))
      )
    ),

    DemoGroup('Tooltip — Positions',
      DemoRow(
        Tooltip({ content: 'Tooltip on top', position: 'top' },
          Button({}, 'Top')
        ),
        Tooltip({ content: 'Tooltip on bottom', position: 'bottom' },
          Button({}, 'Bottom')
        ),
        Tooltip({ content: 'Tooltip on left', position: 'left' },
          Button({}, 'Left')
        ),
        Tooltip({ content: 'Tooltip on right', position: 'right' },
          Button({}, 'Right')
        )
      )
    ),

    DemoGroup('Alert — Variants',
      div({ class: css('_flex _col _gap3') },
        Alert({ variant: 'info' }, 'This is an informational alert.'),
        Alert({ variant: 'success' }, 'Operation completed successfully.'),
        Alert({ variant: 'warning' }, 'Please review before proceeding.'),
        Alert({ variant: 'error' }, 'Something went wrong. Please try again.'),
        Alert({ variant: 'info', dismissible: true, onDismiss: () => {} }, 'Dismissible alert — click the X to close.')
      )
    ),

    DemoGroup('Toast',
      DemoRow(
        Button({ onclick: () => toast({ message: 'Info notification', variant: 'info' }) }, 'Info Toast'),
        Button({ variant: 'success', onclick: () => toast({ message: 'Saved successfully!', variant: 'success' }) }, 'Success Toast'),
        Button({ variant: 'warning', onclick: () => toast({ message: 'Check your input', variant: 'warning' }) }, 'Warning Toast'),
        Button({ variant: 'destructive', onclick: () => toast({ message: 'Delete failed', variant: 'error' }) }, 'Error Toast')
      )
    )
  );
}
