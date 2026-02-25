/**
 * rss Edge Function
 *
 * Returns an RSS 2.0 feed of published Bradwell FC news articles.
 * Includes <media:content> tags so Make.com / IFTTT can attach the
 * cover image when posting to Facebook or other platforms.
 *
 * Public — no authentication required.
 * URL: /functions/v1/rss
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SITE_URL = 'https://bradwellfc.online'
const FEED_TITLE = 'Bradwell FC — Club News'
const FEED_DESCRIPTION = 'The latest news from Bradwell FC'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  )

  const { data: posts, error } = await supabase
    .from('news_posts')
    .select('id, title, excerpt, cover_image_url, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return new Response('Failed to load news', { status: 500, headers: corsHeaders })
  }

  const items = (posts ?? []).map((post) => {
    const url = `${SITE_URL}/news/${post.id}`
    const pubDate = new Date(post.created_at).toUTCString()
    const mediaTag = post.cover_image_url
      ? `<media:content url="${escXml(post.cover_image_url)}" medium="image" />`
      : ''

    return `
    <item>
      <title>${escXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escXml(post.excerpt ?? '')}</description>
      <pubDate>${pubDate}</pubDate>
      ${mediaTag}
    </item>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${FEED_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${FEED_DESCRIPTION}</description>
    <language>en-gb</language>
    <atom:link href="${SITE_URL}/functions/v1/rss" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300', // 5 minute cache
    },
  })
})

/** Escape characters that are invalid inside XML text/attribute values. */
function escXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
