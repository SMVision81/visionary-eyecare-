import type { MediaKey } from './media';

export const phone = { display: '012-948 9141', tel: '+60129489141', wa: '60129489141' };

export const whatsappLink = (text?: string) =>
  `https://wa.me/${phone.wa}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const enquiryLink = whatsappLink("Hi Visionary Eyecare, I'd like to make an enquiry.");
export const bookingLink = whatsappLink("Hi Visionary Eyecare, I'd like to book an eye test.");
// Confirmed from the Google Business Profile (manager view, 21 Oct 2026).
export const address = {
  street: 'D3-0-27, OUG Parklane, Jalan 1/152',
  postcode: '58200',
  city: 'Kuala Lumpur',
  region: 'Wilayah Persekutuan Kuala Lumpur',
  // Map pin from the Business Profile export (Takeout, 21 Oct 2026).
  geo: { latitude: 3.0670622, longitude: 101.6575469 },
};
export const addressLine = `${address.street}, ${address.postcode} ${address.city}`;

// Google rating + review count, read from the Business Profile. Snapshot until the review import (Phase B) refreshes it:
// update both numbers and `asOf` on every import. Never compute these from the reviews shown on the site.
export const googleProfile = { rating: 5.0, reviewCount: 2509, asOf: '2026-10-21' };

// Official social profiles (shown on the Business Profile search result).
export const socialProfiles = {
  instagram: 'https://www.instagram.com/visionaryeyecarepuchong/',
  facebook: 'https://www.facebook.com/VisionaryEyecare7/',
};

// Google Business Profile share link (knowledge panel with all reviews); tracking parameters removed.
export const reviewsLink = 'https://www.google.com/search?kgmid=/g/11l4mzqmr8&q=Visionary+Eyecare+Oug+Parklane';
// Google Business Profile "Ask for reviews" link: opens the write-a-review form directly (from the manager view, 21 Oct 2026).
export const leaveReviewLink = 'https://g.page/r/CZgiPpR9rb7lEBM/review';
export const mapsLink = 'https://www.google.com/maps/search/?api=1&query=Visionary+Eyecare+Oug+Parklane+D3-0-27+Jalan+1%2F152+58200+Kuala+Lumpur';
export const mapsEmbed = 'https://www.google.com/maps?q=Visionary+Eyecare+OUG+Parklane+Kuala+Lumpur&output=embed';

// Public site address used for canonical URLs, the sitemap and social previews. Set NEXT_PUBLIC_SITE_URL in production
// (PLACEHOLDER until the domain is confirmed; see TODO.md).
// A blank, scheme-less or malformed value falls back instead of breaking the build (new URL() throws).
function resolveSiteUrl(raw?: string) {
  const fallback = 'http://localhost:3000';
  try {
    return new URL(raw?.trim() || fallback).origin;
  } catch {
    return fallback;
  }
}
// Netlify sets URL (the site's primary address) at build time, so a deploy without NEXT_PUBLIC_SITE_URL still gets real URLs.
export const siteUrl = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.URL);

export const hours = [
  { days: 'Monday — Saturday', time: '10:00am — 8:30pm' },
  { days: 'Sunday', time: '10:30am — 6:00pm' },
];

// The same hours in machine-readable form for search engines (keep in sync with `hours`).
export const openingHours = [
  { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '10:00', closes: '20:30' },
  { days: ['Sunday'], opens: '10:30', closes: '18:00' },
];

// `short` (optional) replaces the label on phones, where the hero proof row is narrow.
export const stats: { value: string; label: string; short?: string }[] = [
  { value: '20+', label: 'Years of experience' },
  { value: '15', label: 'Frame & sunglass brands', short: 'Eyewear brands' },
  { value: '3', label: 'Exclusive labels' },
];

export const brands = [
  'AKONI', 'PROJEKT PRODUKT', 'MOVITRA', 'RAY-BAN', 'TOMMY HILFIGER', 'OAKLEY', 'FILA', 'AGNÈS B.',
  'NEW BALANCE', 'P+US', 'GUY LAROCHE', 'CARPE DIEM', 'HUMARS', 'MASARATA', 'MASUNAGA',
];

export const exclusiveBrands = ['AKONI', 'PROJEKT PRODUKT', 'MOVITRA'];

export const brandMedia: Record<string, MediaKey> = {
  'AKONI': 'brandAkoni',
  'PROJEKT PRODUKT': 'brandProjektProdukt',
  'MOVITRA': 'brandMovitra',
  'RAY-BAN': 'brandRayBan',
  'TOMMY HILFIGER': 'brandTommyHilfiger',
  'OAKLEY': 'brandOakley',
  'FILA': 'brandFila',
  'AGNÈS B.': 'brandAgnesB',
  'NEW BALANCE': 'brandNewBalance',
  'P+US': 'brandPPlusUs',
  'GUY LAROCHE': 'brandGuyLaroche',
  'CARPE DIEM': 'brandCarpeDiem',
  'HUMARS': 'brandHumars',
  'MASARATA': 'brandMasarata',
  'MASUNAGA': 'brandMasunaga',
};

// Landscape campaign photos: crop focus (or 'contain') so the frames are never cut off in the portrait cards.
export const brandFit: Record<string, { position?: string }> = {
  'AGNÈS B.': { position: '72% 50%' },
};

export const brandLink = (name: string) => whatsappLink(`Hi Visionary Eyecare, I'd like to see ${name} frames.`);

