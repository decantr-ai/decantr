interface Props {
  type: string;
  screenshotUrl: string | null;
  dataCount: number;
}

function generateGeoSvg(type: string, count: number, accent: string): string {
  const cx = 400;
  const cy = 300;
  const safeCount = Math.max(3, Math.min(count, 20));

  if (type === 'pattern') {
    // Connected node graph
    const nodes: { x: number; y: number }[] = [];
    for (let i = 0; i < safeCount; i++) {
      const angle = (i / safeCount) * Math.PI * 2;
      const r = 120 + Math.sin(i * 1.5) * 60;
      nodes.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
    }
    const lines = nodes
      .map((n, i) => {
        const next = nodes[(i + 1) % nodes.length];
        return `<line x1="${n.x}" y1="${n.y}" x2="${next.x}" y2="${next.y}" stroke="${accent}" stroke-width="1"/>`;
      })
      .join('');
    const circles = nodes
      .map((n) => `<circle cx="${n.x}" cy="${n.y}" r="4" fill="${accent}"/>`)
      .join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">${lines}${circles}</svg>`;
  }

  if (type === 'theme') {
    // Concentric circles
    const circles = Array.from({ length: safeCount }, (_, i) => {
      const r = 30 + i * 25;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${accent}" stroke-width="1"/>`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">${circles}</svg>`;
  }

  if (type === 'blueprint') {
    // Intersecting circles
    const circles = Array.from({ length: safeCount }, (_, i) => {
      const angle = (i / safeCount) * Math.PI * 2;
      const x = cx + Math.cos(angle) * 80;
      const y = cy + Math.sin(angle) * 80;
      return `<circle cx="${x}" cy="${y}" r="100" fill="none" stroke="${accent}" stroke-width="1"/>`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">${circles}</svg>`;
  }

  if (type === 'shell') {
    // Rectangular wireframe regions
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <rect x="200" y="100" width="400" height="400" fill="none" stroke="${accent}" stroke-width="1"/>
      <rect x="200" y="100" width="400" height="50" fill="none" stroke="${accent}" stroke-width="1"/>
      <rect x="200" y="150" width="100" height="350" fill="none" stroke="${accent}" stroke-width="1"/>
      <rect x="300" y="150" width="300" height="350" fill="none" stroke="${accent}" stroke-width="1"/>
    </svg>`;
  }

  // Archetype: radial spokes
  const spokes = Array.from({ length: safeCount }, (_, i) => {
    const angle = (i / safeCount) * Math.PI * 2;
    const x2 = cx + Math.cos(angle) * 180;
    const y2 = cy + Math.sin(angle) * 180;
    return `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${accent}" stroke-width="1"/>`;
  }).join('');
  const endDots = Array.from({ length: safeCount }, (_, i) => {
    const angle = (i / safeCount) * Math.PI * 2;
    const x = cx + Math.cos(angle) * 180;
    const y = cy + Math.sin(angle) * 180;
    return `<circle cx="${x}" cy="${y}" r="4" fill="${accent}"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><circle cx="${cx}" cy="${cy}" r="6" fill="${accent}"/>${spokes}${endDots}</svg>`;
}

const TYPE_ACCENT_MAP: Record<string, string> = {
  pattern: '#F58882',
  theme: '#FDA303',
  blueprint: '#0AF3EB',
  shell: '#00E0AB',
  archetype: '#6500C6',
};

export function BentoBackdrop({ type, screenshotUrl, dataCount }: Props) {
  const accent = TYPE_ACCENT_MAP[type] || '#FDA303';

  if (screenshotUrl) {
    return (
      <div
        className="lum-backdrop-screenshot"
        style={{ backgroundImage: `url(${screenshotUrl})` }}
      />
    );
  }

  const geoSvg = generateGeoSvg(type, dataCount, accent);
  const encodedSvg = `data:image/svg+xml,${encodeURIComponent(geoSvg)}`;

  return (
    <>
      <div className="lum-backdrop-orbs" />
      <div
        className="lum-backdrop-geo"
        style={{ backgroundImage: `url("${encodedSvg}")` }}
      />
    </>
  );
}
