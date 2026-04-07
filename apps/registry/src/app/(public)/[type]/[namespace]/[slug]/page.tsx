import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getContent } from '@/lib/api';
import { ThemeLabProvider } from '@/components/theme-lab-provider';
import {
  BentoGrid,
  BentoBackdrop,
  TerminalCard,
  IdentityCard,
  TagsCard,
  UsedByCard,
  SchemaCard,
  SparklineCard,
  ComposeCard,
  FeaturesCard,
  ThemePreviewCard,
  RoutesCard,
  PersonalityCard,
  RouteMapCard,
  VisualBriefCard,
  ComponentsCard,
  PresetsCard,
  ResponsiveCard,
  SlotsCard,
  PaletteCard,
  DecoratorsCard,
  ModesShapesCard,
} from '@/components/bento';

const TYPE_ACCENTS: Record<string, string> = {
  pattern: '#F58882',
  theme: '#FDA303',
  blueprint: '#0AF3EB',
  shell: '#00E0AB',
  archetype: '#6500C6',
};

interface Props {
  params: Promise<{ type: string; namespace: string; slug: string }>;
}

function getInstallCommand(singularType: string, namespace: string, slug: string): string {
  if (singularType === 'blueprint') return `decantr init --blueprint=${slug}`;
  if (singularType === 'theme') return `decantr theme switch ${slug}`;
  return `decantr get ${singularType} ${namespace}/${slug}`;
}

function getScreenshotUrl(singularType: string, slug: string): string | null {
  if (singularType !== 'blueprint') return null;
  return `/showcase/${slug}/preview.png`;
}

function getDataCount(singularType: string, data: Record<string, unknown>): number {
  if (singularType === 'pattern' && Array.isArray(data.components)) return data.components.length;
  if (singularType === 'theme' && data.seed && typeof data.seed === 'object') return Object.keys(data.seed).length;
  if (singularType === 'blueprint' && Array.isArray(data.compose)) return data.compose.length;
  if (singularType === 'archetype' && data.pages && typeof data.pages === 'object') {
    return Array.isArray(data.pages) ? data.pages.length : Object.keys(data.pages).length;
  }
  return 5;
}

export default async function ContentDetailPage({ params }: Props) {
  const { type, namespace: rawNamespace, slug } = await params;
  const namespace = decodeURIComponent(rawNamespace);
  const singularType = type.endsWith('s') ? type.slice(0, -1) : type;

  let content: any;
  try {
    content = await getContent(type, namespace, slug);
  } catch (error: any) {
    if (error?.message?.includes('404') || error?.message?.includes('not found')) {
      notFound();
    }
    return (
      <div className="max-w-5xl mx-auto py-16">
        <div className="d-surface flex flex-col items-center gap-3 py-12">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--d-error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm text-d-muted">
            Failed to load content. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const data = (content.data || {}) as Record<string, unknown>;
  const installCmd = getInstallCommand(singularType, namespace, slug);
  const screenshotUrl = getScreenshotUrl(singularType, content.slug || slug);
  const dataCount = getDataCount(singularType, data);
  const accent = TYPE_ACCENTS[singularType] || '#FDA303';

  const pageContent = (
    <div
      data-type={singularType}
      style={{ position: 'relative', minHeight: '100vh', '--lum-type-accent': accent } as React.CSSProperties}
    >
      <BentoBackdrop
        type={singularType}
        screenshotUrl={screenshotUrl}
        dataCount={dataCount}
      />

      {/* Breadcrumb */}
      <nav
        className="relative z-10 max-w-[1200px] mx-auto px-6 flex items-center gap-1.5 py-4"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="text-xs text-d-muted no-underline hover:text-d-text transition-colors">
          Registry
        </Link>
        <span className="text-xs text-d-muted opacity-60">/</span>
        <Link href={`/browse/${type}`} className="text-xs text-d-muted no-underline hover:text-d-text transition-colors">
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Link>
        <span className="text-xs text-d-muted opacity-60">/</span>
        <span className="text-xs text-d-muted">{namespace}</span>
        <span className="text-xs text-d-muted opacity-60">/</span>
        <span className="text-xs text-d-text">{slug}</span>
      </nav>

      <BentoGrid type={singularType}>
        {/* Universal cards */}
        <IdentityCard
          type={singularType}
          namespace={namespace}
          name={content.name || slug}
          version={content.version || '0.0.0'}
          description={content.description}
          publishedAt={content.published_at}
          ownerName={content.owner_name}
        />

        <TerminalCard command={installCmd} />

        {/* Blueprint-specific cards */}
        {singularType === 'blueprint' && (
          <>
            <ComposeCard compose={data.compose as any} />
            <FeaturesCard features={data.features as string[]} />
            <ThemePreviewCard theme={data.theme as any} />
            <RoutesCard
              routes={data.routes as Record<string, unknown>}
              sections={data.compose as any}
            />
            <PersonalityCard personality={data.personality as string} />
            <RouteMapCard sections={data.compose as any} />
          </>
        )}

        {/* Pattern-specific cards */}
        {singularType === 'pattern' && (
          <>
            <VisualBriefCard visualBrief={data.visual_brief as string} />
            <ComponentsCard components={data.components as string[]} />
            <PresetsCard
              presets={data.presets as Record<string, { description?: string }>}
              defaultPreset={data.default_preset as string}
            />
            <ResponsiveCard responsive={data.responsive as any} />
            <SlotsCard slots={(data.default_layout as any)?.slots as Record<string, string>} />
          </>
        )}

        {/* Theme-specific cards */}
        {singularType === 'theme' && (
          <>
            <PaletteCard
              palette={data.palette as Record<string, string>}
              seed={data.seed as Record<string, string>}
            />
            <DecoratorsCard decorators={data.decorator_definitions as any} />
            <ModesShapesCard
              modes={data.modes as string[]}
              shapes={data.shapes as string[]}
            />
          </>
        )}

        {/* Archetype-specific -- reuse features */}
        {singularType === 'archetype' && (
          <>
            <FeaturesCard features={data.features as string[]} />
          </>
        )}

        <TagsCard tags={data.tags as string[]} />
        <UsedByCard count={0} />
        <SparklineCard type={singularType} />
        <SchemaCard data={data} title={`${namespace}/${slug}`} />
      </BentoGrid>
    </div>
  );

  /* Theme pages auto-preview the theme's colors */
  if (singularType === 'theme' && data.seed && typeof data.seed === 'object') {
    return (
      <ThemeLabProvider>
        {pageContent}
      </ThemeLabProvider>
    );
  }

  return pageContent;
}
