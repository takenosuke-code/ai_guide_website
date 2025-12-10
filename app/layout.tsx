import type { Metadata } from 'next'
import { Inter, League_Spartan } from 'next/font/google'
import Script from 'next/script'
import GtagListener from './gtag-listener'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const leagueSpartan = League_Spartan({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-league-spartan',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI Tools Directory - Every AI, Clearly Explained',
  description: 'Discover and compare the best AI tools. Every AI tool explained with insights, pricing, reviews, and clear guides.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <html lang="ja" className={`${inter.variable} ${leagueSpartan.variable}`}>
      <body className="font-sans antialiased">
        {children}

        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', { send_page_view: false });
              `}
            </Script>
            <GtagListener />
          </>
        )}
      </body>
    </html>
  )
}
