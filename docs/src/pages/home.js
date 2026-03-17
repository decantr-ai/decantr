import { SiteShell } from '../layouts/site-shell.js';
import { HeroSection } from '../sections/hero.js';
import { GalleryPreviewSection } from '../sections/gallery-preview.js';
import { ShowcaseSection } from '../sections/showcase.js';
import { PhilosophySection } from '../sections/philosophy.js';
import { ProcessHero } from '../sections/process-hero.js';
import { SiteFooter } from '../sections/footer.js';

export function HomePage() {
  return SiteShell(
    // Section 1: The Hook — above the fold
    HeroSection(),
    // Section 2: The Proof — showcase gallery preview
    GalleryPreviewSection(),
    // Section 3: The Details — for the curious
    ShowcaseSection(),
    ProcessHero(),
    PhilosophySection(),
    SiteFooter(),
  );
}