// Set active to false when the Buy 3 Free 1 promotion ends: the promo section, header and footer links,
// FAQ entry and service badge all disappear.
export const promo = { active: true };

export type Service = { no: string; title: string; tag: string; desc: string; badge?: string };

export const services: Service[] = [
  {
    no: '01',
    title: 'Eye Examinations',
    tag: 'By our in-house optometrist',
    desc: 'A calm, thorough check of your vision, with clear advice on what your eyes need next.',
  },
  {
    no: '02',
    title: 'Prescription Spectacles',
    tag: 'Fitted by our optician',
    desc: 'Lenses tailored to your prescription, routine and style — adjusted until they feel right.',
  },
  {
    no: '03',
    title: 'Frames & Sunglasses',
    tag: '15 brands · 3 exclusive',
    desc: 'Premium labels and affordable everyday frames, including names you won’t find elsewhere nearby.',
  },
  {
    no: '04',
    title: 'Contact Lenses',
    tag: 'Clear, daily & colour',
    desc: 'Bionics, Manxion and FreshLady lenses, with guidance for first-time and experienced wearers.',
    badge: promo.active ? 'Buy 3 Free 1' : undefined,
  },
  {
    no: '05',
    title: 'Fittings & Adjustments',
    tag: 'Comfort & fit',
    desc: 'Small changes make a big difference. Come in for a fit check, clean or adjustment.',
  },
  {
    no: '06',
    title: 'Kids’ Eyecare',
    tag: 'Patient & friendly',
    desc: 'Gentle, unhurried support to help younger eyes grow with good vision habits.',
  },
];

export const promotions: { brand: string; tagline: string; detail: string; stat: string; statLabel: string; media: MediaKey }[] = [
  {
    brand: 'Bionics Color Touch',
    tagline: 'Colour lenses with 12 shades',
    detail: 'From Platinum Gray to Hazel Wish. Selected shades are available in toric and plus power.',
    stat: '12',
    statLabel: 'colour shades',
    media: 'promoBionics',
  },
  {
    brand: 'Manxion',
    tagline: 'Natural-looking tints',
    detail: 'Nine tints including Sour Gray, Sky Brown, Mocha and Violet.',
    stat: '9',
    statLabel: 'natural tints',
    media: 'promoManxion',
  },
  {
    brand: 'FreshLady Daily Disposable',
    tagline: 'Soft daily lenses',
    detail: 'Premium soft lenses with 55% water content, in eight shades from Polar Lights Brown to Moonlight.',
    stat: '8',
    statLabel: 'daily shades',
    media: 'promoFreshlady',
  },
];

