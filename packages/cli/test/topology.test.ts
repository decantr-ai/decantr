import { describe, it, expect } from 'vitest';
import { deriveZones, deriveTransitions, generateTopologySection } from '../src/scaffold.js';
import type { ZoneInput, ComposedZone, TopologyData } from '../src/scaffold.js';

describe('deriveZones', () => {
  it('groups archetypes by role', () => {
    const inputs: ZoneInput[] = [
      { archetypeId: 'landing', role: 'public', shell: 'topbar-main', features: ['seo'], description: 'Landing page' },
      { archetypeId: 'dashboard', role: 'primary', shell: 'sidebar-main', features: ['auth'], description: 'Dashboard' },
    ];

    const zones = deriveZones(inputs);

    expect(zones).toHaveLength(2);
    expect(zones[0].role).toBe('public');
    expect(zones[0].archetypes).toEqual(['landing']);
    expect(zones[1].role).toBe('primary');
    expect(zones[1].archetypes).toEqual(['dashboard']);
  });

  it('merges multiple archetypes in same zone and deduplicates features', () => {
    const inputs: ZoneInput[] = [
      { archetypeId: 'dashboard', role: 'primary', shell: 'sidebar-main', features: ['auth', 'notifications'], description: 'Dashboard' },
      { archetypeId: 'analytics', role: 'primary', shell: 'sidebar-detail', features: ['auth', 'charts'], description: 'Analytics' },
    ];

    const zones = deriveZones(inputs);

    expect(zones).toHaveLength(1);
    expect(zones[0].archetypes).toEqual(['dashboard', 'analytics']);
    expect(zones[0].features).toEqual(['auth', 'notifications', 'charts']);
    expect(zones[0].descriptions).toEqual(['Dashboard', 'Analytics']);
  });

  it('uses first archetype shell for the zone', () => {
    const inputs: ZoneInput[] = [
      { archetypeId: 'dashboard', role: 'primary', shell: 'sidebar-main', features: ['auth'], description: 'Dashboard' },
      { archetypeId: 'analytics', role: 'primary', shell: 'sidebar-detail', features: ['charts'], description: 'Analytics' },
    ];

    const zones = deriveZones(inputs);

    expect(zones[0].shell).toBe('sidebar-main');
  });

  it('returns zones in canonical order (public, gateway, primary, auxiliary)', () => {
    const inputs: ZoneInput[] = [
      { archetypeId: 'dashboard', role: 'primary', shell: 'sidebar-main', features: ['auth'], description: 'Dashboard' },
      { archetypeId: 'landing', role: 'public', shell: 'topbar-main', features: ['seo'], description: 'Landing' },
      { archetypeId: 'settings', role: 'auxiliary', shell: 'sidebar-main', features: ['profile'], description: 'Settings' },
      { archetypeId: 'auth', role: 'gateway', shell: 'centered', features: ['auth'], description: 'Auth' },
    ];

    const zones = deriveZones(inputs);

    expect(zones.map(z => z.role)).toEqual(['public', 'gateway', 'primary', 'auxiliary']);
  });
});

