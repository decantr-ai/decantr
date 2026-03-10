import { createSignal } from 'decantr/state';
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Modal, Drawer, Tooltip, Popover, Alert, toast, Button, AlertDialog, Sheet, notification, message, Result, Popconfirm, Command, FloatButton, Tour, Separator } from 'decantr/components';

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

export function FeedbackSection() {
  const [modalVisible, setModalVisible] = createSignal(false);
  const [drawerRight, setDrawerRight] = createSignal(false);
  const [drawerLeft, setDrawerLeft] = createSignal(false);
  const [alertDlgVisible, setAlertDlgVisible] = createSignal(false);
  const [sheetVisible, setSheetVisible] = createSignal(false);
  const [sheetBottom, setSheetBottom] = createSignal(false);
  const [cmdVisible, setCmdVisible] = createSignal(false);

  return section({ id: 'feedback', class: css('_flex _col _gap10') },
    div({},
      h2({ class: css('_text2xl _fwheading _lhtight _lsheading') }, 'Feedback Components'),
      p({ class: css('_textsm _fg4') }, 'Modals, dialogs, overlays, alerts, toasts, and other feedback patterns.')
    ),
    Separator({}),

    DemoGroup('Modal', 'Dialog overlay with backdrop, close on Escape or outside click.',
      Button({ variant: 'primary', onclick: () => setModalVisible(true) }, 'Open Modal'),
      Modal({
        title: 'Example Modal',
        visible: modalVisible,
        onClose: () => setModalVisible(false),
        footer: div({ class: css('_flex _gap2') },
          Button({ variant: 'primary', onclick: () => setModalVisible(false) }, 'Got it'),
          Button({ variant: 'ghost', onclick: () => setModalVisible(false) }, 'Cancel')
        )
      },
        p({ class: css('_fg4') }, 'This is a live modal demo. Press Escape or click outside to close.')
      )
    ),

    DemoGroup('AlertDialog', 'Confirmation dialog for destructive or irreversible actions.',
      Button({ variant: 'destructive', onclick: () => setAlertDlgVisible(true) }, 'Delete Item'),
      AlertDialog({
        title: 'Are you absolutely sure?',
        description: 'This action cannot be undone. This will permanently delete the item from your account.',
        visible: alertDlgVisible,
        onConfirm: () => { setAlertDlgVisible(false); toast({ message: 'Item deleted', variant: 'error' }); },
        onCancel: () => setAlertDlgVisible(false),
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'destructive'
      })
    ),

    DemoGroup('Sheet', 'Sliding panel from screen edge for settings, filters, and detail views.',
      DemoRow(
        Button({ variant: 'outline', onclick: () => setSheetVisible(true) }, 'Open Right Sheet'),
        Button({ variant: 'outline', onclick: () => setSheetBottom(true) }, 'Open Bottom Sheet')
      ),
      Sheet({
        title: 'Settings Panel',
        visible: sheetVisible,
        onClose: () => setSheetVisible(false),
        side: 'right',
        size: '350px'
      },
        p({ class: css('_fg4') }, 'Sheet content slides in from the edge. Great for settings panels, filters, and detailed views.')
      ),
      Sheet({
        title: 'Quick Actions',
        visible: sheetBottom,
        onClose: () => setSheetBottom(false),
        side: 'bottom',
        size: '250px'
      },
        p({ class: css('_fg4') }, 'Bottom sheet for mobile-friendly interactions and quick action menus.')
      )
    ),

    DemoGroup('Drawer', 'Native dialog-based drawer panel with left or right placement.',
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
        p({ class: css('_fg4') }, 'Drawer content with native <dialog> element.')
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

    DemoGroup('Command Palette', 'Searchable command menu with grouped items and keyboard shortcuts.',
      Button({ variant: 'outline', onclick: () => setCmdVisible(true) }, 'Open Command Palette (\u2318K)'),
      Command({
        visible: cmdVisible,
        onClose: () => setCmdVisible(false),
        items: [
          { label: 'Go to Dashboard', group: 'Navigation', icon: '\ud83d\udcca', shortcut: '\u2318D' },
          { label: 'Go to Settings', group: 'Navigation', icon: '\u2699\ufe0f', shortcut: '\u2318,' },
          { label: 'Go to Profile', group: 'Navigation', icon: '\ud83d\udc64' },
          { label: 'Create New File', group: 'Actions', icon: '\ud83d\udcc4', shortcut: '\u2318N' },
          { label: 'Search Files', group: 'Actions', icon: '\ud83d\udd0d', shortcut: '\u2318P' },
          { label: 'Toggle Theme', group: 'Actions', icon: '\ud83c\udf19' },
          { label: 'Sign Out', group: 'Account', icon: '\ud83d\udeaa' }
        ],
        onSelect: item => {}
      })
    ),

    DemoGroup('Popconfirm', 'Inline confirmation popover attached to a trigger element.',
      DemoRow(
        Popconfirm({
          title: 'Delete this file?',
          description: 'This action cannot be undone.',
          trigger: () => Button({ variant: 'destructive', size: 'sm' }, 'Delete'),
          onConfirm: () => toast({ message: 'Deleted!', variant: 'error' }),
          onCancel: () => {}
        }),
        Popconfirm({
          title: 'Publish changes?',
          trigger: () => Button({ variant: 'primary', size: 'sm' }, 'Publish'),
          onConfirm: () => toast({ message: 'Published!', variant: 'success' }),
          confirmText: 'Publish',
          cancelText: 'Not yet'
        })
      )
    ),

    DemoGroup('Popover', 'Floating content panel anchored to a trigger with configurable position.',
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

    DemoGroup('Tooltip — Positions', 'Lightweight informational overlay on hover with four placement options.',
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

    DemoGroup('Alert — Variants', 'Static inline banners for info, success, warning, and error states.',
      div({ class: css('_flex _col _gap3') },
        Alert({ variant: 'info' }, 'This is an informational alert.'),
        Alert({ variant: 'success' }, 'Operation completed successfully.'),
        Alert({ variant: 'warning' }, 'Please review before proceeding.'),
        Alert({ variant: 'error' }, 'Something went wrong. Please try again.'),
        Alert({ variant: 'info', dismissible: true, onDismiss: () => {} }, 'Dismissible alert \u2014 click the X to close.')
      )
    ),

    DemoGroup('Result', 'Full-page result states for success, error, and status code pages.',
      div({ class: css('_grid _gc2 _gap4') },
        Result({
          status: 'success',
          title: 'Successfully Purchased!',
          subTitle: 'Order #2024-03-001 has been placed.',
          extra: [
            Button({ variant: 'primary', size: 'sm' }, 'Go to Orders'),
            Button({ size: 'sm' }, 'Buy Again')
          ]
        }),
        Result({
          status: '404',
          title: 'Page Not Found',
          subTitle: 'The page you are looking for does not exist.',
          extra: [Button({ variant: 'primary', size: 'sm' }, 'Back Home')]
        })
      )
    ),

    DemoGroup('Toast', 'Ephemeral notification banners that auto-dismiss after a timeout.',
      DemoRow(
        Button({ onclick: () => toast({ message: 'Info notification', variant: 'info' }) }, 'Info Toast'),
        Button({ variant: 'success', onclick: () => toast({ message: 'Saved successfully!', variant: 'success' }) }, 'Success Toast'),
        Button({ variant: 'warning', onclick: () => toast({ message: 'Check your input', variant: 'warning' }) }, 'Warning Toast'),
        Button({ variant: 'destructive', onclick: () => toast({ message: 'Delete failed', variant: 'error' }) }, 'Error Toast')
      )
    ),

    DemoGroup('Notification', 'Rich notification cards with title, description, and type-based styling.',
      DemoRow(
        Button({ onclick: () => notification({ title: 'New Message', description: 'You have 3 unread messages.', type: 'info' }) }, 'Info Notification'),
        Button({ variant: 'success', onclick: () => notification({ title: 'Deployment Complete', description: 'Your app has been deployed to production.', type: 'success' }) }, 'Success'),
        Button({ variant: 'warning', onclick: () => notification({ title: 'Low Storage', description: 'You are running low on storage space.', type: 'warning' }) }, 'Warning'),
        Button({ variant: 'destructive', onclick: () => notification({ title: 'Build Failed', description: 'The build failed with 3 errors.', type: 'error' }) }, 'Error')
      )
    ),

    DemoGroup('Message', 'Minimal top-of-screen messages for quick status feedback.',
      DemoRow(
        Button({ onclick: () => message.info('This is an info message') }, 'Info'),
        Button({ variant: 'success', onclick: () => message.success('Saved successfully!') }, 'Success'),
        Button({ variant: 'warning', onclick: () => message.warning('Network is slow') }, 'Warning'),
        Button({ variant: 'destructive', onclick: () => message.error('Request failed') }, 'Error'),
        Button({ onclick: () => { const m = message.loading('Loading...'); setTimeout(() => m.close(), 2000); } }, 'Loading')
      )
    ),

    DemoGroup('Tour', 'Step-by-step onboarding guide that highlights page elements with a spotlight overlay.',
      (() => {
        const target1 = Button({ id: 'tour-target-1', variant: 'outline', size: 'sm' }, 'Feature A');
        const target2 = Button({ id: 'tour-target-2', variant: 'outline', size: 'sm' }, 'Feature B');
        const target3 = Button({ id: 'tour-target-3', variant: 'outline', size: 'sm' }, 'Feature C');

        const tour = Tour({
          steps: [
            { target: '#tour-target-1', title: 'Welcome', description: 'This is Feature A. Click Next to continue the tour.', placement: 'bottom' },
            { target: '#tour-target-2', title: 'Feature B', description: 'Here you can access Feature B with advanced options.', placement: 'bottom' },
            { target: '#tour-target-3', title: 'All Done!', description: 'Feature C completes the workflow. Click Finish to close.', placement: 'bottom' }
          ],
          onFinish: () => toast({ message: 'Tour completed!', variant: 'success' }),
          onClose: () => {}
        });

        return div({ class: css('_flex _col _gap4') },
          DemoRow(target1, target2, target3),
          Button({ variant: 'primary', size: 'sm', onclick: () => tour.start() }, 'Start Tour')
        );
      })()
    ),

    DemoGroup('FloatButton', 'Floating action button fixed to a corner of its container.',
      div({ style: 'position:relative;height:120px;border:1px solid var(--d-border);border-radius:var(--d-radius);overflow:hidden' },
        p({ class: css('_p4 _fg4 _textsm') }, 'Float buttons are typically fixed to the viewport. This demo is contained.'),
        FloatButton({
          icon: '\u2191',
          tooltip: 'Back to top',
          position: 'right-bottom',
          onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
        })
      )
    )
  );
}