export type Faq = { q: string; a: string };

export const faqs: Record<'home' | 'about' | 'services' | 'contact', Faq[]> = {
  home: [
    {
      q: 'I haven’t had an eye test in years. Where do I start?',
      a: 'Start with an eye examination. Our in-house optometrist will check your vision, explain the results in plain language and talk you through your options, with no pressure.',
    },
    {
      q: 'Who will examine my eyes?',
      a: 'Eye tests are carried out by our in-house optometrist, and our optician takes care of lens and frame fitting. Together, the team brings 20 years of experience in the optical field.',
    },
    {
      q: 'Do I need to book an eye test in advance?',
      a: `You’re welcome to visit during opening hours. To make sure we can set aside time for you, WhatsApp or call us on ${phone.display} before you come.`,
    },
    {
      q: 'Do you sell contact lenses?',
      a: 'Yes. We carry clear, daily and colour contact lenses, including Bionics, Manxion and FreshLady, and we guide you through choosing and wearing them.',
    },
    {
      q: 'Why do my eyes feel tired after a day on screens?',
      a: 'Long hours on screens often leave eyes tired or strained. An eye examination is the best way to find out whether glasses or a new prescription would help.',
    },
    {
      q: 'Can I just WhatsApp you instead of calling?',
      a: `Of course. WhatsApp us on ${phone.display} with your question or to arrange a visit. It is often the quickest way to reach us.`,
    },
  ],
  about: [
    {
      q: 'Is Visionary Eyecare an independent optical shop?',
      a: 'Yes. We are an independent optical outlet at OUG Parklane, Kuala Lumpur, with our own in-house optometrist and optician.',
    },
    {
      q: 'Do you look after my glasses after I buy them?',
      a: 'Yes. Come in for a fit check, a lens clean or a frame adjustment whenever your glasses need it.',
    },
    {
      q: 'Can I ask questions during my eye test?',
      a: 'Please do. Our optometrist explains what they find in plain language, and you can ask about anything before you decide.',
    },
  ],
  services: [
    {
      q: 'Which frame brands do you carry?',
      a: `We carry 15 frame and sunglass brands: ${brands.join(', ')}. ${exclusiveBrands.join(', ')} are available exclusively with us in the area.`,
    },
    {
      q: 'Do you have affordable frames?',
      a: 'Yes. Alongside our premium labels, we carry a wide range of affordable frames, with some styles under RM100. Tell us your budget and we will show you what fits it.',
    },
    ...(promo.active
      ? [
          {
            q: 'What is included in the Buy 3 Free 1 promotion?',
            a: 'Buy three boxes of selected Bionics Color Touch, Manxion or FreshLady contact lenses and receive one box free. Ask us about eligible shades and powers.',
          },
        ]
      : []),
    {
      q: 'Can I try contact lenses for the first time?',
      a: 'Yes. We will guide first-time wearers through choosing, wearing and caring for their lenses.',
    },
    {
      q: 'Do you offer eyecare for children?',
      a: 'Yes. Our team offers gentle, unhurried support for younger eyes. WhatsApp us to arrange a visit.',
    },
  ],
  contact: [
    {
      q: 'What are your opening hours?',
      a: hours.map((h) => `${h.days}: ${h.time}`).join('. ') + '.',
    },
    {
      q: 'How will you reply to my enquiry?',
      a: `We reply on WhatsApp or by phone, using the number you give us. For the quickest answer, message us directly on ${phone.display}.`,
    },
    {
      q: 'Where can I find you?',
      a: `We are at ${addressLine}. Use the Get Directions button on this page to open the map.`,
    },
  ],
};
