import { describe, it, expect, vi } from 'vitest';
import { createRoot } from '../src/state/scheduler.js';
import type { EssenceContextValue } from '../src/essence/context.js';
import { EssenceContext } from '../src/essence/context.js';
import { useEssence, useDNA, useDensity, useGuardMode } from '../src/essence/hooks.js';

// ─── EssenceContext defaults ──────────────────────────────────

describe('EssenceContext', () => {
  it('has sensible defaults for no-provider scenarios', () => {
    let ctx!: EssenceContextValue;
    createRoot(() => {
      ctx = EssenceContext.consume();
    });
    expect(ctx.essence).toBeNull();
    expect(ctx.style).toBe('auradecantism');
    expect(ctx.mode).toBe('dark');
    expect(ctx.shape).toBe('rounded');
    expect(ctx.density).toBe('comfortable');
    expect(ctx.guardMode).toBe('creative');
    expect(ctx.dnaEnforcement).toBe('off');
    expect(ctx.blueprintEnforcement).toBe('off');
    expect(ctx.personality).toEqual([]);
    expect(ctx.wcagLevel).toBe('AA');
  });
});

// ─── EssenceProvider (via context directly) ───────────────────

describe('EssenceProvider context', () => {
  it('provides context to children', () => {
    let childCtx!: EssenceContextValue;
    createRoot(() => {
      const value: EssenceContextValue = {
        essence: null,
        style: 'clean',
        mode: 'light',
        shape: 'sharp',
        density: 'compact',
        contentGap: '2',
        guardMode: 'strict',
        dnaEnforcement: 'error',
        blueprintEnforcement: 'warn',
        personality: ['bold'],
        wcagLevel: 'AAA',
      };
      EssenceContext.Provider(value);
      childCtx = EssenceContext.consume();
    });
    expect(childCtx.style).toBe('clean');
    expect(childCtx.mode).toBe('light');
    expect(childCtx.density).toBe('compact');
    expect(childCtx.guardMode).toBe('strict');
  });

  it('nested provider with overrides shadows parent', () => {
    let parentCtx!: EssenceContextValue;
    let childCtx!: EssenceContextValue;
    createRoot(() => {
      const parentValue: EssenceContextValue = {
        essence: null,
        style: 'clean',
        mode: 'light',
        shape: 'sharp',
        density: 'comfortable',
        contentGap: '4',
        guardMode: 'guided',
        dnaEnforcement: 'warn',
        blueprintEnforcement: 'off',
        personality: [],
        wcagLevel: 'AA',
      };
      EssenceContext.Provider(parentValue);
      parentCtx = EssenceContext.consume();

      // Simulate nested provider by creating a child owner
      createRoot(() => {
        const childValue: EssenceContextValue = {
          ...parentValue,
          density: 'compact',
          guardMode: 'strict',
        };
        EssenceContext.Provider(childValue);
        childCtx = EssenceContext.consume();
      });
    });
    expect(parentCtx.density).toBe('comfortable');
    expect(parentCtx.guardMode).toBe('guided');
    expect(childCtx.density).toBe('compact');
    expect(childCtx.guardMode).toBe('strict');
  });
});

// ─── Hooks ────────────────────────────────────────────────────

describe('useEssence', () => {
  it('returns the full context value', () => {
    let result!: EssenceContextValue;
    createRoot(() => {
      const value: EssenceContextValue = {
        essence: null,
        style: 'retro',
        mode: 'dark',
        shape: 'pill',
        density: 'spacious',
        contentGap: '8',
        guardMode: 'creative',
        dnaEnforcement: 'off',
        blueprintEnforcement: 'off',
        personality: ['playful'],
        wcagLevel: 'A',
      };
      EssenceContext.Provider(value);
      result = useEssence();
    });
    expect(result.style).toBe('retro');
    expect(result.density).toBe('spacious');
    expect(result.personality).toEqual(['playful']);
  });
});

describe('useDNA', () => {
  it('returns DNA subset of context', () => {
    let dna!: ReturnType<typeof useDNA>;
    createRoot(() => {
      const value: EssenceContextValue = {
        essence: null,
        style: 'glassmorphism',
        mode: 'light',
        shape: 'rounded',
        density: 'comfortable',
        contentGap: '4',
        guardMode: 'strict',
        dnaEnforcement: 'error',
        blueprintEnforcement: 'warn',
        personality: ['elegant'],
        wcagLevel: 'AA',
      };
      EssenceContext.Provider(value);
      dna = useDNA();
    });
    expect(dna.style).toBe('glassmorphism');
    expect(dna.mode).toBe('light');
    expect(dna.shape).toBe('rounded');
    expect(dna.density).toBe('comfortable');
    expect(dna.contentGap).toBe('4');
    expect(dna.personality).toEqual(['elegant']);
    // Should not include guardMode or other non-DNA fields
    expect((dna as any).guardMode).toBeUndefined();
  });
});

describe('useDensity', () => {
  it('returns density from context', () => {
    let density!: string;
    createRoot(() => {
      const value: EssenceContextValue = {
        essence: null,
        style: 'clean',
        mode: 'dark',
        shape: 'sharp',
        density: 'compact',
        contentGap: '2',
        guardMode: 'creative',
        dnaEnforcement: 'off',
        blueprintEnforcement: 'off',
        personality: [],
        wcagLevel: 'AA',
      };
      EssenceContext.Provider(value);
      density = useDensity();
    });
    expect(density).toBe('compact');
  });
});

describe('useGuardMode', () => {
  it('returns guard mode from context', () => {
    let mode!: string;
    createRoot(() => {
      const value: EssenceContextValue = {
        essence: null,
        style: 'clean',
        mode: 'dark',
        shape: 'sharp',
        density: 'comfortable',
        contentGap: '4',
        guardMode: 'strict',
        dnaEnforcement: 'error',
        blueprintEnforcement: 'warn',
        personality: [],
        wcagLevel: 'AA',
      };
      EssenceContext.Provider(value);
      mode = useGuardMode();
    });
    expect(mode).toBe('strict');
  });
});

// ─── applyTokens ─────────────────────────────────────────────

describe('applyTokens', () => {
  it('calls setStyle, setMode, and setShape from theme registry', async () => {
    // We test through the module to verify it calls the right functions
    const mockSetStyle = vi.fn();
    const mockSetMode = vi.fn();
    const mockSetShape = vi.fn();

    vi.doMock('../src/css/theme-registry.js', () => ({
      setStyle: mockSetStyle,
      setMode: mockSetMode,
      setShape: mockSetShape,
    }));

    // Re-import to get the mocked version
    const { applyTokens } = await import('../src/essence/tokens.js');

    const ctx: EssenceContextValue = {
      essence: null,
      style: 'clean',
      mode: 'light',
      shape: 'rounded',
      density: 'comfortable',
      contentGap: '4',
      guardMode: 'creative',
      dnaEnforcement: 'off',
      blueprintEnforcement: 'off',
      personality: [],
      wcagLevel: 'AA',
    };

    applyTokens(ctx);
    expect(mockSetStyle).toHaveBeenCalledWith('clean');
    expect(mockSetMode).toHaveBeenCalledWith('light');
    expect(mockSetShape).toHaveBeenCalledWith('rounded');

    vi.doUnmock('../src/css/theme-registry.js');
  });
});
