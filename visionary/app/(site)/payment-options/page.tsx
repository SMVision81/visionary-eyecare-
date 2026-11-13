import type { Metadata } from 'next';
import { FAQ, PaymentOptions } from '@/components/site/Blocks';
import { faqs, payment } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Payment Options: 0% Instalment Plans',
  description: `Pay for glasses and eyecare in 0% instalments over up to ${payment.months} months on purchases of ${payment.minimum} and above, with participating banks, BNPL providers and e-wallets.`,
  alternates: { canonical: '/payment-options' },
};

export default function PaymentOptionsPage() {
  return (
    <main id="main">
      <PaymentOptions />
      <FAQ
        items={faqs.payment}
        label="Before you pay"
        title="Instalments,"
        accent="answered."
        intro="Cards, providers, minimum spend and how long it takes."
        link={{ href: '/contact', label: 'Or send an enquiry →' }}
      />
    </main>
  );
}
