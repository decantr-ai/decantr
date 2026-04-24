import { describe, expect, it } from 'vitest';
import type { MagicIntent } from '../src/commands/magic.js';
import { parseMagicPrompt } from '../src/commands/magic.js';

describe('parseMagicPrompt', () => {
  it('extracts dark theme hint', () => {
    const result = parseMagicPrompt('AI dashboard — dark theme');
    expect(result.themeHints).toContain('dark');
  });

  it('extracts multiple theme hints', () => {
    const result = parseMagicPrompt('chat app with neon dark glassmorphic design');
    expect(result.themeHints).toContain('neon');
    expect(result.themeHints).toContain('dark');
    expect(result.themeHints).toContain('glass');
  });

  it('extracts archetype from dashboard keyword', () => {
    const result = parseMagicPrompt('analytics dashboard with metrics');
    expect(result.archetype).toBe('dashboard-analytics');
  });

  it('extracts archetype from chat keyword', () => {
    const result = parseMagicPrompt('AI chatbot assistant');
    expect(result.archetype).toBe('ai-chatbot');
  });

  it('extracts archetype from marketplace keyword', () => {
    const result = parseMagicPrompt('an e-commerce marketplace platform');
    expect(result.archetype).toBe('marketplace-platform');
  });

  it('extracts personality hints', () => {
    const result = parseMagicPrompt('dashboard — bold, confident, futuristic');
    expect(result.personalityHints).toContain('bold');
    expect(result.personalityHints).toContain('confident');
    expect(result.personalityHints).toContain('futuristic');
  });

  it('extracts constraints', () => {
    const result = parseMagicPrompt('mobile-first accessible dashboard');
    expect(result.constraints).toContain('mobile-first');
    expect(result.constraints).toContain('accessible');
  });

  it('extracts real-time constraint', () => {
    const result = parseMagicPrompt('real-time monitoring dashboard');
    expect(result.constraints).toContain('real-time');
  });

  it('builds a description from remaining tokens', () => {
    const result = parseMagicPrompt('AI agent marketplace dashboard');
    expect(result.description).toBeTruthy();
    expect(result.description.length).toBeGreaterThan(0);
  });

  it('handles the full example prompt', () => {
    const result = parseMagicPrompt(
      'AI agent marketplace dashboard — dark cyber-minimal, confident personality, mobile-first',
    );
    expect(result.themeHints).toContain('dark');
    expect(result.themeHints).toContain('minimal');
    expect(result.personalityHints).toContain('confident');
    expect(result.constraints).toContain('mobile-first');
    // Should pick either dashboard or marketplace archetype
    expect(result.archetype).toBeDefined();
  });

  it('returns empty arrays when no keywords match', () => {
    const result = parseMagicPrompt('something completely unique');
    expect(result.themeHints).toEqual([]);
    expect(result.personalityHints).toEqual([]);
    expect(result.constraints).toEqual([]);
    expect(result.archetype).toBeUndefined();
  });

  it('handles minimal prompt', () => {
    const result = parseMagicPrompt('dashboard');
    expect(result.archetype).toBe('dashboard-analytics');
  });

  it('extracts light theme hint', () => {
    const result = parseMagicPrompt('bright light portfolio site');
    expect(result.themeHints).toContain('light');
  });

  it('extracts corporate theme', () => {
    const result = parseMagicPrompt('professional enterprise admin panel');
    expect(result.themeHints).toContain('corporate');
    expect(result.archetype).toBe('admin-panel');
  });

  it('handles cyberpunk as neon theme', () => {
    const result = parseMagicPrompt('cyberpunk styled dashboard');
    expect(result.themeHints).toContain('neon');
  });

  it('picks highest-scoring archetype when multiple match', () => {
    // "agent" matches agent-orchestrator, "dashboard" matches dashboard-analytics
    // but "agent" alone = 1 match, "dashboard" alone = 1 match
    const result = parseMagicPrompt('agent orchestrator workflow');
    expect(result.archetype).toBe('agent-orchestrator');
  });
});
