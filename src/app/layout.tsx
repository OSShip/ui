import type { Metadata } from 'next';
import { AppProviders } from '@/components/providers/AppProviders';
import { Navbar } from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'OSShip',
  description: 'Open Source Mentorship Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <Navbar />
          <main className="main">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
