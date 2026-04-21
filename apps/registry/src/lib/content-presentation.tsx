import type { ReactNode, SVGProps } from 'react';
import type { ContentItem, DashboardContentItem, PublicRegistrySource } from '@/lib/api';
import type { RegistryContentType } from '@/lib/content-types';

function IconPuzzle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 3h3a2 2 0 0 1 2 2v1.2a1.8 1.8 0 1 0 3.6 0V5a2 2 0 0 1 2-2H21v6h-1.2a1.8 1.8 0 1 0 0 3.6H21V21h-6v-1.2a1.8 1.8 0 1 0-3.6 0V21H3v-6h1.2a1.8 1.8 0 1 0 0-3.6H3V3h6Z" />
    </svg>
  );
}

function IconPalette(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2a10 10 0 0 0 0 20h.2a2 2 0 0 0 1.58-3.23 2 2 0 0 1 1.58-3.2h1.39A5.25 5.25 0 0 0 22 10.12 8.12 8.12 0 0 0 12 2Z" />
      <circle cx="7.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="12" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="16.5" cy="10.5" r=".5" fill="currentColor" />
    </svg>
  );
}

function IconLayers(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </svg>
  );
}

function IconCube(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function IconBox(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function IconGrid(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export type RegistrySourceFilter = 'all' | PublicRegistrySource;

export interface ContentTypePresentation {
  singular: string;
  plural: string;
  icon: ReactNode;
  tone: string;
}

export const CONTENT_TYPE_PRESENTATION: Record<RegistryContentType, ContentTypePresentation> = {
  patterns: {
    singular: 'pattern',
    plural: 'Patterns',
    icon: <IconPuzzle className="registry-type-icon" />,
    tone: 'pattern',
  },
  themes: {
    singular: 'theme',
    plural: 'Themes',
    icon: <IconPalette className="registry-type-icon" />,
    tone: 'theme',
  },
  blueprints: {
    singular: 'blueprint',
    plural: 'Blueprints',
    icon: <IconLayers className="registry-type-icon" />,
    tone: 'blueprint',
  },
  archetypes: {
    singular: 'archetype',
    plural: 'Archetypes',
    icon: <IconCube className="registry-type-icon" />,
    tone: 'archetype',
  },
  shells: {
    singular: 'shell',
    plural: 'Shells',
    icon: <IconBox className="registry-type-icon" />,
    tone: 'shell',
  },
};

export const SOURCE_FILTER_OPTIONS: Array<{ value: RegistrySourceFilter; label: string }> = [
  { value: 'all', label: 'All sources' },
  { value: 'official', label: 'Official' },
  { value: 'community', label: 'Community' },
  { value: 'organization', label: 'Organizations' },
];

export function getAllTypesIcon() {
  return <IconGrid className="registry-type-icon" />;
}

export function getRegistryContentType(type: string): RegistryContentType | null {
  const normalized = type.endsWith('s') ? type : `${type}s`;
  return normalized in CONTENT_TYPE_PRESENTATION
    ? (normalized as RegistryContentType)
    : null;
}

export function getTypePresentation(type: string): ContentTypePresentation {
  const contentType = getRegistryContentType(type) ?? 'blueprints';
  return CONTENT_TYPE_PRESENTATION[contentType];
}

export function getSourceCategory(namespace: string): PublicRegistrySource {
  if (namespace === '@official') return 'official';
  if (namespace.startsWith('@org:')) return 'organization';
  return 'community';
}

function isSystemPublisher(value?: string | null): boolean {
  return typeof value === 'string' && /^system(?:-|$)/i.test(value);
}

function getPublisherSlug(
  namespace: string,
  ownerUsername?: string | null,
  ownerName?: string | null,
): string | null {
  if (namespace === '@official') {
    return 'decantr';
  }
  if (ownerUsername && !isSystemPublisher(ownerUsername)) {
    return ownerUsername;
  }
  if (ownerName && !isSystemPublisher(ownerName)) {
    return ownerName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  return null;
}

export function getDisplaySourceLine(
  item: Pick<ContentItem | DashboardContentItem, 'namespace' | 'owner_username' | 'owner_name'>,
): string {
  const publisher = getPublisherSlug(item.namespace, item.owner_username, item.owner_name);

  if (item.namespace === '@official') {
    return '@official/decantr';
  }

  if (item.namespace.startsWith('@org:')) {
    return publisher ? `${item.namespace}/${publisher}` : item.namespace;
  }

  return publisher ? `@community/${publisher}` : '@community';
}

export function getDisplaySourceLabel(namespace: string): string {
  switch (getSourceCategory(namespace)) {
    case 'official':
      return 'Official';
    case 'organization':
      return 'Organizations';
    case 'community':
    default:
      return 'Community';
  }
}

export function formatContentDate(date?: string): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
