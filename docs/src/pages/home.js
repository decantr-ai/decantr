import { SiteShell } from '../layouts/site-shell.js';
import { HeroSection } from '../sections/hero.js';
import { PowerSection } from '../sections/power.js';
import { FeaturesSection } from '../sections/features.js';
import { ShowcaseSection } from '../sections/showcase.js';
import { PhilosophySection } from '../sections/philosophy.js';
import { QuotesSection } from '../sections/quotes.js';
import { PricingSection } from '../sections/pricing.js';
import { ProcessHero } from '../sections/process-hero.js';
import { SiteFooter } from '../sections/footer.js';

export function HomePage() {
  return SiteShell(
    HeroSection(),
    PowerSection(),
    FeaturesSection(),
    ShowcaseSection(),
    PhilosophySection(),
    QuotesSection(),
    PricingSection(),
    ProcessHero(),
    SiteFooter(),
  );
}
