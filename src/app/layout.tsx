import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ParallaxProvider } from '@/components/providers/parallax-provider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({
  weight: ['600', '700'],
  subsets: ['latin'],
  variable: '--font-cal',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Go-Moto | Ride More. Earn More. Stay on the Road.',
    template: '%s | Go-Moto',
  },
  description:
    'The operating system for bike ownership & earning. Rent, buy, or rent-to-own bikes and scooters for delivery, commuting, or fleet operations in South Africa.',
  keywords: [
    'bike rental',
    'scooter rental',
    'delivery bikes',
    'gig economy',
    'Uber Eats',
    'Mr D',
    'Bolt Food',
    'Sixty60',
    'South Africa',
    'rent to own',
    'motorcycle',
  ],
  authors: [{ name: 'Go-Moto' }],
  creator: 'Go-Moto',
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: 'https://go-moto.co.za',
    title: 'Go-Moto | Ride More. Earn More. Stay on the Road.',
    description:
      'The operating system for bike ownership & earning in South Africa.',
    siteName: 'Go-Moto',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Go-Moto | Ride More. Earn More. Stay on the Road.',
    description:
      'The operating system for bike ownership & earning in South Africa.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ParallaxProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ParallaxProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
