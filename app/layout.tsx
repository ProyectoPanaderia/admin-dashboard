import './globals.css';
import { SessionProvider } from "next-auth/react";
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'Panadería Santa Anita',
  description:
    'Sistema de gestión para la Panadería Santa Anita',
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>      
      <Analytics />
    </html>
  );
}

