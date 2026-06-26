import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'OSShip — Open Source Mentorship',
  description: 'Paid mentorship on real OSS projects with transparent payouts and live sessions.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header header-landing">
          <Link href="/" className="logo">osship</Link>
          <nav>
            <Link href="/#about">about</Link>
            <Link href="/#how">how it works</Link>
            <Link href="/#listings">listings</Link>
            <Link href="/login">login</Link>
            <Link href="/register" className="nav-cta">get started</Link>
          </nav>
        </header>
        <main className="main">{children}</main>
      </body>
    </html>
  );
}
