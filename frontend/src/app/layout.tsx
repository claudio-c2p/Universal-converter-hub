import type { Metadata, Viewport } from 'next';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/600.css';
import './globals.css';
import { ThemeProvider } from '@/components/ui/ThemeProvider';

export const metadata: Metadata = {
  metadataBase: new URL('https://c2p.com.br'),
  title: {
    default: 'C2P — Universal Converter Hub',
    template: '%s · C2P',
  },
  description:
    'Mais de 50 conversores gratuitos e instantâneos: PDF, Word, Excel, JSON, XML, legendas, geodados, fontes, SQL e muito mais. Sem cadastro, sem anúncios.',
  keywords: ['conversor de arquivos', 'PDF', 'converter PDF', 'converter Word', 'JSON para CSV', 'conversor online gratuito'],
  authors: [{ name: 'C2P' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'C2P — Universal Converter Hub',
    title: 'C2P — Universal Converter Hub',
    description: 'Mais de 50 conversores gratuitos e instantâneos para PDF, Word, dados e muito mais.',
  },
  twitter: {
    card: 'summary',
    title: 'C2P — Universal Converter Hub',
    description: 'Mais de 50 conversores gratuitos e instantâneos para PDF, Word, dados e muito mais.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F8F8' },
    { media: '(prefers-color-scheme: dark)',  color: '#0A0A0A' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      {/*
        O script inline abaixo lê o tema salvo (localStorage) ANTES da primeira
        pintura do browser, evitando o "flash" de tema claro em usuários de dark mode.
        É injetado diretamente no <head> pelo Next.js (dangerouslySetInnerHTML).
      */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (t === 'dark' || (!t && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
