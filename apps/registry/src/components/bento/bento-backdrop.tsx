import { GeoPattern } from './geo-pattern';

const TYPE_ACCENTS: Record<string, string> = {
  pattern: '#F58882',
  theme: '#FDA303',
  blueprint: '#0AF3EB',
  shell: '#00E0AB',
  archetype: '#6500C6',
};

interface BentoBackdropProps {
  type: string;
  screenshotUrl?: string | null;
  dataCount?: number;
}

export function BentoBackdrop({ type, screenshotUrl, dataCount = 5 }: BentoBackdropProps) {
  const accent = TYPE_ACCENTS[type] || '#FDA303';

  if (screenshotUrl) {
    return (
      <div
        className="lum-backdrop-screenshot"
        style={{ backgroundImage: `url(${screenshotUrl})` }}
        aria-hidden="true"
      />
    );
  }

  return (
    <>
      <div className="lum-backdrop-orbs" aria-hidden="true" />
      <GeoPattern type={type} dataCount={dataCount} accentColor={accent} />
    </>
  );
}
