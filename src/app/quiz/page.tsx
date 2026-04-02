'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { determineSeason } from '@/lib/colorimetry/quiz-scoring'
import AuthGuard from '@/components/layout/AuthGuard'
import QuizStep from '@/components/quiz/QuizStep'
import QuizProgress from '@/components/quiz/QuizProgress'
import { QuizAnswers } from '@/types'

const STEPS = [
  {
    question: 'Quelle est ta carnation ?',
    subtitle: 'Choisis le ton de peau le plus proche du tien.',
    key: 'skin_tone' as const,
    options: [
      { value: 'fair', label: 'Claire', swatch: '#FDEBD0' },
      { value: 'medium', label: 'Moyenne', swatch: '#D4A574' },
      { value: 'deep', label: 'Foncée', swatch: '#8D5524' },
    ],
  },
  {
    question: 'Quel est ton sous-ton ?',
    subtitle: 'Regarde les veines de ton poignet : vertes = chaud, bleues = froid, mélangé = neutre.',
    key: 'undertone' as const,
    options: [
      { value: 'warm', label: 'Chaud (doré)', swatch: '#DAA520' },
      { value: 'cool', label: 'Froid (rosé)', swatch: '#DB7093' },
      { value: 'neutral', label: 'Neutre', swatch: '#C4A882' },
    ],
  },
  {
    question: "Quelle est ta couleur d'yeux ?",
    subtitle: 'Choisis la teinte la plus proche.',
    key: 'eye_color' as const,
    options: [
      { value: 'blue', label: 'Bleu', swatch: '#4682B4' },
      { value: 'green', label: 'Vert', swatch: '#2E8B57' },
      { value: 'hazel', label: 'Noisette', swatch: '#8B7355' },
      { value: 'brown', label: 'Marron', swatch: '#8B4513' },
      { value: 'dark-brown', label: 'Marron foncé', swatch: '#3B2314' },
    ],
  },
  {
    question: 'Quelle est ta couleur de cheveux naturelle ?',
    key: 'hair_color' as const,
    options: [
      { value: 'blonde', label: 'Blond', swatch: '#F5DEB3' },
      { value: 'light-brown', label: 'Châtain clair', swatch: '#C4A882' },
      { value: 'medium-brown', label: 'Châtain', swatch: '#8B7355' },
      { value: 'dark-brown', label: 'Brun', swatch: '#5C4033' },
      { value: 'black', label: 'Noir', swatch: '#1C1C1C' },
      { value: 'red', label: 'Roux', swatch: '#993333' },
    ],
  },
  {
    question: 'Quel est ton niveau de contraste ?',
    subtitle: 'Le contraste entre ta peau, tes yeux et tes cheveux.',
    key: 'contrast_level' as const,
    options: [
      { value: 'high', label: 'Fort (ex: peau claire + cheveux noirs)' },
      { value: 'medium', label: 'Moyen' },
      { value: 'low', label: 'Faible (ex: peau claire + cheveux blonds)' },
    ],
  },
]

export default function QuizPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function handleSelect(value: string) {
    const key = STEPS[step].key
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  async function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
      return
    }

    setLoading(true)
    const quizAnswers = answers as unknown as QuizAnswers
    const result = determineSeason(quizAnswers)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('quiz_results').insert({
      user_id: user.id,
      answers: quizAnswers,
      season_result: result.season,
      confidence: result.confidence,
    })

    await supabase.from('profiles').update({
      season: result.season,
      skin_tone: quizAnswers.skin_tone,
      eye_color: quizAnswers.eye_color,
      hair_color: quizAnswers.hair_color,
      contrast_level: quizAnswers.contrast_level,
    }).eq('id', user.id)

    router.push(`/result?season=${result.season}&confidence=${result.confidence}`)
  }

  const currentStep = STEPS[step]
  const canProceed = !!answers[currentStep.key]

  return (
    <AuthGuard>
      <div className="max-w-lg mx-auto px-6 py-12">
        <QuizProgress step={step} total={STEPS.length} />
        <QuizStep
          question={currentStep.question}
          subtitle={currentStep.subtitle}
          options={currentStep.options}
          selected={answers[currentStep.key] || null}
          onSelect={handleSelect}
        />
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ← Retour
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed || loading}
            className="flex-1 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-30"
          >
            {loading ? 'Analyse...' : step === STEPS.length - 1 ? 'Voir mon résultat' : 'Suivant →'}
          </button>
        </div>
      </div>
    </AuthGuard>
  )
}
