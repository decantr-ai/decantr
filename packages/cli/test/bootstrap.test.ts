import { describe, expect, it } from 'vitest';
import {
  getDecantrAdapter,
  listDecantrAdapters,
  resolveBootstrapTarget,
} from '../src/bootstrap.js';

describe('bootstrap adapter registry', () => {
  it('preserves existing React, Next, and generic target behavior', () => {
    expect(resolveBootstrapTarget('react')).toMatchObject({
      target: 'react',
      packAdapter: 'react-vite',
      adapterId: 'react-vite',
      bootstrapAdapterId: 'react-vite',
    });
    expect(resolveBootstrapTarget('nextjs')).toMatchObject({
      target: 'nextjs',
      packAdapter: 'nextjs',
      adapterId: 'next-app',
      bootstrapAdapterId: 'next-app',
    });
    expect(resolveBootstrapTarget('rails')).toMatchObject({
      target: 'rails',
      packAdapter: 'rails',
      adapterId: 'generic-web',
      bootstrapAdapterId: null,
    });
  });

  it('resolves certified adapter aliases for new UI targets', () => {
    expect(resolveBootstrapTarget('html')).toMatchObject({
      target: 'html',
      packAdapter: 'vanilla-vite',
      adapterId: 'vanilla-vite',
      bootstrapAdapterId: 'vanilla-vite',
    });
    expect(resolveBootstrapTarget('js').adapterId).toBe('vanilla-vite');
    expect(resolveBootstrapTarget('vue').adapterId).toBe('vue-vite');
    expect(resolveBootstrapTarget('svelte').adapterId).toBe('sveltekit');
    expect(resolveBootstrapTarget('angular').adapterId).toBe('angular');
    expect(resolveBootstrapTarget('solidjs').adapterId).toBe('solid-vite');
  });

  it('keeps adapter status and capabilities data-driven', () => {
    const certified = listDecantrAdapters().filter((adapter) => adapter.status === 'certified');
    expect(certified.map((adapter) => adapter.id)).toEqual(
      expect.arrayContaining([
        'react-vite',
        'next-app',
        'vanilla-vite',
        'vue-vite',
        'sveltekit',
        'angular',
        'solid-vite',
      ]),
    );
    expect(getDecantrAdapter('generic-web').capabilities.bootstrap).toBe(false);
  });
});
