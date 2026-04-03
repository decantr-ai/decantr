import { NavHeader } from '../../components/patterns/NavHeader';
import { Hero } from '../../components/patterns/Hero';
import { Features } from '../../components/patterns/Features';
import { HowItWorks } from '../../components/patterns/HowItWorks';
import { Pricing } from '../../components/patterns/Pricing';
import { Testimonials } from '../../components/patterns/Testimonials';
import { CtaSection } from '../../components/patterns/CtaSection';
import { Footer } from '../../components/patterns/Footer';
import {
  features,
  howItWorksSteps,
  pricingTiers,
  testimonials,
} from '../../data/marketing';

export function Home() {
  return (
    <>
      <NavHeader />
      <Hero />
      <Features features={features} />
      <HowItWorks steps={howItWorksSteps} />
      <Pricing tiers={pricingTiers} />
      <Testimonials testimonials={testimonials} />
      <CtaSection />
      <Footer />
    </>
  );
}
