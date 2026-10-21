import type { Metadata } from 'next';
import { AboutHero, AboutReviews, AboutStory, AboutVisit, AboutWhy, FAQ } from '@/components/site/Blocks';
import { faqs } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About Us: 20 Years of Eyecare in OUG',
  description: 'Meet Visionary Eyecare: an independent optical shop at OUG Parklane with an in-house optometrist and optician and 20 years of optical experience.',
  alternates: { canonical: '/about' },
};

export default function About() {
  return (
    <main id="main">
      <AboutHero />
      <AboutStory />
      <AboutWhy />
      <AboutVisit />
      <AboutReviews />
      <FAQ
        items={faqs.about}
        label="Good to know"
        title="A little more"
        accent="about us."
        intro="How we work, and what to expect once your glasses are ready."
        link={{ href: '/services', label: 'Explore our services →' }}
      />
    </main>
  );
}