describe('deriveTransitions', () => {
  it('derives public -> gateway -> app transitions with auth trigger', () => {
    const zones: ComposedZone[] = [
      { role: 'public', archetypes: ['landing'], shell: 'topbar-main', features: ['seo'], descriptions: ['Landing'] },
      { role: 'gateway', archetypes: ['auth'], shell: 'centered', features: ['auth'], descriptions: ['Auth'] },
      { role: 'primary', archetypes: ['dashboard'], shell: 'sidebar-main', features: ['notifications'], descriptions: ['Dashboard'] },
    ];

    const transitions = deriveTransitions(zones);

    expect(transitions).toContainEqual({ from: 'public', to: 'gateway', type: 'conversion', trigger: 'authentication' });
    expect(transitions).toContainEqual({ from: 'gateway', to: 'app', type: 'gate-pass', trigger: 'authentication' });
    expect(transitions).toContainEqual({ from: 'app', to: 'gateway', type: 'gate-return', trigger: 'authentication' });
    expect(transitions).toContainEqual({ from: 'app', to: 'public', type: 'navigation', trigger: 'external' });
  });

  it('derives payment trigger from gateway features', () => {
    const zones: ComposedZone[] = [
      { role: 'public', archetypes: ['landing'], shell: 'topbar-main', features: ['seo'], descriptions: ['Landing'] },
      { role: 'gateway', archetypes: ['checkout'], shell: 'centered', features: ['payment', 'checkout'], descriptions: ['Checkout'] },
      { role: 'primary', archetypes: ['dashboard'], shell: 'sidebar-main', features: ['auth'], descriptions: ['Dashboard'] },
    ];

    const transitions = deriveTransitions(zones);

    expect(transitions).toContainEqual({ from: 'public', to: 'gateway', type: 'conversion', trigger: 'payment' });
    expect(transitions).toContainEqual({ from: 'gateway', to: 'app', type: 'gate-pass', trigger: 'payment' });
  });

  it('derives public -> app directly when no gateway', () => {
    const zones: ComposedZone[] = [
      { role: 'public', archetypes: ['landing'], shell: 'topbar-main', features: ['seo'], descriptions: ['Landing'] },
      { role: 'primary', archetypes: ['dashboard'], shell: 'sidebar-main', features: ['auth'], descriptions: ['Dashboard'] },
    ];

    const transitions = deriveTransitions(zones);

    expect(transitions).toContainEqual({ from: 'public', to: 'app', type: 'conversion', trigger: 'navigation' });
    expect(transitions).not.toContainEqual(expect.objectContaining({ type: 'gate-pass' }));
  });

  it('returns empty when only one zone', () => {
    const zones: ComposedZone[] = [
      { role: 'primary', archetypes: ['dashboard'], shell: 'sidebar-main', features: ['auth'], descriptions: ['Dashboard'] },
    ];

    const transitions = deriveTransitions(zones);

    expect(transitions).toEqual([]);
  });

  it('includes app -> public navigation when both exist', () => {
    const zones: ComposedZone[] = [
      { role: 'public', archetypes: ['landing'], shell: 'topbar-main', features: ['seo'], descriptions: ['Landing'] },
      { role: 'primary', archetypes: ['dashboard'], shell: 'sidebar-main', features: ['auth'], descriptions: ['Dashboard'] },
    ];

    const transitions = deriveTransitions(zones);

    expect(transitions).toContainEqual({ from: 'app', to: 'public', type: 'navigation', trigger: 'external' });
  });
});

describe('generateTopologySection', () => {
  it('generates markdown with zones, transitions, and entry points', () => {
    const data: TopologyData = {
      intent: 'AI chatbot platform for developers',
      zones: [
        { role: 'public', archetypes: ['marketing-saas'], shell: 'top-nav-footer', features: ['pricing'], descriptions: ['SaaS marketing landing page.'] },
        { role: 'gateway', archetypes: ['auth-full'], shell: 'centered', features: ['auth', 'mfa'], descriptions: ['Authentication flow.'] },
        { role: 'primary', archetypes: ['ai-chatbot'], shell: 'chat-portal', features: ['chat'], descriptions: ['AI chatbot interface.'] },
      ],
      transitions: [
        { from: 'public', to: 'gateway', type: 'conversion', trigger: 'authentication' },
        { from: 'gateway', to: 'app', type: 'gate-pass', trigger: 'authentication' },
      ],
      entryPoints: { anonymous: '/', authenticated: '/chat' },
    };

    const result = generateTopologySection(data, ['professional']);

    expect(result).toContain('## Composition Topology');
    expect(result).toContain('**Intent:** AI chatbot platform for developers');
    expect(result).toContain('**Public** — top-nav-footer shell');
    expect(result).toContain('**Gateway** — centered shell');
    expect(result).toContain('**App** — chat-portal shell');
    expect(result).toContain('### Zone Transitions');
    expect(result).toContain('Public → Gateway');
    expect(result).toContain('Gateway → App');
    expect(result).toContain('Anonymous users enter: /');
    expect(result).toContain('Authenticated users enter: /chat');
    // Personality is shown in scaffold.md header, not in topology section
  });

  it('omits transitions section when no transitions', () => {
    const data: TopologyData = {
      intent: 'Simple app',
      zones: [
        { role: 'primary', archetypes: ['dashboard'], shell: 'sidebar-main', features: [], descriptions: ['Dashboard.'] },
      ],
      transitions: [],
      entryPoints: { anonymous: '/', authenticated: '/' },
    };

    const result = generateTopologySection(data, []);

    expect(result).toContain('## Composition Topology');
    expect(result).not.toContain('### Zone Transitions');
    expect(result).not.toContain('Tone:');
  });

  it('merges primary and auxiliary under App label', () => {
    const data: TopologyData = {
      intent: 'Full app',
      zones: [
        { role: 'primary', archetypes: ['chatbot'], shell: 'chat-portal', features: ['chat'], descriptions: ['Chat.'] },
        { role: 'auxiliary', archetypes: ['settings'], shell: 'sidebar-settings', features: ['profile-edit'], descriptions: ['Settings.'] },
      ],
      transitions: [],
      entryPoints: { anonymous: '/', authenticated: '/chat' },
    };

    const result = generateTopologySection(data, []);

    expect(result).toContain('**App** — chat-portal shell');
    expect(result).toContain('**App (auxiliary)** — sidebar-settings shell');
  });
});
