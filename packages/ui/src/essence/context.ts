import { createContext } from '../state/index.js';
/**
 * Essence DNA types — imported as type-only so @decantr/essence-spec
 * is NOT bundled into browser code. Guard validation runs in the CLI
 * and vite-plugin, not in the browser.
 */
import type {
  EssenceV3,
  GuardMode,
  DensityLevel,
  ThemeStyle,
  ThemeMode,
  ThemeShape,
} from '@decantr/essence-spec';

export interface EssenceContextValue {
  /** The full essence spec (null if no provider) */
  essence: EssenceV3 | null;

  /** Resolved DNA values (convenience accessors) */
  style: ThemeStyle | string;
  mode: ThemeMode;
  shape: ThemeShape | string;
  density: DensityLevel;
  contentGap: string;
  guardMode: GuardMode;
  dnaEnforcement: 'error' | 'warn' | 'off';
  blueprintEnforcement: 'warn' | 'off';
  personality: string[];
  wcagLevel: string;
}

export const EssenceContext = createContext<EssenceContextValue>({
  essence: null,
  style: 'auradecantism',
  mode: 'dark',
  shape: 'rounded',
  density: 'comfortable',
  contentGap: '4',
  guardMode: 'creative',
  dnaEnforcement: 'off',
  blueprintEnforcement: 'off',
  personality: [],
  wcagLevel: 'AA',
});
