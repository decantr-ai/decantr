import { describe, it, expect } from 'vitest';
import { serializeLayoutItem } from '../src/scaffold.js';

describe('serializeLayoutItem', () => {
  it('handles string patterns', () => {
    expect(serializeLayoutItem('kpi-grid')).toBe('kpi-grid');
  });

  it('handles pattern objects with preset', () => {
    expect(serializeLayoutItem({ pattern: 'hero', preset: 'landing' }))
      .toBe('hero (landing)');
  });

  it('handles pattern objects with alias', () => {
    expect(serializeLayoutItem({ pattern: 'hero', preset: 'landing', as: 'guild-hero' }))
      .toBe('hero (landing) as guild-hero');
  });

  it('handles pattern objects without preset', () => {
    expect(serializeLayoutItem({ pattern: 'hero' }))
      .toBe('hero');
  });

  it('handles pattern objects with only alias', () => {
    expect(serializeLayoutItem({ pattern: 'hero', as: 'custom-hero' }))
      .toBe('hero as custom-hero');
  });

  it('handles column layouts', () => {
    expect(serializeLayoutItem({ cols: ['activity-feed', 'top-players'], at: 'lg' }))
      .toBe('[activity-feed | top-players] @lg');
  });

  it('handles column layouts without breakpoint', () => {
    expect(serializeLayoutItem({ cols: ['left', 'right'] }))
      .toBe('[left | right]');
  });

  it('handles nested column layouts', () => {
    expect(serializeLayoutItem({
      cols: [{ pattern: 'hero', preset: 'landing' }, 'sidebar'],
      at: 'md'
    })).toBe('[hero (landing) | sidebar] @md');
  });

  it('handles deeply nested column layouts', () => {
    expect(serializeLayoutItem({
      cols: [
        { pattern: 'achievements', preset: 'grid' },
        'activity-feed'
      ],
      at: 'lg'
    })).toBe('[achievements (grid) | activity-feed] @lg');
  });

  it('returns custom for unrecognized objects', () => {
    expect(serializeLayoutItem({ unknown: 'value' })).toBe('custom');
  });

  it('handles null values', () => {
    expect(serializeLayoutItem(null)).toBe('custom');
  });

  it('handles undefined values', () => {
    expect(serializeLayoutItem(undefined)).toBe('custom');
  });
});
