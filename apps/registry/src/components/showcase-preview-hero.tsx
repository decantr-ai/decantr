interface Props {
  slug: string;
  title: string;
}

export function ShowcasePreviewHero({ slug, title }: Props) {
  const previewSrc = `/showcase/${slug}/preview.png`;

  return (
    <div className="lum-preview-hero" style={{ marginBottom: '2rem' }}>
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2rem 1.5rem',
          gap: '1.5rem',
        }}
      >
        <div className="lum-preview-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt={`Preview of ${title}`}
            style={{ width: '100%', display: 'block' }}
          />
        </div>
      </div>
    </div>
  );
}
