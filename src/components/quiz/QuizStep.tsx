interface QuizOption {
  value: string
  label: string
  swatch?: string
}

interface QuizStepProps {
  question: string
  subtitle?: string
  options: QuizOption[]
  selected: string | null
  onSelect: (value: string) => void
}

export default function QuizStep({ question, subtitle, options, selected, onSelect }: QuizStepProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{question}</h2>
      {subtitle && <p className="text-gray-500 mb-6 text-sm">{subtitle}</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selected === opt.value
                ? 'border-black bg-gray-50 scale-[1.02]'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            {opt.swatch && (
              <div
                className="w-10 h-10 rounded-lg mb-2 border border-gray-100"
                style={{ backgroundColor: opt.swatch }}
              />
            )}
            <span className="text-sm font-medium">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
