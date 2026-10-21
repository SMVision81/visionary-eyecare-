import { hours, phone } from './site';

// Quick WhatsApp reply templates for the admin enquiry composer.
// Add or edit templates here; `{name}` is replaced with the customer's first name.
export type ReplyTemplate = { id: string; label: string; body: string };

const hoursText = hours.map((h) => `${h.days}: ${h.time}`).join(', ');

export const replyTemplates: ReplyTemplate[] = [
  {
    id: 'general',
    label: 'General reply',
    body: 'Hi {name}, thank you for contacting Visionary Eyecare! ',
  },
  {
    id: 'eye-test',
    label: 'Eye test booking',
    body: `Hi {name}, thank you for your enquiry. You're welcome to come in for an eye test with our in-house optometrist. We're open ${hoursText}. What day and time suits you?`,
  },
  {
    id: 'lens-promo',
    label: 'Buy 3 Free 1 lenses',
    body: 'Hi {name}, yes, our Buy 3 Free 1 promotion is available on selected Bionics, Manxion and FreshLady contact lenses. Do you know your lens power, or would you like us to check it for you in store?',
  },
  {
    id: 'frames',
    label: 'Frames & spectacles',
    body: 'Hi {name}, thanks for asking about frames. We carry 15 brands, including AKONI, PROJEKT PRODUKT and MOVITRA, which are exclusive to us in the area. Drop by and our optician will help you find the right fit.',
  },
  {
    id: 'call-back',
    label: 'Ask to call',
    body: `Hi {name}, thank you for your enquiry. It may be easier to discuss this over a quick call. Feel free to call us on ${phone.display}, or let us know a good time to call you.`,
  },
];

export const fillTemplate = (body: string, fullName: string) => body.replace(/\{name\}/g, fullName.trim().split(/\s+/)[0] ?? '');
