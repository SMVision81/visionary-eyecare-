import type { Metadata } from 'next';
import { ContactHero, ContactVisit, FAQ, Label } from '@/components/site/Blocks';
import ContactForm from '@/components/site/ContactForm';
import { faqs, phone, whatsappLink } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact & Directions, OUG Parklane KL',
  description: 'Find us at OUG Parklane, near Old Klang Road, KL: opening hours, directions, WhatsApp and phone, or send an enquiry and we reply on WhatsApp.',
  alternates: { canonical: '/contact' },
};

export default function Contact() {
  return (
    <main id="main">
      <ContactHero />
      <section className="enquiry">
        <div className="enquiry-wrap">
          <div className="enq-intro">
            <Label light>Write to us</Label>
            <p className="enq-big">
              Prefer to write? <em>We reply on WhatsApp.</em>
            </p>
            <p>Tell us what you need, from an eye test to a new pair or contact lenses, and we will get back to you.</p>
            <div className="enq-actions">
              <a className="btn btn-crimson btn-sm" href={whatsappLink()} target="_blank" rel="noreferrer">
                WhatsApp us<span className="sr-only"> (opens WhatsApp)</span>
              </a>
              <a className="btn btn-glass btn-sm" href={`tel:${phone.tel}`}>
                Call {phone.display}
              </a>
            </div>
          </div>
          <div className="enquiry-form">
            <div className="letter">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
      <ContactVisit />
      <FAQ
        items={faqs.contact}
        label="Practical details"
        title="Before you"
        accent="come."
        intro="Hours, replies and directions in a few lines."
      />
    </main>
  );
}
