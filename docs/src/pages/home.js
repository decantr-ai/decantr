import { tags } from 'decantr/tags';
import { HeroSection } from '../sections/hero.js';

const { div } = tags;

export function HomePage() {
  return div(
    HeroSection(),
  );
}
