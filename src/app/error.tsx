'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <p className="text-4xl mb-4">⚠️</p>
      <p className="text-gray-500 mb-6">Une erreur est survenue.</p>
      <button onClick={reset} className="px-6 py-3 bg-black text-white rounded-xl font-medium">
        Réessayer
      </button>
    </div>
  )
}
