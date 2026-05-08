import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { ContentItem, DashboardContentItem } from '@/lib/api';
import { getShowcaseUrl, type ShowcaseMetadata } from '@/lib/showcase';
import {
  formatContentDate,
  getDisplaySourceLine,
  getTypePresentation,
} from '@/lib/content-presentation';

export function ContentCard({
  item,
  editable,
  showcaseMetadata,
  staggerIndex,
}: {
  item: ContentItem | DashboardContentItem;
  editable?: boolean;
  showcaseMetadata?: ShowcaseMetadata | null;
  staggerIndex?: number;
}) {
  const typePresentation = getTypePresentation(item.type);
  const href = `/${item.type}/${encodeURIComponent(item.namespace)}/${item.slug}`;
  const name = item.name || item.slug;
  const sourceLine = getDisplaySourceLine(item);
  const itemStatus = 'status' in item ? item.status : null;
  const primaryActionLabel = typePresentation.singular === 'blueprint' ? 'Open launchpad' : 'Open details';
  const showcaseUrl = showcaseMetadata?.verification?.build.passed && showcaseMetadata?.verification?.smoke.passed
    ? getShowcaseUrl(item.slug, showcaseMetadata)
    : null;
  const isBlueprint = typePresentation.singular === 'blueprint';
  const previewImageUrl = showcaseMetadata?.thumbnail?.src ?? item.thumbnail_url ?? null;
  const showcaseStatusLabel = isBlueprint
    ? showcaseMetadata?.goldenCandidate
      ? 'Benchmark'
      : showcaseUrl
      ? 'Live showcase'
      : 'Showcase pending'
    : null;
  const showcaseStatus = showcaseMetadata?.goldenCandidate
    ? 'benchmark'
    : showcaseUrl
    ? 'live'
    : 'pending';
  const cardStyle =
    typeof staggerIndex === 'number'
      ? ({ '--d-stagger-index': staggerIndex } as CSSProperties)
      : undefined;

  return (
    <article
      className="lum-card-outlined registry-card d-enter-fade d-lift-hover"
      data-type={typePresentation.singular}
      style={cardStyle}
    >
      {previewImageUrl ? (
        <div className="registry-card-media">
          <img
            src={previewImageUrl}
            alt={`${name} preview`}
            className="registry-card-media-image"
            loading="lazy"
          />
        </div>
      ) : null}

      <div className="registry-card-content">
        <div className="registry-card-title-row">
          <Link href={href} className="registry-card-title no-underline">
            {name}
          </Link>
          <span className="d-annotation registry-type-chip" data-type-tone={typePresentation.tone}>
            {typePresentation.icon}
            <span>{typePresentation.singular}</span>
          </span>
        </div>

        {item.description ? (
          <p className="registry-card-description">{item.description}</p>
        ) : null}

        <div className="registry-card-footer">
          <div className="registry-card-meta">
            <span className="registry-card-meta-item registry-card-source">{sourceLine}</span>
            {item.version ? (
              <span className="registry-card-meta-item">v{item.version}</span>
            ) : null}
            {item.published_at ? (
              <span className="registry-card-meta-item">{formatContentDate(item.published_at)}</span>
            ) : null}
          </div>

          {showcaseStatusLabel ? (
            <span className="registry-card-showcase-status" data-status={showcaseStatus}>
              {showcaseStatusLabel}
            </span>
          ) : null}

          <div className="registry-card-action-row">
            <Link href={href} className="d-interactive registry-card-open" data-variant="primary">
              <svg
                className="registry-card-action-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
              <span>{primaryActionLabel}</span>
            </Link>

            {showcaseUrl ? (
              <a
                href={showcaseUrl}
                target="_blank"
                rel="noreferrer"
                className="d-interactive registry-card-showcase"
                data-variant="ghost"
                aria-label={`Open showcase for ${name}`}
              >
                <svg
                  className="registry-card-action-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 17 17 7" />
                  <path d="M7 7h10v10" />
                </svg>
                <span>Showcase</span>
              </a>
            ) : null}
          </div>
        </div>

        {editable ? (
          <div className="registry-card-edit-row">
            {itemStatus ? (
              <span className="d-annotation" data-status={itemStatus === 'published' ? 'success' : itemStatus === 'pending' ? 'warning' : 'info'}>
                {itemStatus}
              </span>
            ) : null}
            <div className="registry-card-actions">
              <button className="d-interactive registry-card-action" data-variant="ghost" aria-label="Edit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button className="d-interactive registry-card-action registry-card-action-danger" data-variant="ghost" aria-label="Delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
