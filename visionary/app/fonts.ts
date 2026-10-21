import { Cormorant_Garamond, Manrope } from 'next/font/google';

export const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

export const sans = Manrope({ subsets: ['latin'], variable: '--font-sans' });

export const fontVars = `${display.variable} ${sans.variable}`;
