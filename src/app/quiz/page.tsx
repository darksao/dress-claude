'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { determineSeason } from '@/lib/colorimetry/quiz-scoring'
import AuthGuard from '@/components/layout/AuthGuard'
import QuizProgress from '@/components/quiz/QuizProgress'
import { QuizAnswers } from '@/types'

const SKIN_OPTIONS = [
  { value: 'very-fair', label: 'Porcelaine', swatch: '#FDF3E7' },
  { value: 'fair', label: 'Claire', swatch: '#F5DEB3' },
  { value: 'light-medium', label: 'Claire-moyenne', swatch: '#E8C99A' },
  { value: 'medium', label: 'Moyenne', swatch: '#D4A574' },
  { value: 'tan', label: 'Mate', swatch: '#C08B5C' },
  { value: 'deep', label: 'Foncée', swatch: '#8D5524' },
  { value: 'very-deep', label: 'Très foncée', swatch: '#4A2810' },
]

const UNDERTONE_OPTIONS = [
  { value: 'warm', label: 'Or & cuivré', subtitle: 'Les bijoux dorés me vont mieux', swatch: '#DAA520' },
  { value: 'cool', label: 'Argent & platine', subtitle: 'Les bijoux argentés me vont mieux', swatch: '#C0C0C0' },
  { value: 'neutral', label: 'Les deux !', subtitle: 'Tous les bijoux me vont', swatch: '#C4A882' },
]

const EYE_OPTIONS = [
  { value: 'blue', label: 'Bleu', swatch: '#4682B4' },
  { value: 'green', label: 'Vert', swatch: '#2E8B57' },
  { value: 'hazel', label: 'Noisette', swatch: '#8B7355' },
  { value: 'brown', label: 'Marron', swatch: '#8B4513' },
  { value: 'dark-brown', label: 'Marron foncé', swatch: '#3B2314' },
]

const HAIR_OPTIONS = [
  { value: 'platinum', label: 'Blond platine', swatch: '#E8E0D0' },
  { value: 'blonde', label: 'Blond', swatch: '#F5DEB3' },
  { value: 'light-brown', label: 'Châtain clair', swatch: '#C4A882' },
  { value: 'medium-brown', label: 'Châtain', swatch: '#8B7355' },
  { value: 'dark-brown', label: 'Brun', swatch: '#5C4033' },
  { value: 'black', label: 'Noir', swatch: '#1C1C1C' },
  { value: 'red', label: 'Roux', swatch: '#993333' },
  { value: 'auburn', label: 'Auburn', swatch: '#8B4513' },
  { value: 'grey', label: 'Gris / blanc', swatch: '#9E9E9E' },
]

const CONTRAST_OPTIONS = [
  {
    value: 'high',
    label: 'Très marquée',
    subtitle: 'ex: peau claire + cheveux noirs, ou peau foncée + cheveux très clairs',
    swatches: ['#FDF3E7', '#1C1C1C'],
  },
  {
    value: 'medium',
    label: 'Assez nette',
    subtitle: 'ex: peau claire + cheveux châtains, ou peau mate + cheveux bruns',
    swatches: ['#E8C99A', '#5C4033'],
  },
  {
    value: 'low',
    label: 'Subtile',
    subtitle: 'ex: peau dorée + cheveux châtain doré, ou peau foncée + cheveux noirs',
    swatches: ['#D4A574', '#8B7355'],
  },
]

const STEPS = ['skin_tone', 'undertone', 'eye_color', 'hair_color', 'contrast_level']

