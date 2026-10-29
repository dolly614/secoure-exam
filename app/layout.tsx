import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Secure Exam Portal',
  description: 'Online examination system with proctoring features like fullscreen lock, tab switch detection, and cheating prevention.',
  openGraph: {
    title: 'Secure Exam Portal',
    description: 'Online examination system with proctoring features like fullscreen lock, tab switch detection, and cheating prevention.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
