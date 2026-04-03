import Link from 'next/link'

const SEASON_FAMILIES = [
  { name: 'Printemps', emoji: '🌸', color: 'bg-pink-50', text: 'text-pink-700', desc: 'Couleurs chaudes et lumineuses' },
  { name: 'Été', emoji: '🌊', color: 'bg-blue-50', text: 'text-blue-700', desc: 'Couleurs fraîches et douces' },
  { name: 'Automne', emoji: '🍂', color: 'bg-orange-50', text: 'text-orange-700', desc: 'Couleurs chaudes et profondes' },
  { name: 'Hiver', emoji: '❄️', color: 'bg-indigo-50', text: 'text-indigo-700', desc: 'Couleurs vives et contrastées' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 md:py-32">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Dress{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            Claude
          </span>
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-500 max-w-md">
          Découvre quelles couleurs te mettent en valeur et compose des tenues harmonieuses.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/quiz"
            className="px-8 py-4 bg-black text-white rounded-full text-lg font-medium hover:bg-gray-800 transition-colors"
          >
            📝 Faire le quiz
          </Link>
          <Link
            href="/quiz/photo"
            className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-full text-lg font-medium hover:border-gray-400 transition-colors"
          >
            📸 Analyser avec une photo
          </Link>
        </div>
        <Link
          href="/login"
          className="mt-4 text-sm text-gray-400 hover:text-gray-600"
        >
          Déjà un compte ? Se connecter
        </Link>
      </section>

      {/* Season families */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-center mb-10">4 familles, 12 saisons</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SEASON_FAMILIES.map(s => (
            <div key={s.name} className={`${s.color} rounded-2xl p-6 text-center`}>
              <span className="text-4xl">{s.emoji}</span>
              <h3 className={`mt-3 font-semibold ${s.text}`}>{s.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
