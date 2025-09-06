import { Montserrat } from 'next/font/google';
import { Lusitana } from 'next/font/google';
import { Great_Vibes } from 'next/font/google';

export const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-greatvibes',
});


export const montserrat = Montserrat({
  subsets: ['latin'],
});

export const lusitana = Lusitana({
  subsets: ['latin'],
  weight: ['400', '700'],
});

