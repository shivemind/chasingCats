import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthSessionProvider } from '@/components/providers/session-provider';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'Chasing Cats Club',
  description:
    'Membership community and educational hub for wildlife lovers learning from Rachel and Sebastian about finding and photographing wild cats.'
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await auth();

  return (
    <html lang="en">
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
