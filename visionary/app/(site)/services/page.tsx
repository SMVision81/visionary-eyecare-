import type { Metadata } from 'next';
import Media from '@/components/media/Media';
import { CollectionBrands, CollectionBudget, CollectionExclusive, FAQ, Label, Promotions, ServicesHero, ServicesReviews } from '@/components/site/Blocks';
import ServiceMenu, { type ServiceMenuItem } from '@/components/site/ServiceMenu';
import type { MediaKey } from '@/lib/media';
import { brands, faqs, services, whatsappLink } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Eye Tests, Spectacles & Lenses in OUG',
  description: `Eye tests, Tokai prescription lenses from Japan, lens edging in 30 minutes, contact lenses and ${brands.length} frame and sunglass labels at OUG Parklane.`,
  alternates: { canonical: '/services' },
};

const slug = (t: string) => t.toLowerCase().replace(/[’']/g, '').replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');

const menu: ServiceMenuItem[] = services.map((s) => ({
  slug: slug(s.title),
  no: s.no,
  title: s.title,
  desc: s.desc,
  tag: s.tag,
  badge: s.badge,
  href: whatsappLink(`Hi Visionary Eyecare, I'd like to ask about ${s.title.toLowerCase()}.`),
}));

// One photo per service, keyed by its number in lib/site.ts (stable even if a title is reworded).
const serviceMedia: Record<string, MediaKey> = {
  '01': 'svcEyeExam',
  '02': 'svcSpectacles',
  '03': 'svcFrames',
  '04': 'svcContacts',
  '05': 'svcEdging',
  '06': 'svcFittings',
  '07': 'svcKids',
};

export default function Services() {
  return (
    <main id="main">
      <ServicesHero />
      <section className="svc" id="services">
        <div className="svc-head">
          <div>
            <Label>What we do</Label>
            <h2>
              Every service, <em>in-house.</em>
            </h2>
          </div>
          <p>From the first eye test to the final adjustment, your care stays with the same experienced team.</p>
        </div>
        <ServiceMenu
          items={menu}
          images={menu.map((s) => (
            <Media key={s.slug} id={serviceMedia[s.no] ?? 'svcFrames'} sizes="(max-width: 860px) 80vw, 460px" />
          ))}
        />
      </section>
      <CollectionExclusive id="collection" />
      <CollectionBrands />
      <CollectionBudget id="budget" />
      <ServicesReviews />
      <FAQ
        items={faqs.services}
        label="Before you choose"
        title="Frames, lenses"
        accent="and more."
        intro="Brands, budgets, contact lenses and the current offer, answered."
        link={{ href: '/contact', label: 'Or send an enquiry →' }}
      />
      <Promotions id="promotions" />
    </main>
  );
}
