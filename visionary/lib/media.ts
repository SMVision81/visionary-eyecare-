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
  brandArmaniExchange: brand('armani-exchange'), // PLACEHOLDER (drawn frame outline) until a real ARMANI EXCHANGE photo is supplied
  brandTommyHilfiger: brand('tommy-hilfiger', 'TOMMY HILFIGER eyewear campaign'),
  brandOakley: brand('oakley', 'OAKLEY eyewear campaign'),
  brandFila: brand('fila', 'FILA eyewear campaign'),
  brandAgnesB: brand('agnes-b', 'AGNÈS B. eyewear campaign'),
  brandNewBalance: brand('new-balance', 'NEW BALANCE eyewear campaign'),
  brandPPlusUs: brand('p-plus-us', 'P+US eyewear campaign'),
  brandGuyLaroche: brand('guy-laroche', 'GUY LAROCHE eyewear campaign'),
  brandCarpeDiem: brand('carpe-diem-v2', 'CARPE DIEM eyewear campaign'),
  brandHumars: brand('humars', 'HUMARS eyewear campaign'), // PLACEHOLDER (stock frame photo) until the real HUMARS image is supplied
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
  // About hero: real photo of the outlet's gold logo wall (client-supplied). Small source (564×604): replace with the
  // full-size original when available. The AI shop video (media/videos/about-shop.*) is kept but unused.
  aboutInterior: { type: 'image', src: '/media/images/about-interior.jpg', alt: 'Inside Visionary Eyecare: frame shelves, glass counters and the navy logo wall', width: 567, height: 564 },
  heroAbout: { type: 'image', src: '/media/images/about-logo-wall.jpg', alt: 'The navy logo wall inside Visionary Eyecare at OUG Parklane, with the gold "We care your eyes" logo above a sofa', width: 564, height: 604 },
  // Services menu photos, one per service (decorative). STOCK PLACEHOLDERS until matching Gemini/real photos arrive;
  // contact lenses, fittings and kids are not on-subject yet.
  svcEyeExam: photo('eye-chart.jpg', ''),
  svcSpectacles: photo('frame-classic.jpg', ''),
  svcFrames: photo('frames-rack.jpg', ''),
  svcContacts: photo('frames-collection.jpg', ''),
  svcEdging: img('/media/images/svc-lens-edging.jpg'), // PLACEHOLDER (drawn lens outline) until a photo of the lens edger arrives
  svcFittings: photo('hero-boutique.jpg', ''),
  svcKids: photo('frames-wall.jpg', ''),
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
  aboutEntrance: { type: 'image', src: '/media/images/about-entrance.jpg', alt: 'The glass entrance of Visionary Eyecare, with FILA and AKONI frame displays either side of the door', width: 562, height: 470 },
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
  //   poster: '/images/photos/hero-boutique.jpg',
  //   alt: 'Inside the Visionary Eyecare boutique at OUG Parklane',
  // },
} satisfies Record<string, MediaItem>;

export type MediaKey = keyof typeof media;
