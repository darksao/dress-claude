import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getArticleBySlug, ARTICLES } from '@/lib/guide/articles'
import AuthGuard from '@/components/layout/AuthGuard'

export function generateStaticParams() {
  return ARTICLES.map(a => ({ slug: a.slug }))
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug)
  if (!article) notFound()

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto p-6">
        <Link href="/guide" className="text-sm text-purple-500 hover:underline mb-6 block">← Retour au guide</Link>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">{article.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold">{article.title}</h1>
            <p className="text-sm text-gray-400">{article.readingTime} min de lecture</p>
          </div>
        </div>
        <div className="prose prose-purple max-w-none">
          {article.content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-8 mb-3">{line.slice(3)}</h2>
            if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold mt-6 mb-2">{line.slice(4)}</h3>
            if (line.startsWith('- ')) return <li key={i} className="ml-4 text-gray-700">{line.slice(2)}</li>
            if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold mt-4 text-gray-800">{line.slice(2, -2)}</p>
            if (line.trim() === '') return <div key={i} className="mt-2" />
            return <p key={i} className="text-gray-700 leading-relaxed">{line}</p>
          })}
        </div>
      </div>
    </AuthGuard>
  )
}
