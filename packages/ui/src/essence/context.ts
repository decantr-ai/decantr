import { createContext } from '../state/index.js';
import type {
  EssenceV3,
  GuardMode,
  DensityLevel,
  ThemeStyle,
  ThemeMode,
  ThemeShape,
  GuardViolation,
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

  /** Guard validation function bound to this essence */
  validateGuard: (context: Record<string, unknown>) => GuardViolation[];
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
  validateGuard: () => [],
});
