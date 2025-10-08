import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthSessionProvider } from '@/components/providers/session-provider';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Chasing Cats Club',
  description:
    'Membership community and educational hub for wildlife lovers learning from Rachel and Sebastian about finding and photographing wild cats.'
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-[#F5F1E3] text-night">
        <AuthSessionProvider session={session}>
          <Navbar />
          <main className="flex-1 pb-24">{children}</main>
          <Footer />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
