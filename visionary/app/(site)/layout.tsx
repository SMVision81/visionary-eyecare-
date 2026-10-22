import type { Metadata } from 'next';
import '../styles/tokens.css';
import '../styles/site.css';
import { fontVars } from '../fonts';
import Banner from '@/components/site/Banner';
import Navbar from '@/components/site/Navbar';
import Footer from '@/components/site/Footer';
import { WhatsApp } from '@/components/site/Blocks';
import { brands, siteUrl } from '@/lib/site';
import MotionProvider from '@/components/motion/MotionProvider';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Eye Test & Optical Shop, OUG Parklane KL | Visionary Eyecare', template: '%s | Visionary Eyecare' },
  description:
    `Eye tests by our in-house optometrist, ${brands.length} frame and sunglass labels and contact lenses at OUG Parklane, near Old Klang Road. WhatsApp us in one tap.`,
  openGraph: { siteName: 'Visionary Eyecare', locale: 'en_MY', type: 'website' },
  twitter: { card: 'summary_large_image' },
};

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVars}>
      <body>
        <MotionProvider>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Banner />
          <Navbar />
          {children}
          <Footer />
          <WhatsApp />
        </MotionProvider>
      </body>
    </html>
  );
}
