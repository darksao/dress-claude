import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dress Claude — Trouve ta palette de couleurs idéale',
  description: 'Application de colorimétrie et de conseil vestimentaire personnalisé.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50`}>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
