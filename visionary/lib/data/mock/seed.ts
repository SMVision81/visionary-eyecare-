import { googleProfile } from '@/lib/site';
// DEMO DATA ONLY. These are NOT real customer reviews or enquiries.
// Used while DATA_SOURCE=mock so the admin panel can be designed and tested.
// Must never be shown on the live site (Phase B replaces this with Supabase + Google sync).
import type { Enquiry, GoogleStats, Review } from '../../types';
import { shortName } from '../../reviews';

const ago = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

type SeedReview = Pick<Review, 'authorName' | 'rating' | 'originalText' | 'status'> &
  Partial<Pick<Review, 'displayText' | 'featured' | 'sortOrder'>> & { hoursAgo: number };


const seedReviews: SeedReview[] = [
  { authorName: 'Aina Mahmud', rating: 5, status: 'live', featured: true, hoursAgo: 30, originalText: 'The team was patient, professional and made choosing new glasses feel easy.' },
  { authorName: 'Daniel Tan', rating: 5, status: 'live', hoursAgo: 80, originalText: 'Very friendly service and a great selection of frames. Highly recommended.' },
  { authorName: 'Nur Syafiqah', rating: 5, status: 'live', hoursAgo: 150, originalText: 'A comfortable eye test and honest advice from start to finish.' },
  { authorName: 'Kavitha Raman', rating: 5, status: 'pending', hoursAgo: 3, originalText: 'Came in for an eye test after work and was seen quickly. The optometrist explained everything clearly and helped me pick lenses for my screen time. Will be back for my kids.' },
  { authorName: 'Jason Lim', rating: 4, status: 'pending', hoursAgo: 9, originalText: 'Good range of frames, staff very helpfull. Had to wait abit on saturday but worth it.' },
  { authorName: 'Siti Aminah', rating: 5, status: 'pending', hoursAgo: 20, originalText: 'Bought colour contact lenses with the buy 3 free 1 promo. Very good price and they taught me how to wear them properly.' },
  { authorName: 'Ravi Kumar', rating: 3, status: 'pending', hoursAgo: 44, originalText: 'Service ok. Glasses took a few days longer than promised.' },
  { authorName: 'Mei Ling Wong', rating: 5, status: 'pending', hoursAgo: 60, originalText: 'Found an AKONI frame here that I could not find anywhere else nearby. Fitting was perfect.' },
  { authorName: 'Ahmad Faiz', rating: 5, status: 'hidden', hoursAgo: 200, originalText: 'Good.' },
  { authorName: 'Priya Nair', rating: 5, status: 'live', hoursAgo: 260, sortOrder: 1, originalText: 'Lovely team. They adjusted my old frames for free and did not push me to buy anything.' },
  { authorName: 'Spam Account', rating: 1, status: 'removed', hoursAgo: 300, originalText: 'Visit my page for cheap followers!!!' },
  { authorName: 'Hafiz Rahman', rating: 5, status: 'live', hoursAgo: 400, displayText: 'Professional eye test, very thorough. Highly recommend Visionary Eyecare.', originalText: 'Professional eye test, very throrough. Highly recomend Visionary Eyecare to everyone in OUG!' },
];

export function buildSeedReviews(): Review[] {
  return seedReviews.map((r, i) => {
    const date = ago(r.hoursAgo);
    const displayText = r.displayText ?? null;
    return {
      id: `rev_${String(i + 1).padStart(3, '0')}`,
      source: 'google',
      googleReviewId: `demo-google-${i + 1}`,
      authorName: r.authorName,
      authorPhotoUrl: null,
      rating: r.rating,
      originalText: r.originalText,
      reviewDate: date,
      displayName: shortName(r.authorName),
      displayText,
      isEdited: displayText !== null,
      status: r.status,
      featured: r.featured ?? false,
      sortOrder: r.sortOrder ?? 0,
      phone: null,
      syncedAt: date,
      updatedAt: date,
    };
  });
}

export function buildSeedEnquiries(): Enquiry[] {
  const base = (
    i: number,
    e: Pick<Enquiry, 'name' | 'phone' | 'interest' | 'message' | 'status'> & { hoursAgo: number },
  ): Enquiry => ({
    id: `enq_${String(i).padStart(3, '0')}`,
    name: e.name,
    phone: e.phone,
    interest: e.interest,
    message: e.message,
    status: e.status,
    createdAt: ago(e.hoursAgo),
    openedAt: e.status === 'new' ? null : ago(e.hoursAgo - 0.5),
    repliedAt: e.status === 'replied' ? ago(e.hoursAgo - 1) : null,
    replies:
      e.status === 'replied'
        ? [{ id: `rep_${i}`, body: `Hi ${e.name.split(' ')[0]}, thanks for reaching out to Visionary Eyecare!`, channel: 'whatsapp', loggedAt: ago(e.hoursAgo - 1), confirmed: true }]
        : [],
  });

  return [
    base(1, { name: 'Farah Hani', phone: '012-345 6789', interest: 'Eye examination', status: 'new', hoursAgo: 1, message: 'Hi, can I walk in for an eye test this Saturday afternoon? How long does it take?' }),
    base(2, { name: 'Lee Wei Jie', phone: '+60 16-222 3344', interest: 'Buy 3 Free 1 lens promotion', status: 'new', hoursAgo: 5, message: 'Is the Bionics promo still available? Looking for grey colour lenses, power -3.00.' }),
    base(3, { name: 'Suresh Pillai', phone: '0193456789', interest: 'New spectacles', status: 'new', hoursAgo: 26, message: 'Do you carry Ray-Ban frames for kids?' }),
    base(4, { name: 'Nurul Izzah', phone: '011-2345 6789', interest: 'Contact lenses', status: 'awaiting_reply', hoursAgo: 30, message: 'First time wearing contacts. Can you teach me how to wear them?' }),
    base(5, { name: 'Michelle Ong', phone: '017-888 1212', interest: 'Something else', status: 'awaiting_reply', hoursAgo: 52, message: 'My frame screw is loose, can you fix it while I wait?' }),
    base(6, { name: 'Azlan Shah', phone: '013-777 4545', interest: 'Eye examination', status: 'replied', hoursAgo: 75, message: 'What are your Sunday hours?' }),
    base(7, { name: 'Grace Chong', phone: '012-909 1010', interest: 'New spectacles', status: 'replied', hoursAgo: 120, message: 'Do you have Masunaga titanium frames in stock?' }),
    base(8, { name: 'Test Entry', phone: '012-000 0000', interest: null, status: 'archived', hoursAgo: 300, message: 'Testing the form.' }),
  ];
}

export function buildSeedStats(): GoogleStats {
  // Real rating + count read from the Google Business Profile (lib/site.ts `googleProfile`), not demo data. There has
  // been no automated sync yet, so the sync status stays 'never' (the admin must not show "Connected").
  return { rating: googleProfile.rating, totalReviews: googleProfile.reviewCount, totalLabel: '2,500+', lastSyncAt: null, lastSyncStatus: 'never' };
}
