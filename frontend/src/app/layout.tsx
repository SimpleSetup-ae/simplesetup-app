import type { Metadata } from 'next'
import { Inter, Merriweather } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import Navigation from '@/components/navigation'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const merriweather = Merriweather({ 
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Simple Setup - Corporate Tax Registration Agent',
  description: 'UAE Company Formation SaaS Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${merriweather.variable}`}>
        <body className={inter.className}>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main>
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}