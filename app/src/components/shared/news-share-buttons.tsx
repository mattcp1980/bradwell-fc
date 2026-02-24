import { useState } from 'react'
import { Link } from 'lucide-react'

type Props = { articleId?: string }

export function NewsShareButtons({ articleId }: Props = {}) {
  const shareUrl = articleId
    ? `${window.location.origin}/news/${articleId}`
    : `${window.location.origin}/news`
  const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`

  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex items-center gap-3">
      <a
        href={fbShare}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#1877F2] transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
        <span>Share</span>
      </a>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy link"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Link size={13} />
        <span>{copied ? 'Copied!' : 'Copy link'}</span>
      </button>
    </div>
  )
}
