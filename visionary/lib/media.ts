// MEDIA REGISTRY — the single place to add or swap pictures and videos.
// Components reference media by key (e.g. <Media id="heroHome" />), so changing a photo or
// turning a hero into a video means editing ONE entry here.
//
// Files: put new images in /public/media/images and videos in /public/media/videos.
// Videos: provide an MP4 (H.264), keep hero loops short (≤ 15s) and small (≤ 4 MB), always add a poster.

export type ImageMedia = {
  type: 'image';
  src: string;
  /** Describe the picture. Use '' only for purely decorative images. */
  alt: string;
  width?: number;
  height?: number;
};

export type VideoMedia = {
  type: 'video';
  src: string;
  /** Optional extra source, e.g. a .webm version. */
  srcWebm?: string;
  /** Still image shown before playback and when reduced motion is preferred. Required. */
  poster: string;
  /** Text alternative describing the video content. */
  alt: string;
  /** Optional WebVTT captions file (needed if the video has meaningful speech). */
  captions?: string;
  /** Play through once and rest on the last frame instead of looping. */
  once?: boolean;
  width?: number;
  height?: number;
};

/** Art direction: a different crop/photo for narrow screens, served with <picture> so each device downloads one image. */
export type ArtDirectedMedia = {
  type: 'art';
  /** Describe the picture. Use '' only for purely decorative images. */
  alt: string;
  wide: { src: string; width: number; height: number };
  tall: { src: string; width: number; height: number };
  /** Media query that selects the tall image. */
  tallWhen: string;
};

export type MediaItem = ImageMedia | VideoMedia | ArtDirectedMedia;

const photo = (file: string, alt: string): ImageMedia => ({ type: 'image', src: `/images/photos/${file}`, alt });

const brand = (file: string, alt = ''): ImageMedia => ({ type: 'image', src: `/media/images/brands/${file}.jpg`, alt });

const img = (src: string, alt = ''): ImageMedia => ({ type: 'image', src, alt });

const promoImg = (file: string, alt: string): ImageMedia => ({ type: 'image', src: `/media/images/promo/${file}.jpg`, alt });

