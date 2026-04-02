import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dress Claude — Trouve ta palette de couleurs idéale',
  description: 'Application de colorimétrie et de conseil vestimentaire personnalisé.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50`}>
        <Navbar />
        <main className="md:ml-20 pb-20 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  )
}
