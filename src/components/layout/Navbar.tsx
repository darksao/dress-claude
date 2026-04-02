'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const NAV_ITEMS = [
  { href: '/avatar', label: 'Avatar', icon: '👤' },
  { href: '/wardrobe', label: 'Garde-robe', icon: '👗' },
  { href: '/guide', label: 'Guide', icon: '📖' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const publicPages = ['/', '/login', '/signup', '/guide']
  const isPublic = publicPages.some(p => pathname === p || pathname.startsWith('/guide/'))

  if (!user && isPublic) return null

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-20 flex-col items-center py-8 bg-white border-r border-gray-100 z-50">
        <Link href="/" className="text-xl font-bold mb-10 text-gray-900">DC</Link>
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl mb-2 w-16 transition-colors ${
              pathname === item.href ? 'bg-gray-100 text-black' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] text-center leading-tight">{item.label}</span>
          </Link>
        ))}
        <div className="mt-auto">
          {user && (
            <button onClick={handleLogout} title="Déconnexion" className="text-gray-400 hover:text-gray-600 text-lg">
              ↩️
            </button>
          )}
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around z-50">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 ${
              pathname === item.href ? 'text-black' : 'text-gray-400'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
