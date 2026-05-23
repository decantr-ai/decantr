import type { GraphSnapshot } from '@decantr/core';
import { describe, expect, it } from 'vitest';
import { anchorFindingsToGraph, resolveGraphAnchorForFinding } from '../src/index.js';

const snapshot: GraphSnapshot = {
  id: 'graph:test',
  schema_version: '3.0.0-draft',
  project_id: 'proj:test',
  created_at: '2026-05-21T12:00:00.000Z',
  source_hash: 'hash:test',
  nodes: [
    { id: 'proj:test', type: 'Project', payload: { name: 'Test project' } },
    { id: 'pg:marketing:home', type: 'Page', payload: { id: 'home', section: 'marketing' } },
    { id: 'rt:/', type: 'Route', payload: { path: '/' } },
    { id: 'rt:/chat', type: 'Route', payload: { path: '/chat' } },
    { id: 'pat:chat-thread', type: 'Pattern', payload: { id: 'chat-thread' } },
    { id: 'cmp:chatbutton', type: 'Component', payload: { name: 'ChatButton' } },
    {
      id: 'rule:no-modal-over-thread',
      type: 'LocalRule',
      payload: { id: 'no-modal-over-thread' },
    },
    {
      id: 'bridge:surface',
      type: 'StyleBridge',
      payload: { id: 'bridge:surface', label: 'Surface colors' },
    },
    {
      id: 'src:rules',
      type: 'SourceArtifact',
      payload: { path: '.decantr/rules.json' },
    },
    {
      id: 'src:src/app/chat/page.tsx',
      type: 'SourceArtifact',
      payload: { path: 'src/app/chat/page.tsx' },
    },
  ],
  edges: [
    {
      src: 'cmp:chatbutton',
      dst: 'src:src/app/chat/page.tsx',
      relation: 'NODE_DERIVED_FROM_SOURCE',
    },
    {
      src: 'pg:marketing:home',
      dst: 'rt:/',
      relation: 'PAGE_ROUTED_AT_ROUTE',
    },
    {
      src: 'pg:marketing:home',
      dst: 'pat:chat-thread',
      relation: 'PAGE_COMPOSES_PATTERN',
    },
    {
      src: 'pg:marketing:home',
      dst: 'src:src/app/chat/page.tsx',
      relation: 'NODE_DERIVED_FROM_SOURCE',
    },
  ],
  summary: { nodes: 10, edges: 4, findings: 0, evidence: 0 },
};

describe('graph finding anchors', () => {
  it('anchors route findings to route nodes', () => {
    const graph = resolveGraphAnchorForFinding(snapshot, {
      id: 'assertion-contract-route',
      category: 'Contract route',
      message: 'Route /chat does not resolve to an existing section page.',
      evidence: [],
      target: '/chat',
    });

    expect(graph).toMatchObject({
      snapshot_id: 'graph:test',
      node_id: 'rt:/chat',
      node_type: 'Route',
      route: '/chat',
      confidence: 'exact',
    });
  });

  it('prefers exact local-rule anchors over text inference', () => {
    const graph = resolveGraphAnchorForFinding(snapshot, {
      id: 'local-rule-finding',
      category: 'Local law',
      message: 'Do not open a modal over the chat-thread pattern.',
      evidence: [],
      rule: 'no-modal-over-thread',
    });

    expect(graph).toMatchObject({
      node_id: 'rule:no-modal-over-thread',
      node_type: 'LocalRule',
      confidence: 'exact',
    });
  });

  it('adds optional graph anchors to finding arrays without dropping original fields', () => {
    const [finding] = anchorFindingsToGraph(snapshot, [
      {
        id: 'pattern-drift',
        category: 'Pattern drift',
        severity: 'warn' as const,
        message: 'chat-thread was reimplemented instead of using the existing pattern.',
        evidence: ['src/conversation.tsx'],
      },
    ]);

    expect(finding.severity).toBe('warn');
    expect(finding.graph).toMatchObject({
      node_id: 'pat:chat-thread',
      node_type: 'Pattern',
      confidence: 'inferred',
      route: '/',
    });
  });

  it('anchors file-specific findings to route source artifacts with route provenance', () => {
    const graph = resolveGraphAnchorForFinding(snapshot, {
      id: 'component-reuse-raw-control',
      category: 'Component Reuse',
      message: 'src/app/chat/page.tsx renders raw <button>.',
      evidence: ['src/app/chat/page.tsx:12 renders raw <button>'],
      file: 'src/app/chat/page.tsx',
      target: 'Button',
    });

    expect(graph).toMatchObject({
      node_id: 'src:src/app/chat/page.tsx',
      node_type: 'SourceArtifact',
      route: '/',
      confidence: 'exact',
      reason: 'finding file matched a SourceArtifact node',
    });
  });

  it('anchors style bridge findings to StyleBridge nodes when source artifacts are absent', () => {
    const graph = resolveGraphAnchorForFinding(snapshot, {
      id: 'style-bridge-arbitrary-value',
      category: 'Style Bridge',
      message: 'Production JSX used bg-[#0f172a] outside the accepted style bridge.',
      evidence: ['.decantr/style-bridge.json is accepted with mappings: bridge:surface'],
      target: 'bg-[#0f172a]',
      rule: 'style-bridge-arbitrary-value',
    });

    expect(graph).toMatchObject({
      node_id: 'bridge:surface',
      node_type: 'StyleBridge',
      confidence: 'exact',
      reason: 'finding matched a StyleBridge node',
    });
  });

  it('falls back to the project node for project-level findings', () => {
    const graph = resolveGraphAnchorForFinding(snapshot, {
      id: 'audit-invalid',
      category: 'Project Contract',
      message: 'Project audit is not valid.',
      evidence: [],
    });

    expect(graph).toMatchObject({
      node_id: 'proj:test',
      node_type: 'Project',
      confidence: 'fallback',
    });
  });
});