export const media = {
  // Promotion photos: in-store lens displays at Visionary Eyecare.
  promoBionics: promoImg('bionics', 'Bionics Color Touch lens display at Visionary Eyecare'),
  promoManxion: promoImg('manxion', 'Manxion contact lens shade display at Visionary Eyecare'),
  promoFreshlady: promoImg('freshlady', 'FreshLady daily disposable lens display at Visionary Eyecare'),
  // Collection brand imagery (alt is empty: the brand name is rendered beside each picture)
  brandAkoni: brand('akoni'),
  brandProjektProdukt: brand('projekt-produkt'),
  brandMovitra: brand('movitra'),
  brandRayBan: brand('ray-ban', 'RAY-BAN eyewear campaign'),
  // Exclusive frames (product shots supplied by the shop, 22 Oct 2026), shown three per brand on the Services page.
  frameAkoni1: img('/media/images/frames/akoni-1.jpg', 'Gold and navy navigator frame with grey lenses and side shields'),
  frameAkoni2: img('/media/images/frames/akoni-2.jpg', 'Round rose-gold frame with green lenses and side shields'),
  frameAkoni3: img('/media/images/frames/akoni-3.jpg', 'Gunmetal navigator frame with brown gradient lenses'),
  frameProjekt1: img('/media/images/frames/projekt-produkt-1.jpg', 'Clear champagne square frame with rose-gold temples'),
  frameProjekt2: img('/media/images/frames/projekt-produkt-2.jpg', 'Black and rose-gold browline frame'),
  frameProjekt3: img('/media/images/frames/projekt-produkt-3.jpg', 'Gold navigator sunglasses with a brown brow bar and grey-to-amber gradient lenses'),
  frameMovitra1: img('/media/images/frames/movitra-1.jpg', 'Rose-gold round frame'),
  frameMovitra2: img('/media/images/frames/movitra-2.jpg', 'Bronze geometric sunglasses with brown gradient lenses'),
  frameMovitra3: img('/media/images/frames/movitra-3.jpg', 'Gunmetal pilot sunglasses with orange-to-yellow gradient lenses'),
  brandArmaniExchange: brand('armani-exchange', 'ARMANI EXCHANGE eyewear campaign'),
  brandTommyHilfiger: brand('tommy-hilfiger', 'TOMMY HILFIGER eyewear campaign'),
  brandOakley: brand('oakley', 'OAKLEY eyewear campaign'),
  brandFila: brand('fila', 'FILA eyewear campaign'),
  brandAgnesB: brand('agnes-b', 'AGNÈS B. eyewear campaign'),
  brandNewBalance: brand('new-balance', 'NEW BALANCE eyewear campaign'),
  brandPPlusUs: brand('p-plus-us', 'P+US eyewear campaign'),
  brandGuyLaroche: brand('guy-laroche', 'GUY LAROCHE eyewear campaign'),
  brandCarpeDiem: brand('carpe-diem-v3', 'CARPE DIEM eyewear campaign'), // shop-supplied 22 Oct 2026; shows the RM599 tag (client OK'd)
  brandHumars: brand('humars-v2', 'HUMARS eyewear campaign'), // shop-supplied 22 Oct 2026; shows the RM598 tag (client OK'd)
  brandMasarata: brand('masarata', 'MASARATA eyewear campaign'),
  brandMasunaga: brand('masunaga', 'MASUNAGA eyewear campaign'),

  // Hero / page backgrounds (decorative: alt is empty because text sits on top)
  // Home hero: AI-generated (Gemini) stand-in of a boutique, not the real outlet. Decorative (text sits on top).
  // Replace with real outlet photography when available; keep the glasses where the hero lens lands (--fx/--fy in site.css).
  heroHome: {
    type: 'art',
    alt: '',
    wide: { src: '/media/images/hero-home-wide.jpg', width: 2752, height: 1536 },
    tall: { src: '/media/images/hero-home-tall.jpg', width: 1536, height: 2752 },
    tallWhen: '(max-width: 760px), (max-width: 1100px) and (orientation: portrait)',
  },
  // About hero: the outlet's own interior photos, straightened and enhanced by the client (22 Oct 2026). The shop is the
  // blurred background, the frame wall fills the left lens and a crop of the gold logo wall the right lens. The number
  // plate seen through the front window is blurred. Originals: collection-assests/Store-Pictures_Videos/enhanced/.
  aboutInterior: { type: 'image', src: '/media/images/about-shop.jpg', alt: 'Inside Visionary Eyecare: frame shelves, glass counters and the navy logo wall', width: 1086, height: 1448 },
  aboutFrames: { type: 'image', src: '/media/images/about-frames.jpg', alt: 'The frame wall at Visionary Eyecare: black steel shelves of spectacles and sunglasses above a glass display counter', width: 1086, height: 1448 },
  heroAbout: { type: 'image', src: '/media/images/about-logo-wall-v2.jpg', alt: 'The navy logo wall inside Visionary Eyecare at OUG Parklane, with the gold "We care your eyes" logo above a sofa', width: 730, height: 660 },
  // Services menu photos, one per service (decorative). AI-GENERATED STAND-INS (Gemini, 22 Oct 2026; hands only, no
  // logos), NOT the real outlet: replace with the shop's own photos when available. Originals: archive-unused/ai-originals.
  svcEyeExam: img('/media/images/services/eye-exam.jpg'),
  svcSpectacles: img('/media/images/services/spectacles.jpg'),
  svcFrames: img('/media/images/services/frames.jpg'),
  svcContacts: img('/media/images/services/contact-lenses.jpg'),
  svcEdging: img('/media/images/services/lens-edging.jpg'),
  svcFittings: img('/media/images/services/fittings.jpg'),
  svcKids: img('/media/images/services/kids.jpg'),
  // Services hero moodboard: the brand folders' SECOND campaign shots (collection-assests/<brand>/*_02 etc.), so none
  // repeat the Collection carousel. Decorative (alt ''): the wall is aria-hidden.
  wallAkoni: { type: 'image', src: '/media/images/wall/akoni.jpg', alt: '', width: 720, height: 405 },
  wallFila: { type: 'image', src: '/media/images/wall/fila.jpg', alt: '', width: 720, height: 576 },
  wallGuyLaroche: { type: 'image', src: '/media/images/wall/guy-laroche.jpg', alt: '', width: 720, height: 900 },
  wallMasarata: { type: 'image', src: '/media/images/wall/masarata.jpg', alt: '', width: 675, height: 900 },
  wallMasunaga: { type: 'image', src: '/media/images/wall/masunaga.jpg', alt: '', width: 720, height: 480 },
  wallNewBalance: { type: 'image', src: '/media/images/wall/new-balance.jpg', alt: '', width: 554, height: 554 },
  wallOakley: { type: 'image', src: '/media/images/wall/oakley.jpg', alt: '', width: 720, height: 900 },
  wallPPlusUs: { type: 'image', src: '/media/images/wall/p-plus-us.jpg', alt: '', width: 399, height: 501 },
  wallProjektProdukt: { type: 'image', src: '/media/images/wall/projekt-produkt.jpg', alt: '', width: 720, height: 817 },
  wallRayBan: { type: 'image', src: '/media/images/wall/ray-ban.jpg', alt: '', width: 507, height: 900 },
  wallTommyHilfiger: { type: 'image', src: '/media/images/wall/tommy-hilfiger.jpg', alt: '', width: 720, height: 893 },
  wallCarpeDiem: { type: 'image', src: '/media/images/wall/carpe-diem.jpg', alt: '', width: 685, height: 336 },

  // Content images (each used on one page only)
  // Home Explore triptych (decorative; text sits on top). About/Services are AI-generated (Gemini) scenes, not the
  // outlet; Contact is an AI-enhanced dusk version of the real Visionary Eyecare storefront at OUG Parklane.
  exploreAbout: img('/media/images/explore-about.jpg'),
  exploreServices: img('/media/images/explore-services.jpg'),
  exploreContact: img('/media/images/explore-contact.jpg'),
  examPhoropter: photo('eye-exam.jpg', 'A patient looking through a phoropter, the instrument used to compare lenses during an eye examination'),
  // About story: real client photos (cropped from public/media/images/drive-download-…/Entrance Pic 1–2). The storefront
  // crop deliberately stops above the shop's promo banner (its offer is unconfirmed). Small sources (~565px wide).
  aboutStorefront: { type: 'image', src: '/media/images/about-storefront.jpg', alt: 'The Visionary Eyecare shop sign, with its red spectacles logo, above the shop at OUG Parklane', width: 565, height: 152 },
  // Shop front, straightened and enhanced by the client (22 Oct 2026); unit D3-0-27 above the door.
  aboutEntrance: { type: 'image', src: '/media/images/about-entrance-v2.jpg', alt: 'The glass entrance of Visionary Eyecare at unit D3-0-27, with FILA and AKONI frame displays either side of the door', width: 1254, height: 1049 },
  // About "Why people choose us", 3 labels tile: AI-generated (Gemini) still life of three UNBRANDED frames (fake arm
  // lettering painted out). Deliberately not the real brands' products. Original: "public/media/images/3 Label.jpeg".
  // Decorative: the facts are written on top.
  aboutLabels: { type: 'image', src: '/media/images/about-labels.jpg', alt: '', width: 1200, height: 1490 },
  // Real photo: a close crop of the shop's affordable-frames table (the full shot is `collectionAffordable` on Services).
  whyRange: { type: 'image', src: '/media/images/about-affordable.jpg', alt: '', width: 1122, height: 420 },
  // About "Your visit": AI-generated (Gemini) stand-ins, NOT the real outlet (hands only, no faces, no logos). Replace with
  // the shop's own photos when supplied. Originals: "public/media/images/<step name>.jpeg". Decorative: text sits below.
  visitListen: { type: 'image', src: '/media/images/visit-listen.jpg', alt: '', width: 1100, height: 1324 },
  visitTest: { type: 'image', src: '/media/images/visit-test.jpg', alt: '', width: 1100, height: 1324 },
  visitChoose: { type: 'image', src: '/media/images/visit-choose.jpg', alt: '', width: 1100, height: 1225 },
  visitCare: { type: 'image', src: '/media/images/visit-care.jpg', alt: '', width: 1100, height: 1324 },
  storeInterior: { type: 'image', src: '/media/images/store-interior.jpg', alt: 'Inside the Visionary Eyecare store at OUG Parklane, with frame displays and the gold logo on the blue wall' },
  storeEyeExam: photo('eyetest-room.jpg', 'The eye test room at Visionary Eyecare, with the examination chair and trial lens set'),
  collectionAffordable: { type: 'image', src: '/media/images/affordable-frames.jpg', alt: 'A tiered glass display of affordable frames in many colours at Visionary Eyecare' },

  // Example video entry (uncomment and add the files to use it as the home hero):
  // heroHome: {
  //   type: 'video',
  //   src: '/media/videos/hero-home.mp4',
  //   poster: '/media/images/your-poster.jpg',
  //   alt: 'Inside the Visionary Eyecare boutique at OUG Parklane',
  // },
} satisfies Record<string, MediaItem>;

export type MediaKey = keyof typeof media;
