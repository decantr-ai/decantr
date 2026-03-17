/**
 * Shared signal for "Apply to Workbench" shell config.
 * Separate module to avoid circular imports between app.js and explorer/shells.js.
 */
import { createSignal } from 'decantr/state';

const storedConfig = typeof localStorage !== 'undefined' ? localStorage.getItem('de-shell-config') : null;
const [activeShellConfig, setActiveShellConfig] = createSignal(storedConfig ? JSON.parse(storedConfig) : null);

export { activeShellConfig, setActiveShellConfig };