function SwatchButton({ swatch, label, subtitle, selected, onClick }: {
  swatch?: string; label: string; subtitle?: string; selected: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 rounded-xl border-2 transition-all text-left ${selected ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}
    >
      {swatch && <div className="w-8 h-8 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: swatch }} />}
      <div>
        <span className="font-medium text-sm text-gray-900">{label}</span>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
      {selected && <span className="ml-auto text-black">✓</span>}
    </button>
  )
}

export default function QuizPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [customHair, setCustomHair] = useState('#8B7355')
  const [loading, setLoading] = useState(false)

  function select(key: string, value: string) {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  async function handleNext() {
    if (step < STEPS.length - 1) { setStep(step + 1); return }

    setLoading(true)

    // Map extended values to the 3-tier system the scoring engine understands
    const skinMap: Record<string, string> = {
      'very-fair': 'fair', 'fair': 'fair', 'light-medium': 'fair',
      'medium': 'medium', 'tan': 'medium',
      'deep': 'deep', 'very-deep': 'deep',
    }
    const hairMap: Record<string, string> = {
      'platinum': 'blonde', 'blonde': 'blonde',
      'light-brown': 'light-brown', 'medium-brown': 'medium-brown',
      'dark-brown': 'dark-brown', 'black': 'black',
      'red': 'red', 'auburn': 'red', 'grey': 'light-brown',
    }
    const rawHair = answers.hair_color?.startsWith('custom:') ? 'medium-brown' : answers.hair_color
    const quizAnswers = {
      ...answers,
      skin_tone: skinMap[answers.skin_tone] || answers.skin_tone,
      hair_color: hairMap[rawHair] || rawHair,
    } as unknown as QuizAnswers

    const result = determineSeason(quizAnswers)

    // Save to localStorage for guest mode (keep original answers for display)
    const originalAnswers = { ...answers, skin_tone: skinMap[answers.skin_tone] || answers.skin_tone }
    localStorage.setItem('dc_quiz', JSON.stringify({ season: result.season, confidence: result.confidence, answers: originalAnswers }))

    // Save to Supabase if logged in
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('quiz_results').insert({ user_id: user.id, answers: quizAnswers, season_result: result.season, confidence: result.confidence })
      await supabase.from('profiles').update({ season: result.season, skin_tone: quizAnswers.skin_tone, eye_color: quizAnswers.eye_color, hair_color: quizAnswers.hair_color, contrast_level: quizAnswers.contrast_level }).eq('id', user.id)
    }

    router.push(`/result?season=${result.season}&confidence=${result.confidence}`)
  }

  const key = STEPS[step]
  const canProceed = !!answers[key]

  return (
    <AuthGuard>
      <div className="max-w-lg mx-auto px-6 py-12">
        <QuizProgress step={step} total={STEPS.length} />

        {step === 0 && (
          <>
            <h2 className="text-2xl font-bold mb-1">Quelle est ta carnation ?</h2>
            <p className="text-gray-400 text-sm mb-6">Choisis le ton de peau le plus proche du tien.</p>
            <div className="space-y-2">
              {SKIN_OPTIONS.map(o => (
                <SwatchButton key={o.value} swatch={o.swatch} label={o.label} selected={answers.skin_tone === o.value} onClick={() => select('skin_tone', o.value)} />
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold mb-1">Quels bijoux te mettent le mieux en valeur ?</h2>
            <p className="text-gray-400 text-sm mb-6">C&apos;est la façon la plus simple de détecter ton sous-ton.</p>
            <div className="space-y-2">
              {UNDERTONE_OPTIONS.map(o => (
                <SwatchButton key={o.value} swatch={o.swatch} label={o.label} subtitle={o.subtitle} selected={answers.undertone === o.value} onClick={() => select('undertone', o.value)} />
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold mb-1">Quelle est ta couleur d&apos;yeux ?</h2>
            <p className="text-gray-400 text-sm mb-6">Choisis la teinte la plus proche.</p>
            <div className="space-y-2">
              {EYE_OPTIONS.map(o => (
                <SwatchButton key={o.value} swatch={o.swatch} label={o.label} selected={answers.eye_color === o.value} onClick={() => select('eye_color', o.value)} />
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-2xl font-bold mb-1">Quelle est ta couleur de cheveux ?</h2>
            <p className="text-gray-400 text-sm mb-6">Ta couleur actuelle (naturelle ou colorée).</p>
            <div className="space-y-2">
              {HAIR_OPTIONS.map(o => (
                <SwatchButton key={o.value} swatch={o.swatch} label={o.label} selected={answers.hair_color === o.value} onClick={() => select('hair_color', o.value)} />
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-gray-200">
              <input
                type="color"
                value={customHair}
                onChange={e => { setCustomHair(e.target.value); select('hair_color', 'custom:' + e.target.value) }}
                className="w-10 h-10 rounded-full cursor-pointer border-0 bg-transparent"
              />
              <div>
                <p className="font-medium text-sm text-gray-900">Couleur personnalisée</p>
                <p className="text-xs text-gray-400">Bleu, rose, violet... choisis ta vraie couleur</p>
              </div>
              {answers.hair_color?.startsWith('custom:') && <span className="ml-auto text-black">✓</span>}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-2xl font-bold mb-1">Compare ta peau et tes cheveux</h2>
            <p className="text-gray-400 text-sm mb-6">À quel point sont-ils différents l&apos;un de l&apos;autre ?</p>
            <div className="space-y-2">
              {CONTRAST_OPTIONS.map(o => (
                <button
                  key={o.value}
                  onClick={() => select('contrast_level', o.value)}
                  className={`flex items-center gap-4 w-full p-4 rounded-xl border-2 transition-all text-left ${answers.contrast_level === o.value ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}
                >
                  <div className="flex -space-x-2 flex-shrink-0">
                    {o.swatches.map((s, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white" style={{ backgroundColor: s }} />
                    ))}
                  </div>
                  <div>
                    <span className="font-medium text-sm text-gray-900">{o.label}</span>
                    <p className="text-xs text-gray-400">{o.subtitle}</p>
                  </div>
                  {answers.contrast_level === o.value && <span className="ml-auto text-black">✓</span>}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              ← Retour
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed || loading}
            className="flex-1 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-30"
          >
            {loading ? 'Analyse...' : step === STEPS.length - 1 ? 'Voir mon résultat →' : 'Suivant →'}
          </button>
        </div>
      </div>
    </AuthGuard>
  )
}
