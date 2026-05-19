import type { Metadata } from 'next';
import { ScanExperience } from './scan-client';

export const metadata: Metadata = {
  title: 'Scan an existing app | Decantr',
  description:
    'Run a read-only Decantr Brownfield scan against a public GitHub repo or GitHub Pages site.',
};

export default function ScanPage() {
  return <ScanExperience />;
}
