import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  API_CONTENT_TYPES,
  type Archetype,
  BLUEPRINT_ARTIFACT_STATUSES,
  BLUEPRINT_PORTFOLIO_MATURITIES,
  BLUEPRINT_PORTFOLIO_VISIBILITIES,
  type Blueprint,
  CONTENT_TYPES,
  type ContentTypeMap,
  type Pattern,
  type PublicContentRecord,
  type ResolvedContent,
  type Shell,
  type Theme,
} from '../src/index.js';

describe('canonical content-domain exports', () => {
  it('exposes registry-independent content constants', () => {
    expect(CONTENT_TYPES).toEqual(['pattern', 'theme', 'blueprint', 'archetype', 'shell']);
    expect(API_CONTENT_TYPES).toEqual(['patterns', 'themes', 'blueprints', 'archetypes', 'shells']);
    expect(BLUEPRINT_PORTFOLIO_VISIBILITIES).toEqual(['featured', 'public', 'labs', 'hidden']);
    expect(BLUEPRINT_PORTFOLIO_MATURITIES).toContain('certified-flagship');
    expect(BLUEPRINT_ARTIFACT_STATUSES).toEqual(['none', 'planned', 'candidate', 'certified']);
  });

  it('exposes canonical item, resolver, and public record types', () => {
    expectTypeOf<Pattern['id']>().toEqualTypeOf<string>();
    expectTypeOf<Theme['tokens']>().toEqualTypeOf<Theme['tokens']>();
    expectTypeOf<Blueprint['theme']['id']>().toEqualTypeOf<string>();
    expectTypeOf<Archetype['role']>().toEqualTypeOf<
      'primary' | 'gateway' | 'public' | 'auxiliary'
    >();
    expectTypeOf<Shell['internal_layout']>().toEqualTypeOf<Record<string, unknown> | undefined>();
    expectTypeOf<ContentTypeMap['pattern']>().toEqualTypeOf<Pattern>();
    expectTypeOf<PublicContentRecord<Pattern>['data']>().toEqualTypeOf<Pattern>();
    expectTypeOf<ResolvedContent<Theme>['item']>().toEqualTypeOf<Theme>();
  });
});
