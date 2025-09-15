import type { Metadata } from 'next'
import { Inter, Merriweather, Lora } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/auth-provider'

// Navigation removed - dashboard pages have their own sidebar navigation

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

const lora = Lora({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-lora',
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
    <html lang="en" className={`${inter.variable} ${merriweather.variable} ${lora.variable}`}>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}