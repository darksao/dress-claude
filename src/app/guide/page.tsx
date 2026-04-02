import Link from 'next/link'
import { ARTICLES } from '@/lib/guide/articles'
import AuthGuard from '@/components/layout/AuthGuard'

export default function GuidePage() {
  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Guide colorimétrie</h1>
        <p className="text-gray-500 mb-8">Tout comprendre pour habiller votre saison.</p>
        <div className="space-y-4">
          {ARTICLES.map(article => (
            <Link key={article.slug} href={`/guide/${article.slug}`}
              className="block p-5 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all">
              <div className="flex items-start gap-4">
                <span className="text-3xl">{article.emoji}</span>
                <div>
                  <h2 className="font-semibold text-gray-900">{article.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{article.summary}</p>
                  <p className="text-xs text-purple-400 mt-2">{article.readingTime} min de lecture</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AuthGuard>
  )
}
