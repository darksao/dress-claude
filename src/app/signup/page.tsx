'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Gender } from '@/types'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!gender) { setError('Choisis ton genre pour personnaliser ton avatar.'); return }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').update({ gender }).eq('id', data.user.id)
    }

    router.push('/quiz')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-8">Créer un compte</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black transition-colors bg-white"
          />
          <input
            type="password"
            placeholder="Mot de passe (6 caractères min.)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black transition-colors bg-white"
          />
          <div>
            <p className="text-sm text-gray-500 mb-2">Genre (pour ton avatar)</p>
            <div className="flex gap-3">
              {(['male', 'female'] as Gender[]).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 py-3 rounded-xl border-2 transition-colors font-medium ${
                    gender === g ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {g === 'male' ? '👨 Homme' : '👩 Femme'}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-black font-medium underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
