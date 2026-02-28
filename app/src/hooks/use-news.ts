import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { NewsPost, NewsPostInput } from '@/types'

const QUERY_KEY = ['news_posts']

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Public query — returns only published/live-scheduled articles, newest first. */
export function usePublishedNews() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'published'],
    queryFn: async (): Promise<NewsPost[]> => {
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('news_posts')
        .select('*')
        .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
        .eq('coaches_only', false)
        .order('created_at', { ascending: false })

      if (error) return []
      return (data ?? []) as NewsPost[]
    },
  })
}

/** Coach Hub query — returns published/live-scheduled coaches-only posts, newest first. */
export function useCoachesNews() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'coaches'],
    queryFn: async (): Promise<NewsPost[]> => {
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('news_posts')
        .select('*')
        .eq('coaches_only', true)
        .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
        .order('created_at', { ascending: false })

      if (error) return []
      return (data ?? []) as NewsPost[]
    },
  })
}

/** Single article by ID — used on the article detail page. */
export function useNewsArticle(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    enabled: !!id,
    queryFn: async (): Promise<NewsPost | null> => {
      if (!id) return null
      const { data, error } = await supabase
        .from('news_posts')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (error) return null
      return data as NewsPost | null
    },
  })
}

/** Admin query — returns ALL articles regardless of status, newest first. */
export function useAllNews() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'all'],
    queryFn: async (): Promise<NewsPost[]> => {
      const { data, error } = await supabase
        .from('news_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) return []
      return (data ?? []) as NewsPost[]
    },
  })
}

// ---------------------------------------------------------------------------
// Storage helper
// ---------------------------------------------------------------------------

/**
 * Uploads a file to the news-images bucket and returns its public URL.
 * Path: {articleId}/{timestamp}.{ext}
 */
export async function uploadNewsImage(file: File, articleId: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${articleId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('news-images')
    .upload(path, file, { upsert: false })

  if (error) throw error

  const { data } = supabase.storage
    .from('news-images')
    .getPublicUrl(path)

  return data.publicUrl
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useAddNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: NewsPostInput & { id?: string }): Promise<NewsPost> => {
      const { data, error } = await supabase
        .from('news_posts')
        .insert(input)
        .select()
        .single()

      if (error) throw error
      return data as NewsPost
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useUpdateNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<NewsPostInput> }): Promise<NewsPost> => {
      const { data, error } = await supabase
        .from('news_posts')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as NewsPost
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useDeleteNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('news_posts')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
