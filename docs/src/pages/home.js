import { tags } from 'decantr/tags';
import { HeroSection } from '../sections/hero.js';
import { PowerSection } from '../sections/power.js';
import { FeaturesSection } from '../sections/features.js';
import { QuotesSection } from '../sections/quotes.js';
import { PhilosophySection } from '../sections/philosophy.js';
import { SiteFooter } from '../sections/footer.js';

const { div } = tags;

export function HomePage() {
  return div(
    HeroSection(),
    PowerSection(),
    FeaturesSection(),
    QuotesSection(),
    PhilosophySection(),
    SiteFooter(),
  );
}
