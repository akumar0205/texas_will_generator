import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Texas Will Generator — Get Your Will Done Properly',
  description:
    'Create a complete Texas last will and testament, self-proving affidavit, and signing checklist. No legal jargon. Just your documents, ready to print and sign.',
  openGraph: {
    title: 'Texas Will Generator — Get Your Will Done Properly',
    description:
      'Create a complete Texas last will and testament, self-proving affidavit, and signing checklist. No legal jargon. Just your documents, ready to print and sign.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
