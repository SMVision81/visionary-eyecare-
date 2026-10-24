import Link from 'next/link';
import Media from '@/components/media/Media';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { media, type MediaItem, type MediaKey } from '@/lib/media';
import { reviewSourceLabels, type PublicReview } from '@/lib/types';
import { isDemoData, reviews as reviewsRepo, stats as statsRepo } from '@/lib/data';
import BrandLookbook from '@/components/site/BrandLookbook';
import FaqChat from '@/components/site/FaqAccordion';
import ReviewDeck from '@/components/site/ReviewDeck';
import { OpenStatus } from '@/components/site/OpenBadge';
import ReviewFocus from '@/components/site/ReviewFocus';
import SwipeList from '@/components/site/SwipeList';
import ExplorePanels, { type ExploreRow } from '@/components/site/ExplorePanels';
import {
  address,
  bookingLink,
  brandFit,
  brandLink,
  brandMedia,
  brands,
  contactLensBrands,
  enquiryLink,
  exclusiveBrands,
  exclusiveFrames,
  type Faq,
  type FrameKind,
  hours,
  mapsEmbed,
  mapsLink,
  phone,
  promo,
  promotions,
  reviewsLink,
  services,
  stats,
  whatsappLink,
} from '@/lib/site';

export function Label({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return <span className={`label${light ? ' label-light' : ''}`}>{children}</span>;
}

// Home hero: "Into focus". The boutique starts out of focus; a brass-rimmed lens glides in, sharpens what it
// passes over, then widens until the whole scene is clear. Pure CSS (see "Home hero" in site.css): no JS, and
// reduced-motion visitors get the sharp photo straight away. Banner + navbar + hero fill exactly one screen.
export async function Hero({ media = 'heroHome' }: { media?: MediaKey }) {
  const google = await statsRepo.get();
  return (
    <section className="hero">
      <div className="focus-stage" aria-hidden="true">
        <div className="focus-layer focus-blurred">
          <Media id={media} className="focus-img" priority sizes="100vw" />
        </div>
        <div className="focus-layer focus-sharp">
          <Media id={media} className="focus-img" priority sizes="100vw" />
        </div>
        <div className="focus-ring" />
      </div>
      <div className="hero-content">
        <div className="hero-copy">
          <Label light>
            {/* One wrapper span: .label is a flex row, so a bare inner span would get the flex gap before the comma. */}
            <span>
              Independent Eyecare · OUG Parklane<span className="hero-label-city">, Kuala Lumpur</span>
            </span>
          </Label>
          <h1>
            Good vision changes <em>the whole day.</em>
          </h1>
          <p>
            Eye examinations by our <strong>in-house optometrist</strong>, frames fitted by our <strong>optician</strong>, and{' '}
            <strong>20 years</strong> of experience behind every recommendation.
          </p>
          <div className="hero-actions">
            <a className="btn btn-crimson" href={bookingLink} target="_blank" rel="noreferrer">
              Book an Eye Test<span className="sr-only"> (opens WhatsApp)</span>
            </a>
            <Link className="hero-link" href="/services#collection">
              Explore the collection <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="hero-foot">
          <dl className="hero-proof">
            <div>
              <dt>{google.totalReviews?.toLocaleString('en-MY') ?? google.totalLabel}</dt>
              <dd>
                <a href="#reviews">Reviews on Google</a>
              </dd>
            </div>
            {stats.slice(0, 2).map((s) => (
              <div key={s.label}>
                <dt>{s.value}</dt>
                <dd>
                  {s.short ? (
                    <>
                      <span className="proof-long">{s.label}</span>
                      <span className="proof-short">{s.short}</span>
                    </>
                  ) : (
                    s.label
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}


// About hero: "Through our lenses". The shop fills the background, blurred; a pair of brass spectacle rims (the two rings of the Visionary logo) draws itself
// in; the real shop interior and logo wall come into focus inside the lenses. Banner + navbar + hero fill one screen.
export function AboutHero() {
  return (
    <section className="ah">
      {/* The shop, out of focus: the lenses show it sharp. */}
      <div className="ah-bg" aria-hidden="true">
        <Media id="aboutInterior" className="ah-bg-img" priority sizes="40vw" />
      </div>
      <div className="ah-specs" aria-hidden="true">
        <div className="ah-lens ah-lens-l">
          <Media id="aboutFrames" className="ah-img" sizes="(max-width: 760px) 45vw, 380px" />
        </div>
        <div className="ah-lens ah-lens-r">
          <Media id="heroAbout" className="ah-img" sizes="(max-width: 760px) 45vw, 380px" />
        </div>
        <svg className="ah-frame" viewBox="0 0 1000 400" fill="none">
          <circle className="ah-rim" pathLength="1" cx="250" cy="200" r="190" />
          <circle className="ah-rim" pathLength="1" cx="750" cy="200" r="190" />
          <circle className="ah-hair" cx="250" cy="200" r="176" />
          <circle className="ah-hair" cx="750" cy="200" r="176" />
          <path className="ah-rim" pathLength="1" d="M440 178 Q500 128 560 178" />
          <path className="ah-rim" pathLength="1" d="M62 150 Q34 128 4 126" />
          <path className="ah-rim" pathLength="1" d="M938 150 Q966 128 996 126" />
        </svg>
      </div>
      <div className="ah-copy">
        <Label light>About Visionary Eyecare</Label>
        <h1>
          A sharper view of <em>everyday life.</em>
        </h1>
        <p>Clinical care and a good eye for style, together in one welcoming place at OUG Parklane.</p>
        <ul className="ah-facts" role="list">
          <li>20 years of optical experience</li>
          <li>In-house optometrist &amp; optician</li>
          <li>OUG Parklane, Kuala Lumpur</li>
        </ul>
      </div>
    </section>
  );
}

// Services hero: an eyewear moodboard. Five columns of real brand campaign photos (the brand folders' second shots,
// so nothing repeats the carousel below) drift apart as you scroll; the headline sits on a paper panel in the middle.
// Fills one screen with the banner + navbar, like the Home and About heroes.
const wallCols: MediaKey[][] = [
  // Outer columns stay visible: the moodiest campaign shots. Plain cut-outs sit in the centre, mostly behind the panel.
  ['wallAkoni', 'wallCarpeDiem', 'wallRayBan'],
  ['wallTommyHilfiger', 'wallNewBalance', 'wallPPlusUs'],
  ['wallMasunaga', 'wallMasunaga'], // centre column: only its top and bottom edges show around the panel
  ['wallOakley', 'wallGuyLaroche', 'wallProjektProdukt'],
  ['wallMasarata', 'wallFila'],
];

export function ServicesHero() {
  return (
    <section className="sw">
      <div className="sw-wall" aria-hidden="true">
        {wallCols.map((col, i) => (
          <div className={`sw-col sw-col-${i + 1}`} key={i}>
            <div className="sw-col-in">
              {/* Each column repeats so it always outlasts the screen, even while drifting (off-screen copies stay lazy). */}
              {[...col, ...col, ...col].map((id, k) => {
                const m: MediaItem = media[id];
                const ratio = m.type === 'image' && m.width && m.height ? `${m.width} / ${m.height}` : '1';
                return (
                  <div className="sw-tile" key={k} style={{ aspectRatio: ratio }}>
                    <Media id={id} sizes="(max-width: 760px) 34vw, 20vw" priority={k === 0 && i < 2} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="sw-panel">
        <Label>Services &amp; Collections</Label>
        <h1>
          Clinical care, <em>a boutique eye.</em>
        </h1>
        <p>
          Eye tests, lenses and aftercare from our in&#8209;house team, and {brands.length} frame labels to choose from,{' '}
          {exclusiveBrands.length} of them exclusive in the area.
        </p>
        <div className="sw-actions">
          <a className="btn btn-navy btn-sm" href="#services">
            Our services
          </a>
          <a className="btn btn-crimson btn-sm" href="#collection">
            The collection
          </a>
        </div>
      </div>
    </section>
  );
}

// About: our story and who looks after you (roles only: no staff faces online), beside the real shop front.
export function AboutStory() {
  return (
    <section className="ab-story">
      <div className="ab-story-copy">
        <Label>Our story</Label>
        <h2>
          Twenty years <em>of optical craft.</em>
        </h2>
        <p>
          Visionary Eyecare is an independent optical shop at OUG Parklane. Our in-house optometrist and optician bring 20
          years of experience to every eye test, fitting and recommendation.
        </p>
        <p>
          Your first eye test, a new everyday pair or advice on contact lenses: we want you to leave seeing clearly and
          feeling looked after, never rushed.
        </p>
        <dl className="ab-roles">
          <div>
            <dt>Optometrist</dt>
            <dd>Your eye test, done on-site and explained in plain language.</dd>
          </div>
          <div>
            <dt>Optician</dt>
            <dd>Fitting, adjustments and aftercare for your glasses.</dd>
          </div>
        </dl>
        <ul className="ab-motto" role="list">
          <li>Take the time.</li>
          <li>Ask the right questions.</li>
          <li>Find what works.</li>
        </ul>
      </div>
      <figure className="ab-shop">
        <div className="ab-door">
          <Media id="aboutEntrance" sizes="(max-width: 980px) 92vw, 520px" />
        </div>
        <div className="ab-sign">
          <Media id="aboutStorefront" sizes="(max-width: 980px) 72vw, 380px" />
        </div>
        <figcaption>Our shop front, OUG Parklane</figcaption>
      </figure>
    </section>
  );
}

const listJoin = (items: string[]) => `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

// About: why people choose us. Four confirmed facts, led by photography rather than icons.
export function AboutWhy() {
  return (
    <section className="ab-why">
      <div className="ab-why-head">
        <Label>Why people choose us</Label>
        <h2>
          Expert eyes, <em>exclusive frames.</em>
        </h2>
      </div>
      <ul className="ab-why-grid" role="list">
        <li className="ab-tile ab-tile-photo ab-tile-lead">
          <Media id="aboutLabels" sizes="(max-width: 760px) 100vw, 46vw" />
          <div>
            <small>Exclusive in the area</small>
            <strong>{exclusiveBrands.length} labels</strong>
            <p>{listJoin(exclusiveBrands)}, available only with us in the area.</p>
          </div>
        </li>
        <li className="ab-tile ab-tile-navy">
          <small>In-house</small>
          <strong>Optometrist &amp; optician</strong>
          <p>Your eye test and your fitting, both done here.</p>
        </li>
        <li className="ab-tile ab-tile-paper">
          <small>Experience</small>
          <strong>{stats[0].value} years</strong>
          <p>Of optical experience in the team.</p>
        </li>
        <li className="ab-tile ab-tile-photo ab-tile-wide">
          <Media id="whyRange" sizes="(max-width: 760px) 100vw, 46vw" />
          <div>
            <small>Every budget</small>
            <strong>Some under RM100</strong>
            <p>Premium labels and affordable frames, side by side.</p>
          </div>
        </li>
      </ul>
    </section>
  );
}

const visitSteps: { no: string; media: MediaKey; title: string; text: string; who: string }[] = [
  {
    no: '01',
    media: 'visitListen',
    title: 'We listen first.',
    text: 'Work, screens, driving, style: tell us about your day. It shapes what we recommend.',
    who: 'Optometrist',
  },
  {
    no: '02',
    media: 'visitTest',
    title: 'A thorough eye test.',
    text: 'Done here, on-site, with every result explained in plain language.',
    who: 'Optometrist',
  },
  {
    no: '03',
    media: 'visitChoose',
    title: 'Honest options.',
    text: `${brands.length} labels and frames for every budget. Choose at your own pace, with no pressure.`,
    who: 'Optician',
  },
  {
    no: '04',
    media: 'visitCare',
    title: 'Care that carries on.',
    text: 'Fit checks, cleans and adjustments, long after your first visit.',
    who: 'Optician',
  },
];

// About: the visit in four photo panels (a swipeable row on phones).
export function AboutVisit() {
  return (
    <section className="ab-visit">
      <div className="ab-visit-head">
        <div>
          <Label light>Your visit</Label>
          <h2>
            Four steps, <em>no rush.</em>
          </h2>
        </div>
        <a className="btn btn-crimson btn-sm" href={bookingLink} target="_blank" rel="noreferrer">
          Book an Eye Test<span className="sr-only"> (opens WhatsApp)</span>
        </a>
      </div>
      {/* Region + tabIndex: on touch phones the row becomes a swipeable strip that keyboard users can scroll too. */}
      <div className="ab-visit-scroll" role="region" aria-label="Your visit, step by step" tabIndex={0}>
      <ol className="ab-visit-track" role="list">
        {visitSteps.map((s) => (
          <li className="ab-visit-step" key={s.no}>
            <div className="ab-visit-img">
              <Media id={s.media} sizes="(max-width: 760px) 78vw, (max-width: 980px) 45vw, 280px" />
              <span className="ab-visit-no" aria-hidden="true">
                {s.no}
              </span>
            </div>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            <span className="ab-who">{s.who}</span>
          </li>
        ))}
      </ol>
      </div>
    </section>
  );
}

// A thin, slowly looping line of brand names. `marked` names get a brass ✦ (explained in the key). Shared by the Home
// frame-brand strip (ivory) and the Services contact-lens strip (midnight, scrolling the other way).
function NameLoop({ label, items, marked, markLabel, markNote, count, className }: { label: string; items: string[]; marked: string[]; markLabel: string; markNote: string; count: string; className?: string }) {
  const names = (copy: boolean) =>
    items.map((b) => (
      <li key={`${copy ? 'b' : 'a'}${b}`} className={marked.includes(b) ? 'is-marked' : undefined}>
        {b}
        {marked.includes(b) && <span className="sr-only"> ({markNote})</span>}
      </li>
    ));
  return (
    // tabIndex: tapping or tabbing to the strip pauses the loop (no visible pause button, by client choice).
    <section className={['brand-strip', className].filter(Boolean).join(' ')} aria-label={label} tabIndex={0}>
      <p className="brand-strip-key">
        <span>{count}</span>
        {marked.length > 0 && (
          <span>
            <i aria-hidden="true">✦</i> {markLabel}
          </span>
        )}
      </p>
      <div className="brand-marquee">
        <ul className="brand-track" role="list">
          {names(false)}
        </ul>
        <ul className="brand-track" aria-hidden="true">
          {names(true)}
        </ul>
      </div>
    </section>
  );
}

// Home: every frame and sunglass brand we carry; area exclusives marked.
export function BrandStrip() {
  return (
    <NameLoop
      label="Frame and sunglass brands we carry"
      items={brands}
      marked={exclusiveBrands}
      markLabel="Exclusive in the area"
      markNote="exclusive in the area"
      count={`${brands.length} labels`}
    />
  );
}

// Services: the contact lens brands we carry, just before the lens offer. No promo marks (client request, 22 Oct 2026).
export function LensStrip() {
  return <NameLoop className="lens-strip" label="Contact lens brands we carry" items={contactLensBrands} marked={[]} markLabel="" markNote="" count="Contact lenses" />;
}

// Home: the four main services set as an optometrist's eye chart. Lines shrink like a Snellen chart, carry the
// acuity notation in the margin, and come into focus as they scroll in (CSS only; see "Home: eye chart" in site.css).
const chartNotation = ['6/60', '6/36', '6/18', '6/9'];

export function WhatWeDo() {
  const main = services.slice(0, 4);
  return (
    <section className="chart section" aria-labelledby="chart-title">
      <div className="chart-head">
        <Label>What we do</Label>
        <h2 id="chart-title">
          Read the chart. <em>It is all here.</em>
        </h2>
      </div>
      <ul className="chart-lines" role="list">
        {main.map((s, i) => (
          <li key={s.no} className="chart-line">
            <span className="chart-acuity" aria-hidden="true">
              {chartNotation[i]}
            </span>
            <h3>{s.title}</h3>
            <span className="chart-note">
              {s.tag}
              {s.badge && <span className="chart-badge">{s.badge}</span>}
            </span>
          </li>
        ))}
      </ul>
      <div className="chart-fine">
        <p>
          <span className="chart-acuity" aria-hidden="true">
            6/6
          </span>
          <span>
            Premium labels <em>and</em> affordable frames, some under RM100.
          </span>
        </p>
        <Link className="btn-text" href="/services">
          See all services <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

// Home: problem → answer. Left, the everyday symptoms; right, the eye-test photo with the Visionary approach
// overlapping its corner. Calm and editorial on purpose: the hero owns the "focus" effect.
const symptoms = ['Eye strain', 'Headaches', 'Blurred distance', 'Squinting'];

export function Contrast() {
  return (
    <section className="contrast section">
      <div className="contrast-grid">
        <div className="contrast-problem">
          <Label>Sound familiar?</Label>
          <h2>
            Screens, long drives, small print. <em>Your eyes keep adapting.</em>
          </h2>
          <p>Off-the-shelf fixes can mask the problem. A proper examination tells you what is really going on.</p>
          <ul className="symptoms" role="list">
            {symptoms.map((s, i) => (
              <li key={s}>
                <span aria-hidden="true">0{i + 1}</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="contrast-answer">
          <div className="contrast-photo">
            <Media id="examPhoropter" sizes="(max-width: 980px) 100vw, 50vw" />
          </div>
          <div className="contrast-panel">
            <Label light>The Visionary approach</Label>
            <h3>
              “We look for the cause, <em>not just a stronger lens.</em>”
            </h3>
            <p>
              Every visit starts with a <strong>thorough eye examination</strong> by our in-house optometrist. Our optician then
              fits a solution that suits you, not a template.
            </p>
            <div className="btn-row">
              <a className="btn btn-crimson" href={bookingLink} target="_blank" rel="noreferrer">
                Book an Eye Test<span className="sr-only"> (opens WhatsApp)</span>
              </a>
              <Link className="link-light" href="/services">
                Browse services <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const numberWords = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];
const inWords = (n: number) => numberWords[n] ?? String(n);

// Placeholder for a frame photo that hasn't arrived yet: a drawn outline (three shapes, so a brand's tiles differ).
// Sunglasses get filled navy lenses. Decorative only; the tile's label says what it is.
const frameShapes = [
  // round
  <>
    <circle cx="33" cy="26" r="17" />
    <circle cx="87" cy="26" r="17" />
    <path className="fs-line" d="M50 24q10-7 20 0M16 22 6 18m98 4 10-4" />
  </>,
  // square
  <>
    <rect x="12" y="11" width="40" height="30" rx="6" />
    <rect x="68" y="11" width="40" height="30" rx="6" />
    <path className="fs-line" d="M52 20q8-5 16 0M12 18 4 15m104 3 8-3" />
  </>,
  // aviator
  <>
    <path d="M13 13h40c2 0 3 1 3 3 0 15-8 26-21 26-12 0-23-9-23-23 0-4 0-6 1-6z" />
    <path d="M107 13H67c-2 0-3 1-3 3 0 15 8 26 21 26 12 0 23-9 23-23 0-4 0-6-1-6z" />
    <path className="fs-line" d="M56 17q4-4 8 0M53 12h14M13 15 5 13m102 2 8-2" />
  </>,
];

const frameLabel: Record<FrameKind, string> = { optical: 'Optical', sun: 'Sunglasses' };

function FrameSketch({ kind, shape }: { kind: FrameKind; shape: number }) {
  return (
    <svg className={`frame-sketch is-${kind}`} viewBox="0 0 120 52" aria-hidden="true">
      {frameShapes[shape % frameShapes.length]}
    </svg>
  );
}

// Services: the three area exclusives (AKONI, PROJEKT PRODUKT, MOVITRA), each with its campaign photo and three
// frames (optical and sunglasses). The whole card is one WhatsApp link (stretched from the "Ask about" text).
// Section 1 of the collection.
export function CollectionExclusive({ id }: { id?: string }) {
  return (
    <section className="collection" id={id}>
      <div className="center-head">
        <Label>The Collection</Label>
        <h2>
          {inWords(brands.length)} labels. <em>{inWords(exclusiveBrands.length)} you won’t find nearby.</em>
        </h2>
      </div>
      <Stagger as="ul" className="exclusive-grid">
        {exclusiveBrands.map((b, bi) => (
          <StaggerItem as="li" key={b}>
            <article className="exclusive-card" aria-labelledby={`ex-${bi}`}>
              <div className="exclusive-photo">
                <Media id={brandMedia[b]} sizes="(max-width: 980px) 80vw, 33vw" />
                <span className="badge">Exclusive</span>
                <h3 id={`ex-${bi}`}>{b}</h3>
              </div>
              <ul className="exclusive-frames" aria-label={`${b} frames`}>
                {(exclusiveFrames[b] ?? []).map((f, i) => (
                  <li key={i} className="frame-tile">
                    <span className="frame-pic">
                      {f.media ? <Media id={f.media} sizes="(max-width: 980px) 26vw, 120px" /> : <FrameSketch kind={f.kind} shape={i + bi} />}
                    </span>
                    <span className="frame-kind">{frameLabel[f.kind]}</span>
                  </li>
                ))}
              </ul>
              <div className="exclusive-body">
                <small>Only at Visionary Eyecare in the area</small>
                <a className="exclusive-cta" href={brandLink(b)} target="_blank" rel="noreferrer">
                  Ask about {b} <span aria-hidden="true">→</span>
                  <span className="sr-only"> (opens WhatsApp)</span>
                </a>
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

// Services: the other labels as a lookbook (BrandLookbook). Section 2 of the collection.
export function CollectionBrands() {
  const others = brands.filter((b) => !exclusiveBrands.includes(b));
  return (
    <section className="labels" aria-labelledby="labels-title">
      <div className="labels-head">
        <Label light>Our labels</Label>
        <h2 id="labels-title">
          {inWords(others.length)} more labels, <em>one look at a time.</em>
        </h2>
      </div>
      <BrandLookbook
        items={others.map((b) => ({ name: b, href: brandLink(b), position: brandFit[b]?.position }))}
        photos={others.map((b) => (
          <Media key={b} id={brandMedia[b]} sizes="(max-width: 860px) 100vw, 560px" />
        ))}
        thumbs={others.map((b) => (
          <Media key={b} id={brandMedia[b]} sizes="96px" />
        ))}
      />
    </section>
  );
}

// Services: affordable frames, some under RM100 (confirmed), beside the real photo of the affordable-frames table.
// Section 3 of the collection.
export function CollectionBudget({ id }: { id?: string }) {
  return (
    <section className="budget" id={id}>
      <div className="bg-copy">
        <Label>For every budget</Label>
        <h2>
          Premium labels, <em>everyday prices too.</em>
        </h2>
        <p>
          Not everything here is designer-priced. We carry a wide range of affordable frames, some under RM100, fitted with
          the same care as every other pair.
        </p>
        <a className="btn btn-crimson" href={whatsappLink("Hi Visionary Eyecare, I'd like to ask about your affordable frames.")} target="_blank" rel="noreferrer">
          Ask about affordable frames<span className="sr-only"> (opens WhatsApp)</span>
        </a>
        <p className="bg-note">Tell us your budget and we will show you what fits it.</p>
      </div>
      <div className="bg-visual">
        <div className="bg-photo">
          <Media id="collectionAffordable" sizes="(max-width: 860px) 100vw, 46vw" />
        </div>
      </div>
    </section>
  );
}

export function Promotions({ id }: { id?: string }) {
  if (!promo.active) return null;
  return (
    <section className="lens" id={id} aria-labelledby="lens-title">
      <div className="lens-copy">
          <Label>The Lens Edit · Current offer</Label>
          <h2 id="lens-title">
            Buy 3 boxes, <em>get 1 free.</em>
          </h2>
          <div className="lens-sum" aria-hidden="true">
            <span>3</span>
            <i>+</i>
            <span className="lens-one">
              1<small>free</small>
            </span>
          </div>
          <ol className="lens-steps" role="list">
            <li>
              <b>01</b> Choose your shades
            </li>
            <li>
              <b>02</b> We check fit and power with you
            </li>
            <li>
              <b>03</b> Take home four boxes
            </li>
          </ol>
          <p>On selected Bionics, Manxion and FreshLady lenses. Ask us about eligible shades and powers.</p>
      </div>
      <ul className="lens-tiles" role="list">
        {promotions.map((p) => (
          <li key={p.brand}>
            <a
              className="lens-tile"
              href={whatsappLink(`Hi Visionary Eyecare, I'm interested in the ${p.brand} Buy 3 Free 1 promotion.`)}
              target="_blank"
              rel="noreferrer"
            >
              <span className="lens-photo" aria-hidden="true">
                <Media id={p.media} sizes="(max-width: 860px) 80vw, 22vw" />
              </span>
              <span className="lens-info">
                <span className="lens-stat">
                  <b>{p.stat}</b> {p.statLabel}
                </span>
                <strong>{p.brand}</strong>
                <span className="lens-ask">
                  Ask about {p.brand.split(' ')[0]} <span aria-hidden="true">→</span>
                  <span className="sr-only"> (opens WhatsApp)</span>
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Reviews come from the data layer: only reviews the owner APPROVED in the admin panel are shown.
function GoogleSummary({ google }: { google: Awaited<ReturnType<typeof statsRepo.get>> }) {
  return (
    <p className="google-summary">
      {google.rating !== null && (
        <>
          <strong className="google-rating">{google.rating.toFixed(1)}</strong>
          <span className="stars" aria-label={`${google.rating.toFixed(1)} out of 5 stars on Google`}>
            ★★★★★
          </span>
        </>
      )}
      <span>{google.totalReviews?.toLocaleString('en-MY') ?? google.totalLabel} reviews on Google</span>
    </p>
  );
}

// Rating + count always come from Google (rating is hidden until the real value is available).
// Home: a fanned deck of review cards (ReviewDeck) beside the heading and a slowly rotating "Reviews on Google" seal.
export async function ReviewWall() {
  const [items, google] = await Promise.all([reviewsRepo.listPublic(25), statsRepo.get()]);
  const count = google.totalReviews?.toLocaleString('en-MY') ?? google.totalLabel;
  return (
    <section className="reviews dk section" id="reviews" aria-labelledby="reviews-title">
      <div className="dk-grid">
        <div className="dk-side">
          <Label>Words of trust</Label>
          <h2 id="reviews-title">
            Guest <em>experiences.</em>
          </h2>
          <div className="dk-proof">
            <div className="dk-seal" aria-hidden="true">
              <svg viewBox="0 0 200 200">
                <defs>
                  <path id="dk-circle" d="M100 100m-80 0a80 80 0 1 1 160 0a80 80 0 1 1-160 0" />
                </defs>
                <text>
                  <textPath href="#dk-circle">REVIEWS ON GOOGLE ✦ REVIEWS ON GOOGLE ✦ </textPath>
                </text>
              </svg>
              <span>{count}</span>
            </div>
            <p className="dk-proof-text">
              {google.rating !== null && (
                <span className="dk-rating">
                  <strong>{google.rating.toFixed(1)}</strong> out of 5 on Google ·{' '}
                </span>
              )}
              <strong>{count}</strong> reviews from real customers on Google.
            </p>
          </div>
          <div className="reviews-links">
            <a className="btn-text" href={reviewsLink} target="_blank" rel="noreferrer">
              Read all on Google <span aria-hidden="true">→</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <Link className="btn-text" href="/review">
              Leave us a review <span aria-hidden="true">→</span>
            </Link>
          </div>
          {isDemoData && <p className="demo-note">Sample reviews shown until Google reviews are connected.</p>}
        </div>
        {items.length > 0 ? <ReviewDeck key={items.map((r) => r.id).join('|')} items={items} /> : <p className="reviews-empty">Read what our customers say on Google.</p>}
      </div>
    </section>
  );
}


// About: guest reviews, one at a time, coming into focus (ReviewFocus). Starts at the 4th live review so the opening
// quote differs from the Services and Contact review quotes. Rating + count always come from Google.
export async function AboutReviews() {
  const [items, google] = await Promise.all([reviewsRepo.listPublic(50), statsRepo.get()]);
  const ordered = items.length > 3 ? [...items.slice(3), ...items.slice(0, 3)] : items;
  return (
    <section className="ab-voices" aria-labelledby="ab-voices-title">
      <div className="ab-voices-side">
        <Label>What guests say</Label>
        <h2 id="ab-voices-title">
          In their <em>own words.</em>
        </h2>
        <GoogleSummary google={google} />
        <div className="ab-voices-links">
          <a className="btn-text" href={reviewsLink} target="_blank" rel="noreferrer">
            Read all on Google <span aria-hidden="true">→</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <Link className="btn-text" href="/review">
            Leave us a review <span aria-hidden="true">→</span>
          </Link>
        </div>
        {isDemoData && <p className="demo-note">Sample reviews shown until Google reviews are connected.</p>}
      </div>
      {ordered.length > 0 ? <ReviewFocus items={ordered} /> : <p className="reviews-empty">Read what our customers say on Google.</p>}
    </section>
  );
}

// Services: a compact navy band of Google reviews: the count in the heading, three short quotes side by side (count and
// rating always come from Google; the rating shows only once it is real). Different from Home (deck) and About (slider).
export async function ServicesReviews() {
  const [items, google] = await Promise.all([reviewsRepo.listPublic(50), statsRepo.get()]);
  const count = google.totalReviews?.toLocaleString('en-MY') ?? google.totalLabel;
  // Reviews 2, 3 and 5: the About slider opens on the 4th, so the first quotes seen on each page differ.
  const picks = items.length ? [1, 2, 4].map((i) => items[i % items.length]).filter((r, i, a) => a.indexOf(r) === i) : [];
  return (
    <section className="sv" aria-labelledby="sv-title">
      <div className="sv-head">
        <div>
          <Label light>What guests say</Label>
          <h2 id="sv-title">
            <em>{count}</em> reviews on Google
          </h2>
          {google.rating !== null && (
            <p className="sv-rating">
              <strong>{google.rating.toFixed(1)}</strong> out of 5 on Google
            </p>
          )}
        </div>
        <div className="sv-links">
          <a className="btn-text" href={reviewsLink} target="_blank" rel="noreferrer">
            Read all on Google <span aria-hidden="true">→</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <Link className="btn-text" href="/review">
            Leave us a review <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      {picks.length > 0 ? (
        // A swipe row on touch phones: focusable there so keyboard users can scroll it.
        <SwipeList className="sv-quotes" label="Customer reviews">
          {picks.map((r) => (
            <li key={r.id}>
              <figure className="sv-quote">
                <div className="sv-stars" role="img" aria-label={`${r.rating} out of 5 stars`}>
                  {'★'.repeat(r.rating)}
                </div>
                <blockquote>
                  <p>“{r.text}”</p>
                </blockquote>
                <figcaption>
                  <b>{r.displayName}</b> {reviewSourceLabels[r.source]}
                </figcaption>
              </figure>
            </li>
          ))}
        </SwipeList>
      ) : (
        <p className="reviews-empty">Read what our customers say on Google.</p>
      )}
      {isDemoData && <p className="sv-demo">Sample reviews shown until Google reviews are connected.</p>}
    </section>
  );
}

const contactIcons = {
  chat: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.1Z" />
      <path d="M9 10.5c.5 1.8 2.2 3.5 4 4" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
};

// Contact hero: the live map (tinted navy, decorative and non-interactive) fills the screen; a paper card holds the
// headline, live open status, the three ways to reach us and the hours. Fills one screen with the banner + navbar.
export function ContactHero() {
  const actions = [
    { icon: contactIcons.chat, label: 'WhatsApp us', value: 'Replies during opening hours', href: whatsappLink(), note: ' (opens WhatsApp)' },
    { icon: contactIcons.phone, label: 'Call us', value: phone.display, href: `tel:${phone.tel}` },
    { icon: contactIcons.pin, label: 'Get directions', value: address.street, href: mapsLink, note: ' (opens Google Maps)' },
  ];
  return (
    <section className="ch">
      {/* Decorative backdrop: inert keeps the map's own controls out of the tab order; "Get directions" is the real link. */}
      <div className="ch-map" aria-hidden="true" inert>
        <iframe title="Map of Visionary Eyecare, OUG Parklane" src={mapsEmbed} tabIndex={-1} referrerPolicy="no-referrer-when-downgrade" />
        <span className="ch-pin" />
      </div>
      <div className="ch-card">
        <Label>Contact &amp; visit</Label>
        <h1>
          Come and see us <em>at OUG Parklane.</em>
        </h1>
        <p className="ch-status">
          <OpenStatus fallback="Open daily" />
        </p>
        <ul className="ch-actions" role="list">
          {actions.map((a) => (
            <li key={a.label}>
              <a href={a.href} target={a.href.startsWith('tel:') ? undefined : '_blank'} rel="noreferrer">
                <span className="ch-ico">{a.icon}</span>
                <span className="ch-txt">
                  <b>{a.label}</b>
                  <small>{a.value}</small>
                </span>
                <span className="ch-arrow" aria-hidden="true">
                  →
                </span>
                {a.note && <span className="sr-only">{a.note}</span>}
              </a>
            </li>
          ))}
        </ul>
        <dl className="ch-hours">
          {hours.map((h) => (
            <div key={h.days}>
              <dt>{h.days}</dt>
              <dd>{h.time}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

// Contact: the real shop (interior + eye-test room) beside one Google review, so reviews show on this page too.
export async function ContactVisit() {
  const [items, google] = await Promise.all([reviewsRepo.listPublic(50), statsRepo.get()]);
  const r = items.length ? items[2 % items.length] : null;
  const count = google.totalReviews?.toLocaleString('en-MY') ?? google.totalLabel;
  return (
    <section className="cv" aria-labelledby="cv-title">
      <div className="cv-photos">
        <div className="cv-main">
          <Media id="storeInterior" sizes="(max-width: 860px) 100vw, 46vw" />
        </div>
        <figure className="cv-card">
          <span className="cv-img">
            <Media id="storeEyeExam" sizes="240px" />
          </span>
          <figcaption>Our eye test room</figcaption>
        </figure>
      </div>
      <div className="cv-copy">
        <Label light>Try them on</Label>
        <h2 id="cv-title">
          Glasses look different on your face. <em>Come and see.</em>
        </h2>
        {r && (
          <figure className="cv-quote">
            <div className="cv-stars" role="img" aria-label={`${r.rating} out of 5 stars`}>
              {'★'.repeat(r.rating)}
            </div>
            <blockquote>
              <p>“{r.text}”</p>
            </blockquote>
            <figcaption>
              <b>{r.displayName}</b>
              <span className="sr-only">,</span> {reviewSourceLabels[r.source]}
            </figcaption>
          </figure>
        )}
        <p className="cv-count">
          <strong>{count}</strong> reviews on Google ·{' '}
          <a href={reviewsLink} target="_blank" rel="noreferrer">
            Read them <span aria-hidden="true">→</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>{' '}
          · <Link href="/review">Leave a review</Link>
        </p>
        {isDemoData && <p className="cv-demo">Sample review shown until Google reviews are connected.</p>}
      </div>
    </section>
  );
}

// Home: triptych of photo panels leading to the other pages (client motion lives in ExplorePanels).
export function Explore() {
  const rows: ExploreRow[] = [
    {
      href: '/about',
      label: 'About us',
      title: 'The people behind the lenses.',
      text: 'How we work, and what a visit with us looks like, step by step.',
      cta: 'Our story',
      media: 'exploreAbout',
      focus: '78% 45%',
    },
    {
      href: '/services',
      label: 'Services & Collections',
      title: 'Frames, lenses and the full collection.',
      text: `Every service, and frame labels from premium to affordable${promo.active ? ', plus our current lens offer' : ''}.`,
      cta: 'Browse services',
      media: 'exploreServices',
      focus: '68% 50%',
    },
    {
      href: '/contact',
      label: 'Contact',
      title: 'Say hello, or drop by.',
      text: 'Send an enquiry, check our opening hours and find us at OUG Parklane.',
      cta: 'Plan your visit',
      media: 'exploreContact',
      focus: '41% 50%',
    },
  ];
  return <ExplorePanels rows={rows} />;
}

type FAQProps = {
  items: Faq[];
  label: string;
  title: string;
  accent: string;
  intro: string;
  quote?: string;
  link?: { href: string; label: string };
};


/** Structured data for search engines. `<` is escaped so text can never close the script tag. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}

// FAQ as a short chat with the team (FaqChat). The page's quote, if any, becomes the team's opening message.
export function FAQ({ items, label, title, accent, intro, quote, link }: FAQProps) {
  const headingId = `faq-${label.replace(/\W+/g, '-').toLowerCase()}`;
  // Every question and answer is in the page HTML (FaqChat), so FAQPage markup matches visible content.
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  return (
    <section className="faq section" aria-labelledby={headingId}>
      <JsonLd data={faqLd} />
      <div className="faq-head">
        <Label>{label}</Label>
        <h2 id={headingId}>
          {title} <em>{accent}</em>
        </h2>
        <p>{intro}</p>
      </div>
      <FaqChat
        items={items}
        greeting={quote ? quote.replace(/[“”"]/g, '') : 'Hi! Tap a question and we will answer right here.'}
        links={
          <div className="chat-links">
            <a className="btn btn-navy btn-sm" href={enquiryLink} target="_blank" rel="noreferrer">
              WhatsApp us<span className="sr-only"> (opens WhatsApp)</span>
            </a>
            {link && (
              <Link className="btn-text" href={link.href}>
                {link.label}
              </Link>
            )}
          </div>
        }
      />
    </section>
  );
}

export function WhatsApp() {
  return (
    <a className="floating-wa" href={enquiryLink} target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z" />
      </svg>
      <span>Chat with us</span>
    </a>
  );
}
