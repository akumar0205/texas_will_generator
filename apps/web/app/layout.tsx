import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Texas Will Generator',
  description: 'Texas-only document preparation workflow. Not legal advice.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
