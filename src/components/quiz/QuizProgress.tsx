export default function QuizProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i <= step ? 'bg-black' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}
