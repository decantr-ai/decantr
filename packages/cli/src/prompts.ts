import { createInterface } from 'node:readline';
import type { DetectedProject } from './detect.js';

// ANSI color codes
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';

export interface InitOptions {
  blueprint?: string;
  archetype?: string;
  theme: string;
  mode: 'dark' | 'light' | 'auto';
  shape: string;
  target: string;
  guard: 'creative' | 'guided' | 'strict';
  density: 'compact' | 'comfortable' | 'spacious';
  shell: string;
  personality: string[];
  features: string[];
  existing: boolean;
  workflowMode?: 'greenfield-scaffold' | 'brownfield-attach';
  accessibility?: {
    wcag_level?: string;
    cvd_preference?: string;
  };
}

export type InitWorkflowSeed = Partial<Pick<
  InitOptions,
  'theme' | 'mode' | 'target' | 'guard' | 'density' | 'shell' | 'existing' | 'workflowMode'
>>;

export interface RegistryItem {
  id: string;
  name?: string;
  description?: string;
}

/**
 * Basic readline prompt.
 */
function ask(question: string, defaultValue?: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const prompt = defaultValue ? `${question} ${DIM}(${defaultValue})${RESET}: ` : `${question}: `;
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

/**
 * Selection prompt with numbered options.
 */
async function select<T extends string>(
  question: string,
  options: Array<{ value: T; label: string; description?: string }>,
  defaultIdx = 0,
  allowOther = false
): Promise<T | string> {
  console.log(`\n${BOLD}${question}${RESET}`);

  for (let i = 0; i < options.length; i++) {
    const marker = i === defaultIdx ? `${GREEN}>${RESET}` : ' ';
    const desc = options[i].description ? ` ${DIM}— ${options[i].description}${RESET}` : '';
    console.log(`  ${marker} ${i + 1}. ${options[i].label}${desc}`);
  }

  if (allowOther) {
    console.log(`    ${options.length + 1}. ${DIM}other (enter custom value)${RESET}`);
  }

  const maxIdx = allowOther ? options.length + 1 : options.length;
  const answer = await ask(`Choose (1-${maxIdx})`, String(defaultIdx + 1));
  const idx = parseInt(answer, 10) - 1;

  if (allowOther && idx === options.length) {
    const custom = await ask('Enter custom value');
    return custom;
  }

  const validIdx = Math.max(0, Math.min(idx, options.length - 1));
  return options[validIdx].value;
}

/**
 * Multi-select prompt.
 */
async function multiSelect(
  question: string,
  options: Array<{ value: string; label: string; description?: string }>,
  defaultSelected: number[] = []
): Promise<string[]> {
  console.log(`\n${BOLD}${question}${RESET}`);
  console.log(`${DIM}Enter numbers separated by commas, or press Enter for defaults${RESET}`);

  for (let i = 0; i < options.length; i++) {
    const marker = defaultSelected.includes(i) ? `${GREEN}*${RESET}` : ' ';
    const desc = options[i].description ? ` ${DIM}— ${options[i].description}${RESET}` : '';
    console.log(`  ${marker} ${i + 1}. ${options[i].label}${desc}`);
  }

  const defaultStr = defaultSelected.map(i => i + 1).join(',') || 'none';
  const answer = await ask(`Select (e.g., 1,3,5)`, defaultStr);

  if (!answer || answer === defaultStr) {
    return defaultSelected.map(i => options[i].value);
  }

  const indices = answer.split(',').map(s => parseInt(s.trim(), 10) - 1);
  return indices
    .filter(i => i >= 0 && i < options.length)
    .map(i => options[i].value);
}

/**
 * Confirm prompt.
 */
async function confirm(question: string, defaultYes = true): Promise<boolean> {
  const hint = defaultYes ? 'Y/n' : 'y/N';
  const answer = await ask(`${question} [${hint}]`, defaultYes ? 'y' : 'n');
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

/**
 * Show a warning message.
 */
function warn(message: string): void {
  console.log(`\n${YELLOW}  Warning: ${message}${RESET}`);
}

/**
 * Show detection summary.
 */
function showDetection(detected: DetectedProject): void {
  console.log(`\n${CYAN}Detected project configuration:${RESET}`);
  if (detected.framework !== 'unknown') {
    const version = detected.version ? ` ${detected.version}` : '';
    console.log(`  Framework: ${detected.framework}${version}`);
  }
  if (detected.packageManager !== 'unknown') {
    console.log(`  Package manager: ${detected.packageManager}`);
  }
  if (detected.hasTypeScript) {
    console.log(`  TypeScript: ${GREEN}yes${RESET}`);
  }
  if (detected.hasTailwind) {
    console.log(`  Tailwind CSS: ${GREEN}yes${RESET}`);
  }
  if (detected.existingEssence) {
    console.log(`  Existing essence: ${YELLOW}yes${RESET}`);
  }
}

/**
 * Run interactive prompts to gather init options.
 */
export async function runInteractivePrompts(
  detected: DetectedProject,
  archetypes: RegistryItem[],
  blueprints: RegistryItem[],
  themes: RegistryItem[],
  workflowSeed?: InitWorkflowSeed,
): Promise<InitOptions> {
  showDetection(detected);

  // Blueprint selection (includes "none" for blank canvas)
  const blueprintOptions = [
    { value: 'none', label: 'none', description: 'Start from scratch (blank canvas)' },
    ...blueprints.map(b => ({
      value: b.id,
      label: b.id,
      description: b.description,
    })),
  ];

  const blueprint = await select('What are you building?', blueprintOptions, 0, true);
  const isBlank = blueprint === 'none';

  // Theme selection
  const themeOptions = themes.map(t => ({
    value: t.id,
    label: t.id,
    description: t.description,
  }));
  const desiredTheme = workflowSeed?.theme || 'luminarum';
  const defaultThemeIdx = Math.max(0, themeOptions.findIndex(t => t.value === desiredTheme));
  const theme = await select('Choose a theme', themeOptions, Math.max(0, defaultThemeIdx), true);

  // Mode
  const mode = await select<'dark' | 'light' | 'auto'>(
    'Color mode',
    [
      { value: 'dark', label: 'dark', description: 'Dark background' },
      { value: 'light', label: 'light', description: 'Light background' },
      { value: 'auto', label: 'auto', description: 'Follow system preference' },
    ],
    workflowSeed?.mode === 'light' ? 1 : workflowSeed?.mode === 'auto' ? 2 : 0
  );

  // Shape
  const shape = await select(
    'Border shape',
    [
      { value: 'pill', label: 'pill', description: 'Fully rounded corners' },
      { value: 'rounded', label: 'rounded', description: 'Moderately rounded' },
      { value: 'sharp', label: 'sharp', description: 'No border radius' },
    ],
    1,
    true
  );

  // Target framework
  const frameworkOptions = [
    { value: 'react', label: 'react', description: 'React / Create React App' },
    { value: 'nextjs', label: 'nextjs', description: 'Next.js' },
    { value: 'vue', label: 'vue', description: 'Vue.js' },
    { value: 'nuxt', label: 'nuxt', description: 'Nuxt' },
    { value: 'svelte', label: 'svelte', description: 'Svelte / SvelteKit' },
    { value: 'astro', label: 'astro', description: 'Astro' },
    { value: 'angular', label: 'angular', description: 'Angular' },
    { value: 'html', label: 'html', description: 'Plain HTML/CSS/JS' },
  ];

  // Find default based on detection
  let defaultFrameworkIdx = frameworkOptions.findIndex(f => f.value === (workflowSeed?.target || detected.framework));
  if (defaultFrameworkIdx < 0) defaultFrameworkIdx = 0;

  const target = await select('Target framework', frameworkOptions, defaultFrameworkIdx, true);

  // Warn if target conflicts with detection
  if (detected.framework !== 'unknown' && target !== detected.framework) {
    warn(`This project appears to be ${detected.framework} but you selected ${target}.`);
    const proceed = await confirm('Continue anyway?', false);
    if (!proceed) {
      console.log(`${DIM}Using detected framework: ${detected.framework}${RESET}`);
      // User declined, use detected
    }
  }

  // Guard mode
  const guardMode = await select<'creative' | 'guided' | 'strict'>(
    'Guard enforcement level',
    [
      { value: 'creative', label: 'creative', description: 'Advisory only (new projects)' },
      { value: 'guided', label: 'guided', description: 'Style, structure, density enforced' },
      { value: 'strict', label: 'strict', description: 'All 5 rules enforced exactly' },
    ],
    workflowSeed?.guard === 'creative' ? 0
      : workflowSeed?.guard === 'strict' ? 2
      : workflowSeed?.guard === 'guided' ? 1
      : detected.existingEssence ? 1 : 2
  );

  // Density
  const density = await select<'compact' | 'comfortable' | 'spacious'>(
    'Spacing density',
    [
      { value: 'compact', label: 'compact', description: 'Dense UI, minimal spacing' },
      { value: 'comfortable', label: 'comfortable', description: 'Balanced spacing' },
      { value: 'spacious', label: 'spacious', description: 'Generous whitespace' },
    ],
    workflowSeed?.density === 'compact' ? 0 : workflowSeed?.density === 'spacious' ? 2 : 1
  );

  // Shell (layout)
  const shellOptions = [
    { value: 'sidebar-main', label: 'sidebar-main', description: 'Collapsible sidebar with main content' },
    { value: 'top-nav-main', label: 'top-nav-main', description: 'Horizontal nav with full-width content' },
    { value: 'centered', label: 'centered', description: 'Centered card (auth flows)' },
    { value: 'full-bleed', label: 'full-bleed', description: 'No persistent nav (landing pages)' },
    { value: 'minimal-header', label: 'minimal-header', description: 'Slim header with centered content' },
  ];

  // Suggest shell based on framework
  let defaultShellIdx = shellOptions.findIndex(s => s.value === workflowSeed?.shell);
  if (defaultShellIdx < 0) {
    defaultShellIdx = 0;
  }
  if (defaultShellIdx === 0 && ['nextjs', 'nuxt', 'astro'].includes(target)) {
    defaultShellIdx = shellOptions.findIndex(s => s.value === 'top-nav-main');
  }

  const shell = await select('Default page shell (layout)', shellOptions, Math.max(0, defaultShellIdx), true);

  return {
    blueprint: isBlank ? undefined : blueprint,
    archetype: undefined, // Will be derived from blueprint
    theme: theme as string,
    mode: mode as 'dark' | 'light' | 'auto',
    shape: shape as string,
    target: target as string,
    guard: guardMode as 'creative' | 'guided' | 'strict',
    density: density as 'compact' | 'comfortable' | 'spacious',
    shell: shell as string,
    personality: ['professional'],
    features: [],
    existing: workflowSeed?.existing || detected.existingEssence,
    workflowMode: workflowSeed?.workflowMode,
  };
}

/**
 * Parse CLI flags into InitOptions.
 */
export function parseFlags(args: Record<string, unknown>, detected: DetectedProject): Partial<InitOptions> {
  const options: Partial<InitOptions> = {};

  if (typeof args.blueprint === 'string') options.blueprint = args.blueprint;
  if (typeof args.archetype === 'string') options.archetype = args.archetype;
  if (typeof args.theme === 'string') options.theme = args.theme;
  if (args.mode === 'dark' || args.mode === 'light' || args.mode === 'auto') options.mode = args.mode;
  if (typeof args.shape === 'string') options.shape = args.shape;
  if (typeof args.target === 'string') options.target = args.target;
  if (args.guard === 'creative' || args.guard === 'guided' || args.guard === 'strict') options.guard = args.guard;
  if (args.density === 'compact' || args.density === 'comfortable' || args.density === 'spacious') options.density = args.density;
  if (typeof args.shell === 'string') options.shell = args.shell;
  if (typeof args.personality === 'string') options.personality = args.personality.split(',').map(s => s.trim());
  if (typeof args.features === 'string') options.features = args.features.split(',').map(s => s.trim());
  if (args.existing === true) options.existing = true;

  return options;
}

/**
 * Merge flags with defaults from detection.
 */
export function mergeWithDefaults(
  flags: Partial<InitOptions>,
  detected: DetectedProject,
  workflowSeed?: InitWorkflowSeed,
): InitOptions {
  return {
    blueprint: flags.blueprint,
    archetype: flags.archetype,
    theme: flags.theme || workflowSeed?.theme || 'luminarum',
    mode: flags.mode || workflowSeed?.mode || 'dark',
    shape: flags.shape || 'rounded',
    target: flags.target || workflowSeed?.target || (detected.framework !== 'unknown' ? detected.framework : 'react'),
    guard: flags.guard || workflowSeed?.guard || (detected.existingEssence ? 'guided' : 'strict'),
    density: flags.density || workflowSeed?.density || 'comfortable',
    shell: flags.shell || workflowSeed?.shell || 'sidebar-main',
    personality: flags.personality || ['professional'],
    features: flags.features || [],
    existing: flags.existing || workflowSeed?.existing || detected.existingEssence,
    workflowMode: flags.workflowMode || workflowSeed?.workflowMode,
  };
}

/**
 * Run simplified init prompt with two choices.
 */
export async function runSimplifiedInit(
  blueprints: Array<{ id: string; name?: string; description?: string }>
): Promise<{ choice: 'default' | 'search'; searchQuery?: string; selectedBlueprint?: string }> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  const question = (q: string): Promise<string> =>
    new Promise(resolve => rl.question(q, resolve));

  console.log('\n? What blueprint would you like to scaffold?\n');
  console.log('  1. Decantr default (recommended)');
  console.log('  2. Search registry...\n');

  const choice = await question('Enter choice (1 or 2): ');

  if (choice === '1' || choice === '') {
    rl.close();
    return { choice: 'default' };
  }

  // Search flow
  const searchQuery = await question('Search: ');

  // Filter blueprints by query
  const matches = blueprints.filter(b =>
    b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10);

  if (matches.length === 0) {
    console.log('\nNo matches found. Using Decantr default.');
    rl.close();
    return { choice: 'default' };
  }

  console.log('\nResults:');
  matches.forEach((b, i) => {
    console.log(`  ${i + 1}. ${b.id} — ${b.description || b.name || ''}`);
  });

  const selection = await question('\nSelect (number): ');
  const idx = parseInt(selection, 10) - 1;

  rl.close();

  if (idx >= 0 && idx < matches.length) {
    return { choice: 'search', selectedBlueprint: matches[idx].id };
  }

  return { choice: 'default' };
}

export { ask, select, multiSelect, confirm, warn };
