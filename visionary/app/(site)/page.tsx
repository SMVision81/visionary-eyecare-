import type { Metadata } from 'next';
import { BrandStrip, Contrast, Explore, FAQ, Hero, JsonLd, PanelNote, ReviewWall, WhatWeDo } from '@/components/site/Blocks';
import { address, brands, email, faqs, mapsLink, openingHours, phone, reviewsLink, siteUrl, socialProfiles } from '@/lib/site';

export const metadata: Metadata = {
  title: { absolute: 'Eye Test & Optical Shop, OUG Parklane KL | Visionary Eyecare' },
  description: `Eye tests by our in-house optometrist, ${brands.length} frame and sunglass labels and contact lenses at OUG Parklane, near Old Klang Road. WhatsApp us in one tap.`,
  alternates: { canonical: '/' },
};

// Local business details for Google: confirmed facts only (address from the Business Profile). No aggregateRating
// (self-served review markup is not eligible) and no price range until confirmed.
const businessLd = {
  '@context': 'https://schema.org',
  '@type': 'Optician',
  '@id': `${siteUrl}/#business`,
  name: 'Visionary Eyecare',
  url: siteUrl,
  description: 'Independent optical shop at OUG Parklane, Kuala Lumpur, with an in-house optometrist and optician and 20 years of optical experience: eye examinations, prescription spectacles with Tokai lenses imported from Japan, lens edging, frames and sunglasses, contact lenses, fittings and kids’ eyecare.',
  image: `${siteUrl}/media/images/store-interior.jpg`,
  logo: `${siteUrl}/images/logo.png`,
  brand: brands.map((name) => ({ '@type': 'Brand', name })),
  telephone: phone.tel,
  email,
  hasMap: mapsLink,
  address: { '@type': 'PostalAddress', streetAddress: address.street, postalCode: address.postcode, addressLocality: address.city, addressRegion: address.region, addressCountry: 'MY' },
  geo: { '@type': 'GeoCoordinates', ...address.geo },
  sameAs: [reviewsLink, socialProfiles.facebook, socialProfiles.instagram],
  areaServed: ['OUG', 'Old Klang Road', 'Kuala Lumpur'],
  openingHoursSpecification: openingHours.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens, closes: h.closes })),
};

export default function Home() {
  return (
    <main id="main">
      <JsonLd data={businessLd} />
      <Hero />
      <BrandStrip />
      <Contrast />
      <WhatWeDo />
      <PanelNote />
      <Explore />
      <ReviewWall />
      <FAQ
        items={faqs.home}
        label="Common questions"
        title="Before you"
        accent="visit."
        intro="Starting out? A few quick answers. Still curious? Message us — we are happy to help."
        quote="“Good eyecare starts with a proper conversation.”"
        link={{ href: '/contact', label: 'Or send an enquiry →' }}
      />
    </main>
  );
}
