import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alliance Portal',
  description: 'ホワサバ同盟 総合管理システム',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
