import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import { useNewsArticle } from '@/hooks/use-news'
import { useAuth } from '@/hooks/use-auth'
import { NewsShareButtons } from '@/components/shared/news-share-buttons'

export function NewsArticlePage() {
  const { id } = useParams<{ id: string }>()
  const { data: post, isLoading } = useNewsArticle(id)
  const { user, loading: authLoading } = useAuth()

  if (isLoading || authLoading) {
    return (
      <div className="pt-24 pb-20">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-64 bg-muted rounded-lg" />
            <div className="h-3 bg-muted rounded w-20" />
            <div className="h-8 bg-muted rounded w-2/3" />
            <div className="space-y-3">
              <div className="h-3 bg-muted rounded" />
              <div className="h-3 bg-muted rounded" />
              <div className="h-3 bg-muted rounded w-4/5" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!post || (post.coaches_only && !user)) {
    return (
      <div className="pt-24 pb-20">
        <div className="container px-4 text-center">
          <p className="text-muted-foreground mb-4">Article not found.</p>
          <Link
            to="/news"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft size={14} /> Back to news
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-20">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto">

          {/* Back link */}
          <Link
            to="/news"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Back to news
          </Link>

          {/* Cover image */}
          {post.cover_image_url && (
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full rounded-lg mb-8"
            />
          )}

          {/* Date */}
          <p className="text-xs text-muted-foreground mb-3">
            {format(new Date(post.created_at), 'd MMM yyyy')}
          </p>

          {/* Title */}
          <h1 className="font-heading text-3xl md:text-4xl uppercase text-foreground mb-8 leading-tight">
            {post.title}
          </h1>

          {/* Body — TipTap HTML */}
          <div
            className="prose prose-sm max-w-none text-foreground
                       prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-wide
                       prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                       prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
                       prose-strong:text-foreground prose-li:text-foreground"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          {/* Additional images */}
          {post.images && post.images.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4 mt-10 pt-8 border-t border-border">
              {post.images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="rounded-lg w-full object-cover"
                />
              ))}
            </div>
          )}

          {/* Share */}
          <div className="mt-10 pt-6 border-t border-border">
            <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground mb-3">
              Share this article
            </p>
            <NewsShareButtons articleId={id} />
          </div>

        </div>
      </div>
    </div>
  )
}
