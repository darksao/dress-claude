'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  children: React.ReactNode
  required?: boolean
}

export default function AuthGuard({ children, required = false }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        if (required) {
          router.push('/login')
        } else {
          setIsGuest(true)
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    })
  }, [router, required])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <>
      {isGuest && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm text-center py-2 px-4">
          Mode invité — <a href="/signup" className="underline font-medium">Crée un compte</a> pour sauvegarder tes résultats
        </div>
      )}
      {children}
    </>
  )
}
